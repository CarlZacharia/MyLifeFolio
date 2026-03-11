'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { supabase } from '../lib/supabase';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
];

interface RegisterProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    stateOfDomicile: '',
    zip: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    signatureName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
    if (field === 'password' || field === 'confirmPassword') {
      setPasswordMismatch(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(event.target.value);
    setFormData((prev) => ({ ...prev, telephone: formatted }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.agreedToTerms) {
      setError('You must agree to the terms and disclaimer to create an account');
      return false;
    }
    if (!formData.signatureName.trim()) {
      setError('Please type your name to acknowledge the agreement');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            state_of_domicile: formData.stateOfDomicile,
            zip: formData.zip,
            telephone: formData.telephone,
            agreed_to_terms: true,
            agreed_to_terms_at: new Date().toISOString(),
            agreed_to_terms_signature: formData.signatureName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        setSuccess(true);
        // Don't call onSuccess — user must confirm their email first
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful!
          </Alert>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            Please check your email to confirm your account.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            We sent a confirmation link to <strong>{formData.email}</strong>.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Click the link in the email to activate your account, then return here to sign in.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 106,
              height: 106,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #000000, #c9a227)',
              padding: '3px',
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src="/mylifefolio.png"
                alt="MyLifeFolio"
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
          <Typography
            sx={{
              mt: 1,
              fontSize: '12px',
              fontStyle: 'italic',
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            A service of Senior Care Resources LLC — All Rights Reserved
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Create Account on MyLifeFolio
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.name}
            onChange={handleChange('name')}
            margin="normal"
            size="small"
            required
          />

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
            label="Street Address"
            value={formData.address}
            onChange={handleChange('address')}
            margin="normal"
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="City"
              value={formData.city}
              onChange={handleChange('city')}
              margin="normal"
              size="small"
              sx={{ flex: 2 }}
            />
            <FormControl margin="normal" size="small" sx={{ flex: 1.5 }}>
              <InputLabel>State</InputLabel>
              <Select
                value={formData.state}
                label="State"
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
              >
                {US_STATES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Zip Code"
              value={formData.zip}
              onChange={handleChange('zip')}
              margin="normal"
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>State of Domicile</InputLabel>
            <Select
              value={formData.stateOfDomicile}
              label="State of Domicile"
              onChange={(e) => setFormData((prev) => ({ ...prev, stateOfDomicile: e.target.value }))}
            >
              {US_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Telephone"
            value={formData.telephone}
            onChange={handlePhoneChange}
            margin="normal"
            size="small"
            placeholder="(555) 555-5555"
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
            helperText="At least 6 characters"
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

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            onBlur={() => {
              if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                setPasswordMismatch(true);
              }
            }}
            margin="normal"
            size="small"
            required
            error={passwordMismatch}
            helperText={passwordMismatch ? 'Passwords do not match' : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreedToTerms}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    agreedToTerms: e.target.checked,
                    signatureName: e.target.checked ? prev.signatureName : ''
                  }));
                  setError(null);
                }}
                sx={{ alignSelf: 'flex-start', mt: -0.5 }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
              I understand that MyLifeFolio is owned and operated by Senior Care Resources LLC 
(SeniorCareRes.com), a life documentation and planning platform. I agree that all 
content, videos, tools, and forms on this website are for informational and 
organizational purposes only and do not constitute legal advice. I acknowledge that 
my use of this platform does not create an attorney-client relationship with Senior 
Care Resources LLC, Zacharia Frey PLLC, or any of their attorneys or affiliates. 
I understand that nothing provided through this platform should be relied upon as 
legal advice, and that I should consult a licensed attorney before making any legal, 
financial, or estate planning decisions. For estate planning and elder law services 
in Pennsylvania or Florida, Zacharia Frey PLLC (ZacFreyLaw.com) is available for 
consultation.
              </Typography>
            }
            sx={{
              mt: 2,
              alignItems: 'flex-start',
              '& .MuiFormControlLabel-label': { ml: 0.5 }
            }}
          />

          {formData.agreedToTerms && (
            <TextField
              fullWidth
              label="Type your full name to acknowledge"
              value={formData.signatureName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, signatureName: e.target.value }));
                setError(null);
              }}
              margin="normal"
              size="small"
              required
              placeholder="Your full legal name"
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  fontStyle: 'italic',
                }
              }}
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !formData.agreedToTerms || !formData.signatureName.trim() || passwordMismatch || !formData.password || formData.password !== formData.confirmPassword}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Button variant="text" onClick={onSwitchToLogin} sx={{ textTransform: 'none', p: 0 }}>
            Sign in
          </Button>
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
          © 2026 Senior Care Resources LLC. All rights reserved. Access to this website is strictly limited to individuals for personal use in connection with Estate Planning and Elder Law matters. Any other use is expressly prohibited.  This application may utilize artificial intelligence to assist in the preparation of materials; all AI-generated content is subject to attorney review before it may be relied upon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
