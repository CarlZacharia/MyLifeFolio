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
import { supabase } from '../lib/supabase';

interface LoginProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setError('Please confirm your email address before signing in. Check your inbox for a confirmation link.');
          return;
        }
        onSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setResetSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            src="/logo.jpg"
            alt="MyLifeFolio"
            sx={{
              height: 80,
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

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            margin="normal"
            size="small"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>

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
