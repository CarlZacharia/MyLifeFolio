'use client';

import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setErrorMessage(error.message);
          setStatus('error');
          return;
        }

        if (session) {
          setStatus('success');
          // Brief delay so user sees confirmation, then redirect
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          // Check URL for error params (expired/used link)
          const params = new URLSearchParams(window.location.hash.substring(1));
          const errorDesc = params.get('error_description');
          if (errorDesc) {
            setErrorMessage(errorDesc);
          } else {
            setErrorMessage('The sign-in link may have expired or already been used. Please request a new one.');
          }
          setStatus('error');
        }
      } catch {
        setErrorMessage('An unexpected error occurred. Please try again.');
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#e8eaf6' }}>
      <Paper sx={{ p: 4, maxWidth: 420, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Signing you in...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your sign-in link.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              You're signed in!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting you to MyLifeFolio...
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Sign-in failed
            </Typography>
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {errorMessage}
            </Alert>
            <Button
              variant="contained"
              onClick={() => { window.location.href = '/'; }}
            >
              Return to Sign In
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AuthCallback;
