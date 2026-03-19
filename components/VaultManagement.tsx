'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import LockResetIcon from '@mui/icons-material/LockReset';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  deriveKey,
  generateSalt,
  generateRecoveryKey,
  saltToHex,
  encryptKeyWithRecoveryKey,
  encryptField,
  decryptField,
  evaluatePassphraseStrength,
  type PassphraseStrength,
} from '../lib/vaultCrypto';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface VaultManagementProps {
  vaultKey: CryptoKey;
  onVaultKeyChanged: (newKey: CryptoKey) => void;
}

const strengthColors: Record<PassphraseStrength, string> = {
  weak: '#d32f2f',
  fair: '#ed6c02',
  good: '#2e7d32',
  strong: '#1b5e20',
};

const ENCRYPTED_FIELDS = [
  'enc_password',
  'enc_pin',
  'enc_security_qa',
  'enc_backup_codes',
  'enc_authenticator_note',
  'enc_recovery_email',
] as const;

// ─── Component ──────────────────────────────────────────────────────────────

const VaultManagement: React.FC<VaultManagementProps> = ({
  vaultKey,
  onVaultKeyChanged,
}) => {
  const { user } = useAuth();

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Change passphrase state
  const [changeOpen, setChangeOpen] = useState(false);
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [changeStep, setChangeStep] = useState<'passphrase' | 'recovery' | 'done'>('passphrase');
  const [newRecoveryKey, setNewRecoveryKey] = useState('');
  const [recoveryConfirmed, setRecoveryConfirmed] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSaving, setChangeSaving] = useState(false);
  const [changeCopied, setChangeCopied] = useState(false);

  // Generate new recovery key state
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'confirm' | 'show' | 'done'>('confirm');
  const [recoverySaving, setRecoverySaving] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [recoveryUserConfirmed, setRecoveryUserConfirmed] = useState(false);

  const strength = evaluatePassphraseStrength(newPassphrase);
  const passphrasesMatch = newPassphrase === confirmPassphrase && confirmPassphrase.length > 0;
  const canProceed = newPassphrase.length >= 12 && passphrasesMatch && strength.strength !== 'weak';

  // ─── Change Passphrase Logic ───────────────────────────────────────────────

  const resetChangeState = () => {
    setNewPassphrase('');
    setConfirmPassphrase('');
    setChangeStep('passphrase');
    setNewRecoveryKey('');
    setRecoveryConfirmed(false);
    setChangeError('');
    setChangeSaving(false);
    setChangeCopied(false);
  };

  const handleOpenChange = () => {
    resetChangeState();
    setChangeOpen(true);
    setMenuOpen(false);
  };

  const handleCloseChange = () => {
    setChangeOpen(false);
    resetChangeState();
  };

  const handleChangeStep1 = () => {
    if (!canProceed) return;
    const key = generateRecoveryKey();
    setNewRecoveryKey(key);
    setChangeStep('recovery');
  };

  const handleChangeFinalize = async () => {
    if (!user || !recoveryConfirmed) return;
    setChangeSaving(true);
    setChangeError('');

    try {
      // 1. Generate new salt and derive new master key
      const newSalt = generateSalt();
      const newMasterKey = await deriveKey(newPassphrase, newSalt);

      // 2. Fetch all credentials encrypted with the old key
      const { data: credentials, error: fetchErr } = await supabase
        .from('credential_accounts')
        .select('id, enc_password, enc_pin, enc_security_qa, enc_backup_codes, enc_authenticator_note, enc_recovery_email')
        .eq('user_id', user.id);

      if (fetchErr) throw fetchErr;

      // 3. Re-encrypt each credential's fields with the new key
      if (credentials && credentials.length > 0) {
        for (const cred of credentials) {
          const row = cred as Record<string, string | null>;
          const updates: Record<string, string | null> = {};

          for (const field of ENCRYPTED_FIELDS) {
            const encValue = row[field];
            if (encValue) {
              try {
                const plaintext = await decryptField(encValue, vaultKey);
                updates[field] = await encryptField(plaintext, newMasterKey);
              } catch {
                // If decryption fails for a field, keep the old value
              }
            }
          }

          if (Object.keys(updates).length > 0) {
            const { error: updateErr } = await supabase
              .from('credential_accounts')
              .update(updates)
              .eq('id', row.id as string)
              .eq('user_id', user.id);

            if (updateErr) throw updateErr;
          }
        }
      }

      // 4. Encrypt new master key with new recovery key
      const recoveryKeyCiphertext = await encryptKeyWithRecoveryKey(newMasterKey, newRecoveryKey);

      // 5. Update vault settings
      const { error: dbErr } = await supabase
        .from('credential_vault_settings')
        .update({
          salt: saltToHex(newSalt),
          recovery_key_ciphertext: recoveryKeyCiphertext,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (dbErr) throw dbErr;

      // 6. Pass the new key back
      onVaultKeyChanged(newMasterKey);
      setChangeStep('done');
      setTimeout(() => handleCloseChange(), 2000);
    } catch (err) {
      setChangeError(err instanceof Error ? err.message : 'Failed to change passphrase');
    } finally {
      setChangeSaving(false);
    }
  };

  // ─── Generate New Recovery Key Logic ───────────────────────────────────────

  const resetRecoveryState = () => {
    setGeneratedRecoveryKey('');
    setRecoveryStep('confirm');
    setRecoverySaving(false);
    setRecoveryError('');
    setRecoveryCopied(false);
    setRecoveryUserConfirmed(false);
  };

  const handleOpenRecovery = () => {
    resetRecoveryState();
    setRecoveryOpen(true);
    setMenuOpen(false);
  };

  const handleCloseRecovery = () => {
    setRecoveryOpen(false);
    resetRecoveryState();
  };

  const handleGenerateRecoveryKey = async () => {
    if (!user) return;
    setRecoverySaving(true);
    setRecoveryError('');

    try {
      // Generate a new recovery key and wrap the current master key
      const newKey = generateRecoveryKey();
      const ciphertext = await encryptKeyWithRecoveryKey(vaultKey, newKey);

      // Update in DB
      const { error: dbErr } = await supabase
        .from('credential_vault_settings')
        .update({
          recovery_key_ciphertext: ciphertext,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (dbErr) throw dbErr;

      setGeneratedRecoveryKey(newKey);
      setRecoveryStep('show');
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : 'Failed to generate recovery key');
    } finally {
      setRecoverySaving(false);
    }
  };

  const handleRecoveryDone = () => {
    setRecoveryStep('done');
    setTimeout(() => handleCloseRecovery(), 1500);
  };

  // ─── Shared helpers ────────────────────────────────────────────────────────

  const handleCopy = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = (key: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>MyLifeFolio Recovery Key</title></head><body style="font-family: monospace; padding: 40px;">
        <h2>MyLifeFolio Vault Recovery Key</h2>
        <p><strong>KEEP THIS SAFE.</strong> This is the only way to recover your vault if you forget your passphrase.</p>
        <div style="background: #f5f5f5; padding: 20px; border: 2px solid #333; font-size: 18px; letter-spacing: 1px; word-break: break-all;">
        ${key}
        </div>
        <p style="margin-top: 20px; color: #666;">Date generated: ${new Date().toLocaleDateString()}</p>
        <p style="color: #d32f2f;"><strong>Store this in a secure location (e.g., safe, safe deposit box). Do not store it digitally.</strong></p>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // ─── Recovery Key Display (shared between both dialogs) ────────────────────

  const RecoveryKeyDisplay = ({
    recoveryKey,
    copied,
    onCopy,
    onPrint,
  }: {
    recoveryKey: string;
    copied: boolean;
    onCopy: () => void;
    onPrint: () => void;
  }) => (
    <>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Save this recovery key now. Your previous recovery key has been invalidated.
        If you lose your passphrase and this recovery key, your vault data cannot be recovered.
      </Alert>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 2,
          bgcolor: '#fafafa',
          fontFamily: 'monospace',
          fontSize: '0.95rem',
          wordBreak: 'break-all',
          letterSpacing: '0.5px',
          textAlign: 'center',
          border: '2px solid',
          borderColor: '#e65100',
        }}
      >
        {recoveryKey}
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
        <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
          <IconButton onClick={onCopy} size="small">
            {copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Print recovery key">
          <IconButton onClick={onPrint} size="small">
            <PrintIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Settings button */}
      <Tooltip title="Vault Settings">
        <Button
          size="small"
          startIcon={<SettingsIcon />}
          variant="outlined"
          onClick={() => setMenuOpen(true)}
          sx={{ borderColor: '#00695c', color: '#00695c' }}
        >
          Vault Settings
        </Button>
      </Tooltip>

      {/* Settings menu dialog */}
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Vault Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LockResetIcon />}
              onClick={handleOpenChange}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Change Passphrase</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Set a new vault master passphrase
                </Typography>
              </Box>
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<KeyIcon />}
              onClick={handleOpenRecovery}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Generate New Recovery Key</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Invalidates old key, creates a new one
                </Typography>
              </Box>
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Change Passphrase Dialog ──────────────────────────────────────── */}
      <Dialog open={changeOpen} onClose={handleCloseChange} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockResetIcon sx={{ color: '#00695c' }} />
          Change Vault Passphrase
        </DialogTitle>
        <DialogContent>
          {changeError && <Alert severity="error" sx={{ mb: 2 }}>{changeError}</Alert>}

          {changeStep === 'passphrase' && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Changing your passphrase will re-encrypt all stored credentials and generate a
                new recovery key. Your previous recovery key will be invalidated.
              </Alert>

              <TextField
                fullWidth
                type="password"
                label="New Vault Master Passphrase"
                value={newPassphrase}
                onChange={(e) => setNewPassphrase(e.target.value)}
                helperText={newPassphrase.length > 0 ? strength.feedback : 'Minimum 12 characters'}
                InputLabelProps={{ shrink: true }}
                autoFocus
                sx={{ mb: 1 }}
              />

              {newPassphrase.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: strengthColors[strength.strength],
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: strengthColors[strength.strength], fontWeight: 600, mt: 0.5, display: 'block' }}
                  >
                    {strength.strength.charAt(0).toUpperCase() + strength.strength.slice(1)}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                type="password"
                label="Confirm New Passphrase"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                error={confirmPassphrase.length > 0 && !passphrasesMatch}
                helperText={confirmPassphrase.length > 0 && !passphrasesMatch ? 'Passphrases do not match' : ' '}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {changeStep === 'recovery' && (
            <Box sx={{ pt: 1 }}>
              <RecoveryKeyDisplay
                recoveryKey={newRecoveryKey}
                copied={changeCopied}
                onCopy={() => handleCopy(newRecoveryKey, setChangeCopied)}
                onPrint={() => handlePrint(newRecoveryKey)}
              />

              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                onClick={() => setRecoveryConfirmed(!recoveryConfirmed)}
              >
                <input
                  type="checkbox"
                  checked={recoveryConfirmed}
                  onChange={(e) => setRecoveryConfirmed(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  I have saved my new recovery key in a secure location
                </Typography>
              </Box>
            </Box>
          )}

          {changeStep === 'done' && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Passphrase Changed
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Your vault has been re-encrypted with your new passphrase.
              </Typography>
            </Box>
          )}
        </DialogContent>

        {changeStep !== 'done' && (
          <DialogActions>
            <Button onClick={handleCloseChange} color="inherit">Cancel</Button>
            {changeStep === 'passphrase' && (
              <Button
                variant="contained"
                onClick={handleChangeStep1}
                disabled={!canProceed}
                sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
              >
                Continue
              </Button>
            )}
            {changeStep === 'recovery' && (
              <Button
                variant="contained"
                onClick={handleChangeFinalize}
                disabled={!recoveryConfirmed || changeSaving}
                sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
              >
                {changeSaving ? 'Changing passphrase...' : 'Change Passphrase'}
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>

      {/* ─── Generate New Recovery Key Dialog ──────────────────────────────── */}
      <Dialog open={recoveryOpen} onClose={handleCloseRecovery} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon sx={{ color: '#e65100' }} />
          Generate New Recovery Key
        </DialogTitle>
        <DialogContent>
          {recoveryError && <Alert severity="error" sx={{ mb: 2 }}>{recoveryError}</Alert>}

          {recoveryStep === 'confirm' && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This will invalidate your current recovery key. Only proceed if you have lost
                your recovery key or believe it has been compromised.
              </Alert>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                A new recovery key will be generated. Your passphrase and all stored credentials
                will remain unchanged.
              </Typography>
            </Box>
          )}

          {recoveryStep === 'show' && (
            <Box sx={{ pt: 1 }}>
              <RecoveryKeyDisplay
                recoveryKey={generatedRecoveryKey}
                copied={recoveryCopied}
                onCopy={() => handleCopy(generatedRecoveryKey, setRecoveryCopied)}
                onPrint={() => handlePrint(generatedRecoveryKey)}
              />

              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                onClick={() => setRecoveryUserConfirmed(!recoveryUserConfirmed)}
              >
                <input
                  type="checkbox"
                  checked={recoveryUserConfirmed}
                  onChange={(e) => setRecoveryUserConfirmed(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  I have saved my new recovery key in a secure location
                </Typography>
              </Box>
            </Box>
          )}

          {recoveryStep === 'done' && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Recovery Key Updated
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Your previous recovery key has been invalidated.
              </Typography>
            </Box>
          )}
        </DialogContent>

        {recoveryStep !== 'done' && (
          <DialogActions>
            <Button onClick={handleCloseRecovery} color="inherit">Cancel</Button>
            {recoveryStep === 'confirm' && (
              <Button
                variant="contained"
                onClick={handleGenerateRecoveryKey}
                disabled={recoverySaving}
                sx={{ bgcolor: '#e65100', '&:hover': { bgcolor: '#bf360c' } }}
              >
                {recoverySaving ? 'Generating...' : 'Generate New Key'}
              </Button>
            )}
            {recoveryStep === 'show' && (
              <Button
                variant="contained"
                onClick={handleRecoveryDone}
                disabled={!recoveryUserConfirmed}
                sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
              >
                Done
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default VaultManagement;
