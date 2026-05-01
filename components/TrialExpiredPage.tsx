'use client';

/**
 * Renewal / cancellation page shown after a trial expires.
 *
 * Mounted by the route shell whenever `useSubscription().isTrialExpired` is
 * true and the user has not yet made a decision. Three exits:
 *   1. Renew — calls `stripe-checkout` (currently stubbed; throws an explicit
 *      "billing not configured" error until env vars are set).
 *   2. Cancel & delete — invokes `delete-user-account` edge function which
 *      wipes all data, then signs the user out.
 *   3. (No "decide later" — Carl's policy is no data retention. The 30-day
 *      grace period is the only "decide later" affordance, and it auto-leads
 *      to deletion if no action is taken before it ends.)
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useSubscription } from '../lib/SubscriptionContext';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { PAID_ANNUAL_PRICE_USD, GRACE_PERIOD_DAYS } from '../lib/subscriptionConfig';

const theme = createTheme({
  palette: {
    primary: { main: '#1e3a5f', dark: '#0f2744' },
    secondary: { main: '#c9a227' },
    error: { main: '#b71c1c' },
    background: { default: '#faf9f7', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Georgia", serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    button: { fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, textTransform: 'none' as const },
  },
  shape: { borderRadius: 4 },
});

const TrialExpiredPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { gracePeriodDaysRemaining, isPastGracePeriod, refresh } = useSubscription();
  const [renewLoading, setRenewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleRenew = async () => {
    const priceId = (import.meta.env as Record<string, string>).VITE_STRIPE_PRICE_PAID || '';
    if (!priceId) {
      setError(
        'Online billing is being finalized. Please email support@mylifefolio.com to renew while we wrap up Stripe setup — we will reach out within one business day.',
      );
      return;
    }

    setRenewLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: { priceId },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data?.sessionUrl) throw new Error('No checkout URL returned');
      window.location.href = data.sessionUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout';
      setError(message);
      setRenewLoading(false);
    }
  };

  const openDeleteConfirm = () => {
    setConfirmText('');
    setError(null);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleteLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('delete-user-account', {
        body: { confirm: 'DELETE' },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.ok !== true) throw new Error(data?.error || 'Deletion failed');

      // Sign the user out — their auth record is also being deleted, so the
      // session will be invalidated server-side; this just clears the client.
      await signOut();
      window.location.href = '/';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setError(message);
      setDeleteLoading(false);
    } finally {
      void refresh();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <ThemeProvider theme={theme}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');`}
      </style>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#0f2744' }}>
          <Toolbar>
            <Box component="img" src="/logo.svg" alt="MyLifeFolio" sx={{ height: 32, width: 32, borderRadius: '50%', mr: 1.5 }} />
            <Typography sx={{ fontFamily: 'Georgia, serif', fontWeight: 600 }}>MyLifeFolio</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleSignOut} sx={{ opacity: 0.85 }}>
              Sign out
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 }, flexGrow: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <WarningAmberIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h3" sx={{ color: 'primary.main', mb: 1, fontSize: { xs: '1.85rem', md: '2.4rem' } }}>
              {isPastGracePeriod
                ? 'Your account is scheduled for deletion'
                : 'Your free trial has ended'}
            </Typography>
            {!isPastGracePeriod && (
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 540, mx: 'auto' }}>
                You have <strong>{gracePeriodDaysRemaining ?? GRACE_PERIOD_DAYS} days</strong> to
                renew or to confirm cancellation. After that, your folio is
                permanently deleted.
              </Typography>
            )}
            {isPastGracePeriod && (
              <Typography variant="body1" sx={{ color: 'error.main', maxWidth: 540, mx: 'auto', fontWeight: 500 }}>
                Your {GRACE_PERIOD_DAYS}-day grace period has ended. Renew now
                to keep your folio, or it will be permanently deleted on the
                next scheduled cleanup.
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'center' }}>
            {/* Renew */}
            <Card elevation={4} sx={{ flex: 1, maxWidth: 420, border: '1px solid', borderColor: alpha('#c9a227', 0.4) }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AutorenewIcon sx={{ fontSize: 36, color: 'secondary.main' }} />
                <Typography variant="h5" sx={{ color: 'primary.main' }}>Renew for ${PAID_ANNUAL_PRICE_USD}/year</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Keep everything you&rsquo;ve added. Continue full access to all
                  categories, reports, family access, and your documents vault.
                  Cancel anytime.
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  size="large"
                  disabled={renewLoading}
                  onClick={handleRenew}
                  sx={{ bgcolor: '#1e3a5f', color: 'white', '&:hover': { bgcolor: '#0f2744' }, py: 1.4, fontSize: '1rem', fontWeight: 700 }}
                >
                  {renewLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : `Renew — $${PAID_ANNUAL_PRICE_USD} / year`}
                </Button>
              </CardContent>
            </Card>

            {/* Delete */}
            <Card elevation={1} sx={{ flex: 1, maxWidth: 420, border: '1px solid', borderColor: alpha('#b71c1c', 0.25) }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DeleteForeverIcon sx={{ fontSize: 36, color: 'error.main' }} />
                <Typography variant="h5" sx={{ color: 'error.main' }}>Cancel and delete</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  End your account now. <strong>All of your data — folio entries,
                  uploaded documents, reports, family access, credentials —
                  will be permanently deleted.</strong> This cannot be undone.
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={openDeleteConfirm}
                  sx={{ py: 1.4, fontSize: '1rem', fontWeight: 600 }}
                >
                  Cancel and delete my data
                </Button>
              </CardContent>
            </Card>
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mt: 4, maxWidth: 720, mx: 'auto' }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!isPastGracePeriod && (
            <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
              <Typography variant="body2">
                Need to think about it? You can sign out and come back during
                the {GRACE_PERIOD_DAYS}-day grace period — but at the end of
                that window, accounts with no decision are deleted automatically.
              </Typography>
              <Button variant="text" onClick={handleSignOut} sx={{ mt: 1.5, color: 'primary.main' }}>
                Sign out — I&rsquo;ll decide later
              </Button>
            </Box>
          )}
        </Container>

        {/* Delete confirmation dialog */}
        <Dialog open={confirmOpen} onClose={() => !deleteLoading && setConfirmOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: 'error.main', fontFamily: '"Playfair Display", serif' }}>
            Delete your account permanently?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You are about to permanently delete <strong>{user?.email}</strong> and
              everything associated with it:
            </Typography>
            <ul style={{ marginTop: 0, marginBottom: 16, paddingLeft: 24, color: '#5a5a5a', fontSize: '0.9rem', lineHeight: 1.7 }}>
              <li>Your folio entries across all 12 categories</li>
              <li>All uploaded documents and the credential vault</li>
              <li>All saved reports and custom report configurations</li>
              <li>Every Family Access grant — your family members will lose access immediately</li>
              <li>Your sign-in credentials</li>
            </ul>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone. There are no backups to restore from.
            </Alert>
            <Typography variant="body2" sx={{ mb: 1 }}>
              To confirm, type <strong>DELETE</strong> in the box below:
            </Typography>
            <TextField
              fullWidth
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              size="small"
              autoFocus
              disabled={deleteLoading}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setConfirmOpen(false)} disabled={deleteLoading}>
              Keep my account
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              disabled={confirmText !== 'DELETE' || deleteLoading}
            >
              {deleteLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Permanently delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default TrialExpiredPage;
