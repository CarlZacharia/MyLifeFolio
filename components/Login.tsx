'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../lib/AuthContext';
import { TurnstileWidget } from './TurnstileWidget';

interface LoginProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

type LoginMode = 'magic-link' | 'password';

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { signInWithMagicLink, signInWithPassword } = useAuth();
  const [mode, setMode] = useState<LoginMode>('magic-link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: magicError } = await signInWithMagicLink(email.trim(), captchaToken || undefined);
    setLoading(false);

    if (magicError) {
      setError(magicError);
      return;
    }
    setMagicLinkSent(true);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await signInWithPassword(email.trim(), password, captchaToken || undefined);
    setLoading(false);

    if (signInError) {
      setError(signInError);
      return;
    }
    onSuccess?.();
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    // Import supabase directly for password reset (one-off use)
    const { supabase } = await import('../lib/supabase');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetSent(true);
  };

  // Magic link sent confirmation
  if (magicLinkSent) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          </Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Check your email!
          </Alert>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 1 }}>
            We sent a sign-in link to <strong>{email}</strong>.
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}>
            Click the link in the email to sign in. It expires in 1 hour and can only be used once.
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            When you check your email, it will give you a link that will log you into MyLifeFolio.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Password reset sent confirmation
  if (resetSent) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset email sent! Please check your inbox.
          </Alert>
          <Button fullWidth variant="outlined" onClick={() => setResetSent(false)}>
            Back to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/logodark.svg"
            alt="MyLifeFolio"
            sx={{
              height: 120,
              width: 'auto',
              borderRadius: 1,
            }}
          />
        </Box>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Sign In to MyLifeFolio
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {mode === 'magic-link' ? (
          <>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
              Enter your email and we'll send you a secure sign-in link.
            </Typography>
            <Box component="form" onSubmit={handleMagicLink}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                margin="normal"
                size="small"
                required
                autoFocus
              />

              <Box sx={{ mt: 2 }}>
                <TurnstileWidget
                  onToken={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !email.trim() || !captchaToken}
                startIcon={!loading && <EmailIcon />}
                sx={{ mt: 2, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send me a sign-in link'}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => { setMode('password'); setError(null); }}
                sx={{ cursor: 'pointer' }}
              >
                Prefer a password? Sign in here
              </Link>
            </Typography>
          </>
        ) : (
          <>
            <Box component="form" onSubmit={handlePasswordLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                margin="normal"
                size="small"
                required
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                margin="normal"
                size="small"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  sx={{ cursor: 'pointer' }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Box sx={{ mt: 2 }}>
                <TurnstileWidget
                  onToken={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !email.trim() || !password || !captchaToken}
                sx={{ mt: 2, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => { setMode('magic-link'); setError(null); }}
                sx={{ cursor: 'pointer' }}
              >
                Prefer a magic link? Sign in here
              </Link>
            </Typography>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <Button variant="text" onClick={onSwitchToRegister} sx={{ textTransform: 'none', p: 0 }}>
            Register
          </Button>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Are you a family member?{' '}
          <Link
            href="/family-access"
            variant="body2"
            sx={{ cursor: 'pointer', fontWeight: 500 }}
          >
            Access the Family Portal
          </Link>
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 3,
            color: 'text.secondary',
            fontSize: '0.7rem',
            lineHeight: 1.4,
          }}
        >
          © 2026 Senior Care Resources LLC. All rights reserved. Access to this website is strictly limited to individuals for personal use in connection with Estate Planning and Elder Law matters. Any other use is expressly prohibited. This application may utilize artificial intelligence to assist in the preparation of materials; all AI-generated content is subject to attorney review before it may be relied upon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
