import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Alert, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, Switch, FormControlLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';

interface SetupScreenProps {
  onSetup: (passphrase: string, vaultExtraSecurity: boolean) => Promise<{ error: string | null }>;
}

const MIN_LENGTH = 12;

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetup }) => {
  const [step, setStep] = useState<'passphrase' | 'vault-option'>('passphrase');
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vaultExtraSecurity, setVaultExtraSecurity] = useState(false);

  const hasMinLength = passphrase.length >= MIN_LENGTH;
  const hasUpperLower = /[a-z]/.test(passphrase) && /[A-Z]/.test(passphrase);
  const hasNumber = /\d/.test(passphrase);
  const matches = passphrase === confirm && confirm.length > 0;
  const isValid = hasMinLength && hasUpperLower && hasNumber && matches;

  const handlePassphraseNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setStep('vault-option');
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    const result = await onSetup(passphrase, vaultExtraSecurity);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const ReqIcon: React.FC<{ met: boolean }> = ({ met }) =>
    met ? <CheckCircleIcon color="success" fontSize="small" /> :
    <RadioButtonUncheckedIcon color="disabled" fontSize="small" />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 480,
          width: '100%',
          borderRadius: 3,
        }}
      >
        {/* Step 1: Passphrase Creation */}
        {step === 'passphrase' && (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="primary.dark" gutterBottom>
                Welcome to MyLifeFolio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a passphrase to protect your data. This passphrase encrypts
                all your information locally on this device.
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Important:</strong> Your passphrase cannot be recovered. There
              is no "forgot password" option. Please store it somewhere safe.
            </Alert>

            <form onSubmit={handlePassphraseNext}>
              <TextField
                fullWidth
                type="password"
                label="Create Passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                autoFocus
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 1 }}
              />

              <List dense sx={{ mb: 1 }}>
                <ListItem disablePadding sx={{ pl: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><ReqIcon met={hasMinLength} /></ListItemIcon>
                  <ListItemText
                    primary="At least 12 characters"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pl: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><ReqIcon met={hasUpperLower} /></ListItemIcon>
                  <ListItemText
                    primary="Upper and lowercase letters"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pl: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><ReqIcon met={hasNumber} /></ListItemIcon>
                  <ListItemText
                    primary="At least one number"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>

              <TextField
                fullWidth
                type="password"
                label="Confirm Passphrase"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                error={confirm.length > 0 && !matches}
                helperText={confirm.length > 0 && !matches ? 'Passphrases do not match' : ''}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!isValid}
              >
                Continue
              </Button>
            </form>
          </>
        )}

        {/* Step 2: Vault Security Option */}
        {step === 'vault-option' && (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <ShieldIcon sx={{ fontSize: 48, color: '#00695c', mb: 1 }} />
              <Typography variant="h5" fontWeight={700} color="primary.dark" gutterBottom>
                Credentials Vault Security
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MyLifeFolio includes a Credentials Vault for storing online account
                passwords and sensitive credentials.
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{ p: 2.5, mb: 3, bgcolor: vaultExtraSecurity ? '#f3e5f5' : '#e8f5e9', borderRadius: 2 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={vaultExtraSecurity}
                    onChange={(e) => setVaultExtraSecurity(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight={600}>
                    Use a separate passphrase for the Credentials Vault
                  </Typography>
                }
              />

              <Box sx={{ mt: 1.5, pl: 6 }}>
                {vaultExtraSecurity ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <LockIcon sx={{ fontSize: 18, color: '#7b1fa2', mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        You'll create a second passphrase specifically for the Credentials Vault
                        when you first access it.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LockIcon sx={{ fontSize: 18, color: '#7b1fa2', mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        Provides an extra layer of protection if someone accesses
                        your unlocked app.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32', mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        Your app passphrase will also protect the Credentials Vault — no
                        extra passphrase to remember.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32', mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        You can always enable a separate passphrase later in Settings.
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => setStep('passphrase')}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Finish Setup'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SetupScreen;
