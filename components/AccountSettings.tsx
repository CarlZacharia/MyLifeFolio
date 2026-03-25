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
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  IconButton,
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
import LockPersonIcon from '@mui/icons-material/LockPerson';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useSubscription } from '../lib/SubscriptionContext';
import { useReauthPrefs, REAUTH_FEATURES } from '../lib/ReauthPrefsContext';

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
  onNavigate?: (page: string) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onNavigateBack, onNavigate }) => {
  const { user } = useAuth();
  const { tier, status, trialDaysRemaining, isTrialExpired } = useSubscription();
  const { prefs, setReauthRequired } = useReauthPrefs();
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteAllData, setDeleteAllData] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        const meta = user.user_metadata || {};
        const merged = {
          name: data.name || meta.name || '',
          email: data.email || user.email || '',
          address: data.address || meta.address || '',
          city: data.city || meta.city || '',
          state: data.state || meta.state || '',
          state_of_domicile: data.state_of_domicile || meta.state_of_domicile || '',
          zip: data.zip || meta.zip || '',
          telephone: data.telephone || meta.telephone || '',
        };
        setProfileData(merged);

        // Backfill profile row if metadata had values the profile was missing
        const patches: Record<string, string> = {};
        if (!data.city && merged.city) patches.city = merged.city;
        if (!data.state && merged.state) patches.state = merged.state;
        if (!data.zip && merged.zip) patches.zip = merged.zip;
        if (!data.address && merged.address) patches.address = merged.address;
        if (Object.keys(patches).length > 0) {
          await supabase.from('profiles').update(patches).eq('id', user.id);
        }
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

  const handleManageBilling = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        setError('Your session has expired. Please log in again.');
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ return_url: window.location.href }),
        }
      );
      const data = await res.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal.');
      }
    } catch {
      setError('Failed to open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  const USER_DATA_TABLES = [
    'profiles', 'intakes_raw', 'folio_intakes', 'folio_children', 'folio_beneficiaries',
    'folio_charities', 'folio_dependents', 'folio_real_estate', 'folio_bank_accounts',
    'folio_investments', 'folio_retirement_accounts', 'folio_life_insurance', 'folio_vehicles',
    'folio_other_assets', 'folio_business_interests', 'folio_digital_assets', 'folio_specific_gifts',
    'folio_cash_gifts', 'folio_long_term_care', 'folio_current_estate_plan', 'folio_distribution_plans',
    'folio_client_income', 'folio_spouse_income', 'folio_client_medical_insurance',
    'folio_spouse_medical_insurance', 'folio_advisors', 'folio_medical_providers', 'folio_allergies',
    'folio_medications', 'folio_medical_conditions', 'folio_surgeries', 'folio_medical_equipment',
    'folio_pharmacies', 'folio_end_of_life', 'folio_care_preferences', 'folio_insurance_coverage',
    'folio_expenses', 'folio_subscriptions', 'legacy_obituary', 'legacy_obituary_spouse',
    'legacy_obituary_drafts', 'legacy_charity_preferences', 'legacy_charity_organizations',
    'legacy_personal_history', 'legacy_reflections', 'legacy_surprises', 'legacy_favorites',
    'legacy_entries', 'folio_basic_vitals', 'vault_documents', 'credential_accounts',
    'credential_vault_settings', 'user_questions', 'folio_access_log', 'folio_authorized_users',
    'folio_documents', 'saved_report_configs',
  ];

  const handleCancelSubscription = async () => {
    if (!user || cancelConfirmText !== 'CANCEL') return;
    setCancelling(true);
    setError(null);

    try {
      // If user chose to delete all data, delete from every user data table
      if (deleteAllData) {
        for (const table of USER_DATA_TABLES) {
          await supabase.from(table).delete().eq('user_id', user.id);
        }
        // Also delete vault storage files
        const { data: files } = await supabase.storage.from('vault-documents').list(user.id);
        if (files && files.length > 0) {
          const paths = files.map((f) => `${user.id}/${f.name}`);
          await supabase.storage.from('vault-documents').remove(paths);
        }
      }

      // Cancel the subscription via updating the user_subscriptions table
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled', tier: 'trial' })
        .eq('user_id', user.id);

      // If they have a Stripe subscription, cancel it via the portal
      // The webhook will handle the actual cancellation
      if (tier !== 'trial') {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ return_url: window.location.href }),
          }
        );
        const data = await res.json();
        if (data.url) {
          // Redirect to Stripe portal so they can confirm cancellation there
          window.location.href = data.url;
          return;
        }
      }

      setCancelSuccess(true);
      setCancelModalOpen(false);

      // If they deleted all data, sign them out
      if (deleteAllData) {
        await supabase.auth.signOut();
        window.location.href = '/';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription.');
    } finally {
      setCancelling(false);
    }
  };

  const tierLabel = tier === 'trial' ? 'Trial' : tier === 'standard' ? 'Standard' : 'Enhanced';
  const statusLabel = isTrialExpired ? 'Expired' : status === 'past_due' ? 'Past Due' : status === 'active' ? 'Active' : status === 'cancelled' ? 'Cancelled' : status;
  const statusColor = (isTrialExpired || status === 'cancelled') ? 'error' : status === 'past_due' ? 'warning' : 'success';

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
                    <Chip label={statusLabel} color={statusColor as any} size="small" sx={{ fontWeight: 600 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                      Plan
                    </Typography>
                    <Chip label={tierLabel} variant="outlined" size="small" sx={{ fontWeight: 600, borderColor: 'secondary.main', color: 'secondary.dark' }} />
                    {tier === 'trial' && trialDaysRemaining !== null && (
                      <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem', color: isTrialExpired ? 'error.main' : 'text.secondary' }}>
                        {isTrialExpired ? 'Trial expired' : `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} remaining`}
                      </Typography>
                    )}
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PaymentIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
                  {tier === 'trial' || isTrialExpired ? (
                    <Button
                      variant="contained"
                      startIcon={<UpgradeIcon />}
                      onClick={() => onNavigate?.('pricing')}
                      sx={{
                        bgcolor: 'secondary.main',
                        color: 'primary.dark',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'secondary.light' },
                      }}
                    >
                      Upgrade Plan
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<ManageAccountsIcon />}
                        onClick={handleManageBilling}
                        disabled={portalLoading}
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'rgba(30, 58, 95, 0.05)' },
                        }}
                      >
                        {portalLoading ? <CircularProgress size={20} /> : 'Manage Billing'}
                      </Button>
                      {tier === 'standard' && (
                        <Button
                          variant="text"
                          startIcon={<UpgradeIcon />}
                          onClick={() => onNavigate?.('pricing')}
                          sx={{
                            color: 'secondary.dark',
                            fontWeight: 600,
                            textTransform: 'none',
                          }}
                        >
                          Upgrade to Enhanced
                        </Button>
                      )}
                    </>
                  )}
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
                    InputProps={{ readOnly: true }}
                  />

                  {/* State */}
                  <TextField
                    label="State"
                    value={profileData.state}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />

                  {/* Zip Code */}
                  <TextField
                    label="Zip Code"
                    value={profileData.zip}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
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
                    ? 'Update your password below. You can still use a sign-in code to sign in.'
                    : 'Add a password so you can sign in with either a code or email & password.'}
                </Typography>

                {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
                {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                  <TextField
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    placeholder="Min. 8 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" size="small">
                            {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    placeholder="Re-enter password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
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

              {/* ── Re-authentication Requirements ── */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, border: '1px solid #e0d9cf' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <LockPersonIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, color: 'primary.main' }}>
                    Re-authentication Requirements
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.9rem' }}>
                  Choose which sections require identity verification before viewing. When enabled, you will be prompted to verify via a one-time email code before accessing that section.
                </Typography>

                <List disablePadding>
                  {REAUTH_FEATURES.map((feature, index) => (
                    <React.Fragment key={feature.key}>
                      {index > 0 && <Divider sx={{ borderColor: '#f0ebe3' }} />}
                      <ListItem
                        disableGutters
                        sx={{ py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.primary' }}>
                              {feature.label}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.25 }}>
                              {feature.description}
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={prefs[feature.key] ?? feature.defaultOn}
                              onChange={(e) => setReauthRequired(feature.key, e.target.checked)}
                              size="small"
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                              {(prefs[feature.key] ?? feature.defaultOn) ? 'Required' : 'Off'}
                            </Typography>
                          }
                          labelPlacement="start"
                          sx={{ mr: 0, ml: 'auto', flexShrink: 0 }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>

              {/* ── Cancel Subscription ── */}
              {tier !== 'trial' && (
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, border: '1px solid #e0d9cf' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <CancelIcon sx={{ color: '#d32f2f', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, color: '#d32f2f' }}>
                      Cancel Subscription
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.9rem' }}>
                    If you cancel your subscription, you will lose access to premium features at the end of your current billing period. Your data will be preserved unless you choose to delete it.
                  </Typography>
                  {cancelSuccess && (
                    <Alert severity="info" sx={{ mb: 2 }}>Your subscription has been cancelled.</Alert>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setCancelModalOpen(true);
                      setCancelConfirmText('');
                      setDeleteAllData(false);
                      setCancelSuccess(false);
                    }}
                    sx={{ fontWeight: 600, textTransform: 'none' }}
                  >
                    Cancel My Subscription
                  </Button>
                </Paper>
              )}

              {/* ── Cancel Confirmation Modal ── */}
              <Dialog
                open={cancelModalOpen}
                onClose={() => !cancelling && setCancelModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
              >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: '"Playfair Display", serif', fontWeight: 600, color: '#d32f2f' }}>
                  <WarningAmberIcon sx={{ color: '#d32f2f', fontSize: 28 }} />
                  Cancel Subscription
                </DialogTitle>
                <DialogContent>
                  <Typography sx={{ mb: 2, fontSize: '0.95rem', color: 'text.secondary' }}>
                    Are you sure you want to cancel your <strong>{tierLabel}</strong> subscription? You will retain access until the end of your current billing period.
                  </Typography>

                  <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteAllData}
                          onChange={(e) => setDeleteAllData(e.target.checked)}
                          sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#d32f2f' }}>
                            Delete all my data
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.25 }}>
                            Permanently remove all information you have entered including personal details, financial records, medical information, legacy entries, uploaded documents, and saved credentials. This action cannot be undone.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', mx: 0 }}
                    />
                  </Paper>

                  {deleteAllData && (
                    <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DeleteForeverIcon sx={{ color: '#d32f2f' }} />
                        <Typography sx={{ fontWeight: 600, color: '#d32f2f', fontSize: '0.95rem' }}>
                          Warning: This will permanently delete
                        </Typography>
                      </Box>
                      <Typography variant="body2" component="ul" sx={{ color: 'text.secondary', pl: 2, mb: 0, fontSize: '0.85rem', '& li': { mb: 0.5 } }}>
                        <li>Personal & family information</li>
                        <li>Financial accounts, assets, and insurance records</li>
                        <li>Medical records, medications, and care preferences</li>
                        <li>Estate planning documents and distribution plans</li>
                        <li>Legacy entries, obituary drafts, and reflections</li>
                        <li>Uploaded documents and stored credentials</li>
                        <li>All saved reports and access logs</li>
                      </Typography>
                    </Paper>
                  )}

                  <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 600 }}>
                    Type <strong>CANCEL</strong> to confirm:
                  </Typography>
                  <TextField
                    value={cancelConfirmText}
                    onChange={(e) => setCancelConfirmText(e.target.value.toUpperCase())}
                    placeholder="CANCEL"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 1 }}
                  />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button
                    onClick={() => setCancelModalOpen(false)}
                    disabled={cancelling}
                    sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                  >
                    Keep My Subscription
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCancelSubscription}
                    disabled={cancelling || cancelConfirmText !== 'CANCEL'}
                    startIcon={cancelling ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <CancelIcon />}
                    sx={{
                      bgcolor: '#d32f2f',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#b71c1c' },
                      '&.Mui-disabled': { bgcolor: '#e0e0e0' },
                    }}
                  >
                    {cancelling ? 'Cancelling...' : deleteAllData ? 'Cancel & Delete All Data' : 'Cancel Subscription'}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AccountSettings;
