import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const FamilyAccessLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Check if user already has an active session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        // Check if they have family access authorization
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

  // Handle the OTP callback (magic link redirect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/family-portal');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/family-portal`,
        },
      });

      if (otpError) {
        if (otpError.message.includes('not allowed') || otpError.message.includes('Signups not allowed')) {
          setError('This email is not authorized to access any folio. Please contact your family member to add you.');
        } else {
          setError(otpError.message);
        }
      } else {
        setSent(true);
      }
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

          {sent ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Check your email!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                We've sent a secure login link to <strong>{email}</strong>.
                Click the link in the email to access the folio. The link expires in 1 hour.
              </Typography>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
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

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email}
                sx={{
                  bgcolor: '#1a237e',
                  '&:hover': { bgcolor: '#000051' },
                  py: 1.5,
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send Login Link'}
              </Button>

              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                You must be pre-authorized by the account holder to access their folio.
              </Typography>
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
