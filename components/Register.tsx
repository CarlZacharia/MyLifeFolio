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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
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
    stateOfDomicile: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
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
            state_of_domicile: formData.stateOfDomicile,
            telephone: formData.telephone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (googleError) {
        setError(googleError.message);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! Please check your email to verify your account.
          </Alert>
          <Button fullWidth variant="outlined" onClick={onSwitchToLogin}>
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Sign up with Google
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            or register with email
          </Typography>
        </Divider>

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
            label="Address"
            value={formData.address}
            onChange={handleChange('address')}
            margin="normal"
            size="small"
            multiline
            rows={2}
          />

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
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            margin="normal"
            size="small"
            required
            helperText="At least 6 characters"
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            margin="normal"
            size="small"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
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
      </Paper>
    </Box>
  );
};

export default Register;
