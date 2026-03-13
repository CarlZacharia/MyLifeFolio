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

const TURNSTILE_ENABLED = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

interface LoginProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

type LoginMode = 'otp' | 'password';
type OtpStep = 'email' | 'code';

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { sendOtpCode, verifyEmailOtp, signInWithPassword } = useAuth();

  const [mode, setMode] = useState<LoginMode>('otp');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // ── OTP: Step 1 — send code ───────────────────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    setError(null);
    const { error: sendError } = await sendOtpCode(email.trim(), captchaToken || undefined);
    setLoading(false);
    if (sendError) { setError(sendError); return; }
    setOtpStep('code');
  };

  // ── OTP: Step 2 — verify code ─────────────────────────────────────────────
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError('Please enter the code from your email'); return; }
    setLoading(true);
    setError(null);
    const { error: verifyError } = await verifyEmailOtp(email.trim(), code.trim());
    setLoading(false);
    if (verifyError) { setError('Invalid or expired code. Please try again.'); return; }
    onSuccess?.();
  };

  // ── Password login ────────────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    setLoading(true);
    setError(null);
    const { error: signInError } = await signInWithPassword(email.trim(), password, captchaToken || undefined);
    setLoading(false);
    if (signInError) { setError(signInError); return; }
    onSuccess?.();
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email.trim()) { setError('Please enter your email address first'); return; }
    setLoading(true);
    setError(null);
    const { supabase } = await import('../lib/supabase');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setResetSent(true);
  };

  const switchMode = (m: LoginMode) => {
    setMode(m);
    setOtpStep('email');
    setError(null);
    setCode('');
    setCaptchaToken(null);
  };

  // ── Password reset confirmation ───────────────────────────────────────────
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
        {/* Logo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/logodark.svg"
            alt="MyLifeFolio"
            sx={{ height: 120, width: 'auto', borderRadius: 1 }}
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

        {/* ── OTP mode ── */}
        {mode === 'otp' ? (
          <>
            {otpStep === 'email' ? (
              <>
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                  Enter your email and we'll send you a 6-digit sign-in code.
                </Typography>
                <Box component="form" onSubmit={handleSendCode}>
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
                    disabled={loading || !email.trim() || (TURNSTILE_ENABLED && !captchaToken)}
                    startIcon={!loading && <EmailIcon />}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Send me a code'}
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Code sent to <strong>{email}</strong>
                </Alert>
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                  Check your email and enter the sign-in code below. It expires in 10 minutes.
                </Typography>
                <Box component="form" onSubmit={handleVerifyCode}>
                  <TextField
                    fullWidth
                    label="Sign-in code"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 12)); setError(null); }}
                    margin="normal"
                    size="small"
                    required
                    autoFocus
                    inputProps={{ inputMode: 'numeric', maxLength: 12 }}
                    placeholder="12345678"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || code.length < 1}
                    sx={{ mt: 2, mb: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify Code & Sign In'}
                  </Button>
                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => { setOtpStep('email'); setCode(''); setError(null); }}
                      sx={{ cursor: 'pointer' }}
                    >
                      Use a different email or resend code
                    </Link>
                  </Box>
                </Box>
              </>
            )}

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => switchMode('password')}
                sx={{ cursor: 'pointer' }}
              >
                Prefer a password? Sign in here
              </Link>
            </Typography>
          </>
        ) : (
          /* ── Password mode ── */
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
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link component="button" type="button" variant="body2" onClick={handleForgotPassword} sx={{ cursor: 'pointer' }}>
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
                disabled={loading || !email.trim() || !password || (TURNSTILE_ENABLED && !captchaToken)}
                sx={{ mt: 2, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              <Link component="button" type="button" variant="body2" onClick={() => switchMode('otp')} sx={{ cursor: 'pointer' }}>
                Prefer a code? Sign in here
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
          <Link href="/family-access" variant="body2" sx={{ cursor: 'pointer', fontWeight: 500 }}>
            Access the Family Portal
          </Link>
        </Typography>

        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.4 }}
        >
          © 2026 Senior Care Resources LLC. All rights reserved. Access to this website is strictly
          limited to individuals for personal use in connection with Estate Planning and Elder Law
          matters. Any other use is expressly prohibited. This application may utilize artificial
          intelligence to assist in the preparation of materials; all AI-generated content is subject
          to attorney review before it may be relied upon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
