'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { SubscriptionTier, TIER_INFO } from '../lib/subscriptionConfig';

interface UpgradePromptProps {
  /** The tier required to access the feature */
  requiredTier: SubscriptionTier;
  /** The name of the feature being gated */
  featureName: string;
  /** Callback to navigate to the pricing page */
  onViewPlans: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  requiredTier,
  featureName,
  onViewPlans,
}) => {
  const tierInfo = TIER_INFO[requiredTier];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        textAlign: 'center',
        px: 3,
        py: 6,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(30, 58, 95, 0.08)',
          mb: 3,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 40, color: '#1e3a5f' }} />
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 600,
          color: '#1e3a5f',
          mb: 1.5,
        }}
      >
        {featureName}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          maxWidth: 440,
          mb: 1,
        }}
      >
        This feature is available on the{' '}
        <strong>{tierInfo.name}</strong> plan ({tierInfo.price}/{tierInfo.priceDetail}).
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          maxWidth: 440,
          mb: 4,
        }}
      >
        {tierInfo.description}
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onViewPlans}
        sx={{
          bgcolor: '#1e3a5f',
          color: 'white',
          fontWeight: 600,
          px: 5,
          py: 1.5,
          fontSize: '1rem',
          '&:hover': {
            bgcolor: '#0f2744',
          },
        }}
      >
        View Plans
      </Button>
    </Box>
  );
};

export default UpgradePrompt;
