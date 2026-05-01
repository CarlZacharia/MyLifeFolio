'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  AppBar,
  Toolbar,
  Fade,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useSubscription } from '../lib/SubscriptionContext';
import {
  SubscriptionTier,
  TIER_INFO,
} from '../lib/subscriptionConfig';
import { supabase } from '../lib/supabase';

// Match the MyLifeFolioHome theme
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
    h6: { fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600 },
    body1: { fontFamily: '"Source Sans 3", sans-serif', fontSize: '1.05rem', lineHeight: 1.7 },
    body2: { fontFamily: '"Source Sans 3", sans-serif', lineHeight: 1.6 },
    button: { fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 4 },
});

const TRIAL_FEATURES: string[] = [
  'Full access to all 12 categories',
  'Documents Vault with uploads',
  'Credential Vault (encrypted)',
  'All standard reports',
  'Family Access Portal',
  'AI-powered obituary',
  'Legacy video recording',
  'No credit card required',
];

const PAID_FEATURES: string[] = [
  'Everything in the trial — no features removed',
  'Continued access after the first 6 months',
  'Annual billing — cancel anytime',
  'Priority support',
];

interface PricingPageProps {
  onNavigateBack: () => void;
  onNavigate?: (page: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigateBack }) => {
  const { tier: currentTier, isTrialExpired, refresh } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Renew handler. Wired to the existing stripe-checkout edge function so
   * that the click path is real, but the function returns an explicit error
   * until Stripe credentials (STRIPE_SECRET_KEY, VITE_STRIPE_PRICE_PAID, etc.)
   * are configured. See memory/billing_followups.md.
   */
  const handleRenew = async () => {
    const priceId = (import.meta.env as Record<string, string>).VITE_STRIPE_PRICE_PAID || '';
    if (!priceId) {
      setError('Online billing is being finalized. Please contact us at support@mylifefolio.com to renew while we wrap up Stripe setup.');
      return;
    }

    setLoading(true);
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
      setLoading(false);
    } finally {
      // refresh subscription state in case the webhook already fired
      void refresh();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');`}
      </style>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
        <AppBar position="fixed" elevation={1} sx={{ bgcolor: 'primary.main' }}>
          <Toolbar sx={{ py: 1, minHeight: 64 }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={onNavigateBack}
              sx={{ fontWeight: 500, opacity: 0.9, '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              Back
            </Button>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/logo.svg"
                alt="MyLifeFolio"
                sx={{ height: 36, width: 36, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', objectFit: 'cover' }}
              />
              <Typography sx={{ fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: '1.15rem' }}>
                MyLifeFolio
              </Typography>
            </Box>
            <Box sx={{ width: 80 }} />
          </Toolbar>
        </AppBar>

        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(165deg, #1e3a5f 0%, #0f2744 50%, #1a3050 100%)',
            color: 'white',
            pt: { xs: 14, md: 16 },
            pb: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
            <Fade in timeout={600}>
              <Box>
                <Typography
                  component="span"
                  sx={{
                    display: 'inline-block',
                    color: 'secondary.main',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    mb: 2,
                  }}
                >
                  Simple, Honest Pricing
                </Typography>
                <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                  Free for 6 months. <br /> Then $149 a year.
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 620, mx: 'auto', fontSize: '1.1rem' }}>
                  No credit card today. Use everything for the first six months.
                  When the trial ends, decide whether to renew — or cancel and have your data permanently deleted.
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* Pricing Cards */}
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, mt: -4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: { xs: 'center', md: 'stretch' },
              justifyContent: 'center',
            }}
          >
            {/* Trial card */}
            <PricingCard
              tier="trial"
              info={TIER_INFO.trial}
              features={TRIAL_FEATURES}
              isCurrent={currentTier === 'trial' && !isTrialExpired}
              ctaLabel={currentTier === 'trial' && !isTrialExpired ? 'Your current plan' : 'Free for 6 months'}
              ctaDisabled
              onClick={() => undefined}
              loading={false}
            />

            {/* Paid card */}
            <PricingCard
              tier="paid"
              info={TIER_INFO.paid}
              features={PAID_FEATURES}
              highlighted
              isCurrent={currentTier === 'paid'}
              ctaLabel={
                currentTier === 'paid'
                  ? 'You are subscribed'
                  : isTrialExpired
                    ? 'Renew now'
                    : 'Renew when trial ends'
              }
              ctaDisabled={currentTier === 'paid'}
              onClick={handleRenew}
              loading={loading}
            />
          </Box>

          {/* Notices */}
          <Box sx={{ maxWidth: 720, mx: 'auto', mt: 6, p: 3, bgcolor: alpha('#1e3a5f', 0.04), borderRadius: 2, borderLeft: `3px solid #1e3a5f` }}>
            <Typography variant="body2" sx={{ color: '#1e3a5f', fontWeight: 600, mb: 1 }}>
              What happens at the 6-month mark
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              When your trial ends you have <strong>30 days</strong> to decide.
              You can log in during this grace period to renew or to confirm
              cancellation.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>If you choose not to renew, your folio and all uploaded
              files are permanently deleted.</strong> We do not retain data
              for cancelled accounts. We will email you 30 days, 7 days, on,
              and 7 days after the trial end so you have plenty of warning.
            </Typography>
          </Box>

          {/* Error Snackbar */}
          <Snackbar
            open={!!error}
            autoHideDuration={8000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setError(null)} severity="warning" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>

          {/* FAQ */}
          <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', color: '#1e3a5f', mb: 3 }}>
              Frequently Asked Questions
            </Typography>

            <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'left' }}>
              {[
                {
                  q: 'Why no credit card up front?',
                  a: "We don't want anything in the way of you trying it. Add a card only if you decide to keep going at the 6-month mark.",
                },
                {
                  q: 'What happens to my data if I don\'t renew?',
                  a: "It is permanently deleted. We do not store inactive accounts. You'll get four reminder emails — 30 days before the trial ends, 7 days before, the day of, and 7 days after — so you have plenty of warning to renew or to download anything you want to keep.",
                },
                {
                  q: 'Can I cancel partway through the year?',
                  a: 'Yes. Your subscription stays active through the end of the period you paid for, then deletes per the same policy as a trial cancellation.',
                },
                {
                  q: 'Is my data secure?',
                  a: 'All data is encrypted at rest. The credential vault uses client-side AES-256 encryption — even MyLifeFolio cannot read it. Row-level security ensures only you and the people you grant access to can see your folio.',
                },
                {
                  q: 'What\'s included in the AI obituary?',
                  a: "An AI-generated, thoughtful obituary draft based on the life information you've entered. Generate multiple versions and edit them to your liking. Included for everyone — trial and paid alike.",
                },
              ].map(({ q, a }, idx) => (
                <Box key={idx} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.05rem', color: '#1e3a5f', mb: 0.5 }}>
                    {q}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {a}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>

        {/* Footer */}
        <Box sx={{ bgcolor: '#0a1929', color: 'white', py: 3 }}>
          <Container maxWidth="lg">
            <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center' }}>
              © {new Date().getFullYear()} MyLifeFolio. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

interface PricingCardProps {
  tier: SubscriptionTier;
  info: { name: string; price: string; priceDetail: string; description: string };
  features: string[];
  highlighted?: boolean;
  isCurrent: boolean;
  ctaLabel: string;
  ctaDisabled: boolean;
  onClick: () => void;
  loading: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  info,
  features,
  highlighted = false,
  isCurrent,
  ctaLabel,
  ctaDisabled,
  onClick,
  loading,
}) => (
  <Fade in timeout={700}>
    <Card
      elevation={highlighted ? 8 : 0}
      sx={{
        width: { xs: '100%', md: 360 },
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        border: '1px solid',
        borderColor: highlighted ? alpha('#c9a227', 0.5) : isCurrent ? alpha('#1e3a5f', 0.3) : alpha('#000', 0.08),
        transform: highlighted ? { md: 'scale(1.04)' } : 'none',
      }}
    >
      {isCurrent && (
        <Box
          sx={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: '#1e3a5f',
            color: 'white',
            px: 2.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            whiteSpace: 'nowrap',
          }}
        >
          <LockOpenIcon sx={{ fontSize: 16 }} />
          Your current plan
        </Box>
      )}

      <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', color: '#1e3a5f', mb: 1, textAlign: 'center' }}>
          {info.name}
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography component="span" sx={{ fontSize: '2.75rem', fontWeight: 700, color: '#1a1a1a', fontFamily: '"Source Sans 3", sans-serif' }}>
            {info.price}
          </Typography>
          <Typography component="span" sx={{ fontSize: '1rem', color: 'text.secondary', ml: 0.5 }}>
            /{info.priceDetail}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3, minHeight: 40 }}>
          {info.description}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flexGrow: 1, mb: 3 }}>
          {features.map((feature, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
              <CheckCircleIcon sx={{ fontSize: 18, color: highlighted ? '#c9a227' : '#2e7d32', mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.92rem' }}>
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
          variant={highlighted ? 'contained' : 'outlined'}
          size="large"
          fullWidth
          disabled={ctaDisabled}
          onClick={onClick}
          sx={{
            py: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            ...(highlighted
              ? {
                  bgcolor: '#1e3a5f',
                  color: 'white',
                  '&:hover': { bgcolor: '#0f2744' },
                  '&.Mui-disabled': { bgcolor: alpha('#1e3a5f', 0.4), color: 'white' },
                }
              : {
                  borderColor: '#1e3a5f',
                  color: '#1e3a5f',
                  '&:hover': { bgcolor: alpha('#1e3a5f', 0.04) },
                  '&.Mui-disabled': { borderColor: alpha('#1e3a5f', 0.3), color: alpha('#1e3a5f', 0.4) },
                }),
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : ctaLabel}
        </Button>
      </CardContent>
      <input type="hidden" value={tier} />
    </Card>
  </Fade>
);

export default PricingPage;
