import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

type Step = 'email' | 'code';

const FamilyAccessLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Check if user already has an active session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data: authRows } = await supabase
          .from('folio_authorized_users')
          .select('*')
          .eq('is_active', true);
        if (authRows && authRows.length > 0) {
          navigate('/family-portal');
          return;
        }
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate]);

  // Navigate to family portal on successful sign-in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/family-portal');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // DEV BYPASS: In dev mode, sign in with password instead of OTP.
  // To use: create user sonny@gmail.com in Supabase dashboard with password "devtest123"
  const isDevMode = import.meta.env.DEV;
  const DEV_PASSWORD = 'devtest123';

  // Step 1: send OTP code (skipped in dev mode)
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isDevMode) {
        // In dev mode, skip sending real OTP — go straight to sign-in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: DEV_PASSWORD,
        });
        if (signInError) {
          setError('Dev login failed: ' + signInError.message + '. Make sure the user exists in Supabase with password "devtest123".');
        } else {
          // Hard redirect — react-router navigate doesn't work reliably after auth changes
          window.location.href = '/family-portal';
          return;
        }
      } else {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: { shouldCreateUser: true },
        });
        if (otpError) {
          if (otpError.message.includes('not allowed') || otpError.message.includes('Signups not allowed')) {
            setError('This email is not authorized to access any folio. Please contact your family member to add you.');
          } else {
            setError(otpError.message);
          }
        } else {
          setStep('code');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP code (not used in dev mode)
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: 'email',
      });
      if (verifyError) {
        setError('Invalid or expired code. Please try again.');
      }
      // On success, onAuthStateChange above handles navigation
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e8eaf6', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockOpenIcon sx={{ fontSize: 48, color: '#1a237e', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 600 }}>
              Family Access Portal
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
              Access your family member's life folio
            </Typography>
          </Box>

          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email}
                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' }, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : isDevMode ? 'Dev Sign In' : 'Send me a code'}
              </Button>

              {isDevMode && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  DEV MODE: Will sign in with password "devtest123" — no OTP needed.
                  Create the user in Supabase dashboard first.
                </Alert>
              )}

              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                You must be pre-authorized by the account holder to access their folio.
              </Typography>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Code sent to <strong>{email}</strong>
              </Alert>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
                Enter the sign-in code from your email. It expires in 10 minutes.
              </Typography>

              <TextField
                fullWidth
                label="Sign-in code"
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 12)); setError(''); }}
                required
                autoFocus
                inputProps={{ inputMode: 'numeric', maxLength: 12 }}
                placeholder="12345678"
                sx={{ mb: 2 }}
              />

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || code.length < 1}
                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' }, py: 1.5, mb: 1.5 }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verify Code & Access Folio'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => { setStep('email'); setCode(''); setError(''); }}
                  sx={{ color: '#1a237e' }}
                >
                  Use a different email or resend code
                </Button>
              </Box>
            </form>
          )}
        </Paper>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
          MyLifeFolio &mdash; Secure Family Access
        </Typography>
      </Container>
    </Box>
  );
};

export default FamilyAccessLogin;
