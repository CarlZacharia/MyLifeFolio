import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Alert, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SecurityIcon from '@mui/icons-material/Security';

interface SetupScreenProps {
  onSetup: (passphrase: string) => Promise<{ error: string | null }>;
}

const MIN_LENGTH = 12;

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetup }) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasMinLength = passphrase.length >= MIN_LENGTH;
  const hasUpperLower = /[a-z]/.test(passphrase) && /[A-Z]/.test(passphrase);
  const hasNumber = /\d/.test(passphrase);
  const matches = passphrase === confirm && confirm.length > 0;
  const isValid = hasMinLength && hasUpperLower && hasNumber && matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);
    const result = await onSetup(passphrase);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
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

        <form onSubmit={handleSubmit}>
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

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !isValid}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Passphrase & Continue'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SetupScreen;
