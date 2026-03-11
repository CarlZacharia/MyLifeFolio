'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../lib/AuthContext';

interface ReauthGuardProps {
  children: React.ReactNode;
}

const ReauthGuard: React.FC<ReauthGuardProps> = ({ children }) => {
  const { isReauthenticated, reauthenticate, verifyReauthOtp, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'prompt' | 'verify'>('prompt');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isReauthenticated) {
    return <>{children}</>;
  }

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    const { error: reauthError } = await reauthenticate();
    setLoading(false);

    if (reauthError) {
      setError(reauthError);
      return;
    }
    setStep('verify');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);
    const { error: verifyError } = await verifyReauthOtp(otpCode.trim());
    setLoading(false);

    if (verifyError) {
      setError(verifyError);
      return;
    }

    // Success — close modal, children will render via isReauthenticated becoming true
    setShowModal(false);
    setStep('prompt');
    setOtpCode('');
    setError(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setStep('prompt');
    setOtpCode('');
    setError(null);
  };

  return (
    <>
      {/* Locked state — prompt user to verify */}
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <LockIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Identity Verification Required
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 400, mx: 'auto' }}>
          To access this sensitive section, we need to verify your identity.
          We'll send a one-time code to your email address.
        </Typography>
        <Button
          variant="contained"
          startIcon={<VerifiedUserIcon />}
          onClick={() => setShowModal(true)}
        >
          Verify My Identity
        </Button>
      </Box>

      {/* Verification dialog */}
      <Dialog
        open={showModal}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Verify Your Identity
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 'prompt' && (
            <>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                We'll send a one-time verification code to <strong>{user?.email}</strong>.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendCode}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
              </Button>
            </>
          )}

          {step === 'verify' && (
            <Box component="form" onSubmit={handleVerifyCode}>
              <Alert severity="info" sx={{ mb: 2 }}>
                An 8-digit code was sent to <strong>{user?.email}</strong>.
              </Alert>
              <TextField
                fullWidth
                label="Verification Code"
                value={otpCode}
                onChange={(e) => {
                  // Only allow digits, max 8
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setOtpCode(val);
                  setError(null);
                }}
                placeholder="00000000"
                size="small"
                autoFocus
                inputProps={{ maxLength: 8, inputMode: 'numeric', style: { letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' } }}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || otpCode.length < 8}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={handleSendCode}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                Resend code
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReauthGuard;
