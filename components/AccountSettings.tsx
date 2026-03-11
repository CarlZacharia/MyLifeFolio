'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import GavelIcon from '@mui/icons-material/Gavel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import LinkIcon from '@mui/icons-material/Link';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const theme = createTheme({
  palette: {
    primary: { main: '#1e3a5f', light: '#2d5a8e', dark: '#0f2744' },
    secondary: { main: '#c9a227', light: '#e8c547', dark: '#9a7b1a' },
    background: { default: '#faf9f7', paper: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#5a5a5a' },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Georgia", serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
  },
});

interface ProfileData {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  state_of_domicile: string;
  zip: string;
  telephone: string;
}

interface AccountSettingsProps {
  onNavigateBack: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onNavigateBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    state_of_domicile: '',
    zip: '',
    telephone: '',
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('name, email, address, city, state, state_of_domicile, zip, telephone')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No profile row yet — seed from auth metadata
          setProfileData({
            name: user.user_metadata?.name || '',
            email: user.email || '',
            address: user.user_metadata?.address || '',
            city: user.user_metadata?.city || '',
            state: user.user_metadata?.state || '',
            state_of_domicile: user.user_metadata?.state_of_domicile || '',
            zip: user.user_metadata?.zip || '',
            telephone: user.user_metadata?.telephone || '',
          });
        } else {
          throw new Error(fetchError.message);
        }
      } else if (data) {
        setProfileData({
          name: data.name || '',
          email: data.email || user.email || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          state_of_domicile: data.state_of_domicile || '',
          zip: data.zip || '',
          telephone: data.telephone || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Determine login method from user's app_metadata
  const providers = user?.app_metadata?.providers as string[] | undefined;
  const hasPassword = providers?.includes('email') ?? false;
  const loginMethod = hasPassword ? 'Email & Password' : 'Magic Link (passwordless)';

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* ── Top Bar ── */}
        <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
          <Toolbar>
            <Button startIcon={<ArrowBackIcon />} onClick={onNavigateBack} sx={{ color: 'white', mr: 2 }}>
              Back
            </Button>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
              Account Settings
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* ── Account Status Card ── */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, border: '1px solid #e0d9cf' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, color: 'primary.main' }}>
                    Account Status
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                      Status
                    </Typography>
                    <Chip label="Active" color="success" size="small" sx={{ fontWeight: 600 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                      Plan
                    </Typography>
                    <Chip label="Standard" variant="outlined" size="small" sx={{ fontWeight: 600, borderColor: 'secondary.main', color: 'secondary.dark' }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                        Member Since
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.95rem', fontWeight: 500 }}>
                      {memberSince}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3, borderColor: '#e0d9cf' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PaymentIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
                  <Typography sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.95rem', color: 'text.secondary' }}>
                    Payment and billing management coming soon.
                  </Typography>
                </Box>
              </Paper>

              {/* ── Personal Information (read-only, from registration) ── */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, border: '1px solid #e0d9cf' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, color: 'primary.main' }}>
                      Personal Information
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontStyle: 'italic' }}>
                  This information was provided at registration and is read-only.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {/* Full Name */}
                  <TextField
                    label="Full Legal Name"
                    value={profileData.name}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    InputProps={{
                      readOnly: true,
                      startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }}
                  />

                  {/* Email */}
                  <TextField
                    label="Email Address"
                    value={profileData.email}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    InputProps={{
                      readOnly: true,
                      startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }}
                  />

                  {/* Phone */}
                  <TextField
                    label="Telephone"
                    value={profileData.telephone}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    InputProps={{
                      readOnly: true,
                      startAdornment: <PhoneIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }}
                  />

                  {/* State of Domicile */}
                  <TextField
                    label="State of Domicile"
                    value={profileData.state_of_domicile}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    InputProps={{
                      readOnly: true,
                      startAdornment: <GavelIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }}
                  />

                  {/* Street Address — full width */}
                  <TextField
                    label="Street Address"
                    value={profileData.address}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <HomeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }}
                  />

                  {/* City */}
                  <TextField
                    label="City"
                    value={profileData.city}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    InputProps={{ readOnly: true }}
                  />

                  {/* State */}
                  <TextField
                    label="State"
                    value={profileData.state}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    InputProps={{ readOnly: true }}
                  />

                  {/* Zip Code */}
                  <TextField
                    label="Zip Code"
                    value={profileData.zip}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Paper>

              {/* ── Security ── */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, border: '1px solid #e0d9cf' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <SecurityIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, color: 'primary.main' }}>
                    Security
                  </Typography>
                </Box>

                {/* Login Method */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em', mb: 0.5 }}>
                    Login Method
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {hasPassword ? (
                      <VpnKeyIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    ) : (
                      <LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    )}
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                      {loginMethod}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3, borderColor: '#e0d9cf' }} />

                {/* Set / Change Password */}
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em', mb: 1 }}>
                  {hasPassword ? 'Change Password' : 'Set a Password'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.85rem' }}>
                  {hasPassword
                    ? 'Update your password below. You can still use magic links to sign in.'
                    : 'Add a password so you can sign in with either a magic link or email & password.'}
                </Typography>

                {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
                {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    placeholder="Min. 8 characters"
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    placeholder="Re-enter password"
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={handlePasswordChange}
                  disabled={savingPassword || !newPassword || !confirmPassword}
                  sx={{
                    bgcolor: 'primary.main',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {savingPassword ? <CircularProgress size={20} sx={{ color: 'white' }} /> : hasPassword ? 'Update Password' : 'Set Password'}
                </Button>
              </Paper>
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AccountSettings;
