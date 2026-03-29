import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Alert, CircularProgress,
  Link,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface UnlockScreenProps {
  onUnlock: (passphrase: string) => Promise<{ error: string | null }>;
}

const UnlockScreen: React.FC<UnlockScreenProps> = ({ onUnlock }) => {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setLoading(true);
    setError(null);
    const result = await onUnlock(passphrase);
    if (result.error) {
      setError(result.error);
      setPassphrase('');
    }
    setLoading(false);
  };

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
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight={700} color="primary.dark" gutterBottom>
          MyLifeFolio
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your passphrase to unlock your data
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="password"
            label="Passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoFocus
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !passphrase.trim()}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Unlock'}
          </Button>
        </form>

        <Link
          component="button"
          variant="body2"
          onClick={() => setShowForgot(!showForgot)}
          sx={{ cursor: 'pointer' }}
        >
          Forgot your passphrase?
        </Link>

        {showForgot && (
          <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
            Your passphrase cannot be recovered. All data is encrypted locally
            and there is no server-side backup of your passphrase. If you have
            forgotten it, your data cannot be accessed.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default UnlockScreen;
