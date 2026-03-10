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
import StarIcon from '@mui/icons-material/Star';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useSubscription } from '../lib/SubscriptionContext';
import { useAuth } from '../lib/AuthContext';
import { SubscriptionTier, TIER_INFO } from '../lib/subscriptionConfig';
import { supabase } from '../lib/supabase';

// Match the MyLifeFolioHome theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a5f',
      light: '#2d5a8e',
      dark: '#0f2744',
    },
    secondary: {
      main: '#c9a227',
      light: '#e8c547',
      dark: '#9a7b1a',
    },
    background: {
      default: '#faf9f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5a5a5a',
    },
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

// Feature list for each tier
const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  trial: [
    'Personal Information',
    'Family & Dependents',
    'My People & Advisors',
    '7-day access',
    'Explore the platform',
  ],
  standard: [
    'All 12 folio categories',
    'Documents Vault with uploads',
    'Credential Vault (encrypted)',
    'Digital Life management',
    'All 11 report formats',
    'Family Access Portal',
    'Legacy section (stories, letters, favorites)',
    'Care decisions & end-of-life',
    'Insurance coverage tracking',
    'Medical data management',
  ],
  enhanced: [
    'Everything in Standard, plus:',
    'AI-powered obituary generation',
    'Legacy video recording (up to 5 videos)',
    'Priority support',
  ],
};

interface PricingPageProps {
  onNavigateBack: () => void;
  onNavigate?: (page: string) => void;
}

// Stripe price IDs — set these to your actual Stripe price IDs
const STRIPE_PRICES: Record<string, string> = {
  standard: import.meta.env.VITE_STRIPE_PRICE_STANDARD || '',
  enhanced: import.meta.env.VITE_STRIPE_PRICE_ENHANCED || '',
};

const PricingPage: React.FC<PricingPageProps> = ({ onNavigateBack, onNavigate }) => {
  const { tier: currentTier, isTrialExpired } = useSubscription();
  const { session } = useAuth();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tiers: { key: SubscriptionTier; highlighted: boolean }[] = [
    { key: 'trial', highlighted: false },
    { key: 'standard', highlighted: true },
    { key: 'enhanced', highlighted: false },
  ];

  const handleSubscribe = async (planTier: SubscriptionTier) => {
    if (planTier === 'trial') return;

    const priceId = STRIPE_PRICES[planTier];
    if (!priceId) {
      setError('Stripe is not configured yet. Please contact support.');
      return;
    }

    setLoading(planTier);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: { priceId },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.sessionUrl) throw new Error('No checkout URL returned');

      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout';
      setError(message);
      setLoading(null);
    }
  };

  const getButtonLabel = (planTier: SubscriptionTier): string => {
    if (planTier === currentTier && !isTrialExpired) return 'Current Plan';
    if (planTier === 'trial') return isTrialExpired ? 'Trial Expired' : 'Current Plan';
    return 'Subscribe';
  };

  const isButtonDisabled = (planTier: SubscriptionTier): boolean => {
    if (planTier === currentTier && !isTrialExpired) return true;
    if (planTier === 'trial') return true;
    // Don't allow downgrading from enhanced to standard
    if (planTier === 'standard' && currentTier === 'enhanced') return true;
    return false;
  };

  return (
    <ThemeProvider theme={theme}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');`}
      </style>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          elevation={1}
          sx={{ bgcolor: 'primary.main' }}
        >
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
                src="/logo.jpg"
                alt="MyLifeFolio"
                sx={{ height: 36, width: 36, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', objectFit: 'cover' }}
              />
              <Typography sx={{ fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: '1.15rem' }}>
                MyLifeFolio
              </Typography>
            </Box>
            <Box sx={{ width: 80 }} /> {/* Spacer to center logo */}
          </Toolbar>
        </AppBar>

        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(165deg, #1e3a5f 0%, #0f2744 50%, #1a3050 100%)',
            color: 'white',
            pt: { xs: 14, md: 16 },
            pb: { xs: 6, md: 8 },
            position: 'relative',
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
                  Choose Your Plan
                </Typography>
                <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                  Simple, Transparent Pricing
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                  Organize your most important information in one secure place.
                  Choose the plan that fits your needs.
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* Pricing Cards */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: -4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: { xs: 'center', md: 'stretch' },
              justifyContent: 'center',
            }}
          >
            {tiers.map(({ key, highlighted }, index) => {
              const info = TIER_INFO[key];
              const features = TIER_FEATURES[key];
              const isCurrent = key === currentTier && !isTrialExpired;

              return (
                <Fade in timeout={600 + index * 200} key={key}>
                  <Card
                    elevation={highlighted ? 8 : 0}
                    sx={{
                      width: { xs: '100%', md: 340 },
                      maxWidth: 380,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'visible',
                      border: '1px solid',
                      borderColor: highlighted
                        ? alpha('#c9a227', 0.5)
                        : isCurrent
                          ? alpha('#1e3a5f', 0.3)
                          : alpha('#000', 0.08),
                      transform: highlighted ? { md: 'scale(1.05)' } : 'none',
                      zIndex: highlighted ? 1 : 0,
                    }}
                  >
                    {/* Popular badge */}
                    {highlighted && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -14,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: '#c9a227',
                          color: '#0f2744',
                          px: 2.5,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          boxShadow: '0 2px 8px rgba(201, 162, 39, 0.4)',
                        }}
                      >
                        <StarIcon sx={{ fontSize: 16 }} />
                        Most Popular
                      </Box>
                    )}

                    {/* Current plan badge */}
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
                        }}
                      >
                        <LockOpenIcon sx={{ fontSize: 16 }} />
                        Current Plan
                      </Box>
                    )}

                    <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Tier name */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: '"Playfair Display", serif',
                          color: '#1e3a5f',
                          mb: 1,
                          textAlign: 'center',
                        }}
                      >
                        {info.name}
                      </Typography>

                      {/* Price */}
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '2.75rem',
                            fontWeight: 700,
                            color: '#1a1a1a',
                            fontFamily: '"Source Sans 3", sans-serif',
                          }}
                        >
                          {info.price}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '1rem',
                            color: 'text.secondary',
                            ml: 0.5,
                          }}
                        >
                          /{info.priceDetail}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          textAlign: 'center',
                          mb: 3,
                          minHeight: 40,
                        }}
                      >
                        {info.description}
                      </Typography>

                      <Divider sx={{ mb: 3 }} />

                      {/* Features list */}
                      <Box sx={{ flexGrow: 1, mb: 3 }}>
                        {features.map((feature, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                              mb: 1.5,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{
                                fontSize: 18,
                                color: highlighted ? '#c9a227' : '#2e7d32',
                                mt: 0.3,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.92rem' }}>
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* CTA Button */}
                      <Button
                        variant={highlighted ? 'contained' : 'outlined'}
                        size="large"
                        fullWidth
                        disabled={isButtonDisabled(key)}
                        onClick={() => handleSubscribe(key)}
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
                        {loading === key ? (
                          <CircularProgress size={24} sx={{ color: highlighted ? 'white' : '#1e3a5f' }} />
                        ) : (
                          getButtonLabel(key)
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              );
            })}
          </Box>

          {/* Error Snackbar */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>

          {/* FAQ / Info section */}
          <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', color: '#1e3a5f', mb: 3 }}>
              Frequently Asked Questions
            </Typography>

            <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'left' }}>
              {[
                {
                  q: 'Can I upgrade from Standard to Enhanced later?',
                  a: 'Yes! You can upgrade at any time. You\'ll only pay the difference for the remainder of your billing period.',
                },
                {
                  q: 'What happens when my free trial ends?',
                  a: 'Your data is safely preserved. You\'ll need to subscribe to a paid plan to continue accessing and editing your folio.',
                },
                {
                  q: 'Is my data secure?',
                  a: 'Absolutely. All data is encrypted, your credential vault uses client-side AES-256 encryption, and we use row-level security so only you can access your information.',
                },
                {
                  q: 'Can I cancel my subscription?',
                  a: 'Yes, you can cancel anytime. Your data remains accessible until the end of your billing period.',
                },
                {
                  q: 'What\'s included in the AI obituary feature?',
                  a: 'Our AI-powered obituary generator creates a personalized, thoughtful obituary based on the life information you\'ve entered. You can generate multiple drafts and edit them to your liking.',
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

export default PricingPage;
