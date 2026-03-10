'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  deriveKey,
  generateSalt,
  generateRecoveryKey,
  saltToHex,
  encryptKeyWithRecoveryKey,
  evaluatePassphraseStrength,
  type PassphraseStrength,
} from '../lib/vaultCrypto';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface VaultSetupProps {
  onComplete: (key: CryptoKey) => void;
  onCancel: () => void;
}

const strengthColors: Record<PassphraseStrength, string> = {
  weak: '#d32f2f',
  fair: '#ed6c02',
  good: '#2e7d32',
  strong: '#1b5e20',
};

const VaultSetup: React.FC<VaultSetupProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryConfirmed, setRecoveryConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const strength = evaluatePassphraseStrength(passphrase);
  const passphrasesMatch = passphrase === confirmPassphrase && confirmPassphrase.length > 0;
  const canProceedStep0 = passphrase.length >= 12 && passphrasesMatch && strength.strength !== 'weak';

  const steps = ['Create Passphrase', 'Save Recovery Key', 'Complete'];

  const handleCreatePassphrase = async () => {
    if (!canProceedStep0) return;
    // Generate the recovery key to show in step 2
    const key = generateRecoveryKey();
    setRecoveryKey(key);
    setActiveStep(1);
  };

  const handleCopyRecoveryKey = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = recoveryKey;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintRecoveryKey = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>MyLifeFolio Recovery Key</title></head><body style="font-family: monospace; padding: 40px;">
        <h2>MyLifeFolio Vault Recovery Key</h2>
        <p><strong>KEEP THIS SAFE.</strong> This is the only way to recover your vault if you forget your passphrase.</p>
        <div style="background: #f5f5f5; padding: 20px; border: 2px solid #333; font-size: 18px; letter-spacing: 1px; word-break: break-all;">
        ${recoveryKey}
        </div>
        <p style="margin-top: 20px; color: #666;">Date generated: ${new Date().toLocaleDateString()}</p>
        <p style="color: #d32f2f;"><strong>Store this in a secure location (e.g., safe, safe deposit box). Do not store it digitally.</strong></p>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleFinalize = async () => {
    if (!user || !recoveryConfirmed) return;
    setSaving(true);
    setError('');

    try {
      const salt = generateSalt();
      const masterKey = await deriveKey(passphrase, salt);
      const recoveryKeyCiphertext = await encryptKeyWithRecoveryKey(masterKey, recoveryKey);

      const { error: dbError } = await supabase.from('credential_vault_settings').upsert({
        user_id: user.id,
        salt: saltToHex(salt),
        recovery_key_ciphertext: recoveryKeyCiphertext,
        vault_enabled: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (dbError) throw dbError;

      setActiveStep(2);
      // Short delay then hand the key back
      setTimeout(() => onComplete(masterKey), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up vault');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, maxWidth: 600, mx: 'auto', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <LockIcon sx={{ color: '#00695c', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Set Up Your Credentials Vault
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Step 0: Create passphrase */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Create a Vault Master Passphrase to encrypt your credentials. This is separate from your
            MyLifeFolio login password. Choose something strong and memorable.
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="Vault Master Passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            helperText={passphrase.length > 0 ? strength.feedback : 'Minimum 12 characters'}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 1 }}
          />

          {passphrase.length > 0 && (
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
              <Typography variant="caption" sx={{ color: strengthColors[strength.strength], fontWeight: 600, mt: 0.5, display: 'block' }}>
                {strength.strength.charAt(0).toUpperCase() + strength.strength.slice(1)}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            type="password"
            label="Confirm Passphrase"
            value={confirmPassphrase}
            onChange={(e) => setConfirmPassphrase(e.target.value)}
            error={confirmPassphrase.length > 0 && !passphrasesMatch}
            helperText={confirmPassphrase.length > 0 && !passphrasesMatch ? 'Passphrases do not match' : ' '}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onCancel} color="inherit">Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreatePassphrase}
              disabled={!canProceedStep0}
              sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
            >
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 1: Save recovery key */}
      {activeStep === 1 && (
        <Box>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Save this recovery key now. It will only be shown once. If you lose your passphrase and
            this recovery key, your vault data cannot be recovered.
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

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
              <IconButton onClick={handleCopyRecoveryKey} size="small">
                {copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Print recovery key">
              <IconButton onClick={handlePrintRecoveryKey} size="small">
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, cursor: 'pointer' }}
            onClick={() => setRecoveryConfirmed(!recoveryConfirmed)}
          >
            <input
              type="checkbox"
              checked={recoveryConfirmed}
              onChange={(e) => setRecoveryConfirmed(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              I have saved my recovery key in a secure location
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setActiveStep(0)} color="inherit">Back</Button>
            <Button
              variant="contained"
              onClick={handleFinalize}
              disabled={!recoveryConfirmed || saving}
              sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
            >
              {saving ? 'Setting up...' : 'Activate Vault'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Complete */}
      {activeStep === 2 && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: '#2e7d32', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Vault Activated
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your credentials vault is ready to use. Redirecting...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VaultSetup;
