'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import { ProjectedBenefits, CurrentPlanAnalysis } from './trustPlanTypes';
import { formatCurrency } from './trustPlanUtils';

interface BenefitsSummaryProps {
  currentAnalysis: CurrentPlanAnalysis;
  projectedBenefits: ProjectedBenefits;
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  current: string;
  proposed: string;
  improvement: string;
  color: string;
  progressValue?: number;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  title,
  current,
  proposed,
  improvement,
  color,
  progressValue,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: 2,
        borderColor: color,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>

    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">Current</Typography>
        <Typography variant="body2" color="error.main">{current}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">With Trust</Typography>
        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>{proposed}</Typography>
      </Box>
    </Box>

    {progressValue !== undefined && (
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#ffebee',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#4caf50',
              borderRadius: 4,
            },
          }}
        />
      </Box>
    )}

    <Box
      sx={{
        p: 1.5,
        bgcolor: `${color}10`,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <CheckCircleIcon sx={{ color: color, fontSize: 18 }} />
      <Typography variant="body2" sx={{ color: color, fontWeight: 500 }}>
        {improvement}
      </Typography>
    </Box>
  </Paper>
);

export const BenefitsSummaryComponent: React.FC<BenefitsSummaryProps> = ({
  currentAnalysis,
  projectedBenefits,
}) => {
  const { probateAvoidance, minorProtection, incapacityPlanning, privacy, coordination } = projectedBenefits;

  // Calculate probate reduction percentage
  const probateReductionPercent = probateAvoidance.currentProbateEstate > 0
    ? Math.round((probateAvoidance.savings / probateAvoidance.currentProbateEstate) * 100)
    : 100;

  return (
    <Box>
      {/* Header Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8b 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Trust-Centered Plan Benefits
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <TrendingDownIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {formatCurrency(probateAvoidance.savings)}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Removed from Probate
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <ChildCareIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {minorProtection.minorsProtectedByTrust}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Minor Beneficiaries Protected
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <VisibilityOffIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {privacy.assetsPrivate}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Assets Kept Private
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Benefits */}
      <Grid container spacing={3}>
        {/* Probate Avoidance */}
        <Grid item xs={12} md={6}>
          <BenefitCard
            icon={<GavelIcon />}
            title="Probate Avoidance"
            current={formatCurrency(probateAvoidance.currentProbateEstate)}
            proposed={formatCurrency(probateAvoidance.projectedProbateEstate)}
            improvement={`Save ${formatCurrency(probateAvoidance.savings)} from probate`}
            color="#1565c0"
            progressValue={probateReductionPercent}
          />
        </Grid>

        {/* Minor Protection */}
        <Grid item xs={12} md={6}>
          <BenefitCard
            icon={<ChildCareIcon />}
            title="Minor Beneficiary Protection"
            current={`${minorProtection.minorsCurrentlyUnprotected} unprotected`}
            proposed={`Protected until age ${minorProtection.protectedUntilAge}`}
            improvement={`${minorProtection.minorsProtectedByTrust} beneficiaries protected`}
            color="#2e7d32"
          />
        </Grid>

        {/* Incapacity Planning */}
        <Grid item xs={12} md={6}>
          <BenefitCard
            icon={<AccessibilityIcon />}
            title="Incapacity Protection"
            current={incapacityPlanning.currentProtection === 'none' ? 'No protection' : 'POA only'}
            proposed="Full trust protection"
            improvement={incapacityPlanning.benefit}
            color="#7b1fa2"
          />
        </Grid>

        {/* Privacy */}
        <Grid item xs={12} md={6}>
          <BenefitCard
            icon={<VisibilityOffIcon />}
            title="Estate Privacy"
            current={`${privacy.assetsInProbate} assets public record`}
            proposed={`${privacy.assetsPrivate} assets remain private`}
            improvement="Trust documents are not public record"
            color="#00838f"
          />
        </Grid>
      </Grid>

      {/* Coordination Benefits */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 4,
          bgcolor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SyncAltIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Plan Coordination
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Plan
            </Typography>
            <Typography variant="body2">
              Assets distributed through multiple channels: beneficiary designations, joint ownership,
              deeds, and probate. Each asset follows its own path - potential for conflicts and
              inconsistent distributions.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              Trust-Centered Plan
            </Typography>
            <Typography variant="body2">
              All assets funnel through a single trust document. One consistent distribution plan,
              easy to update, and ensures all beneficiaries are treated according to your wishes.
              {coordination.consistentDistribution && (
                <Box component="span" sx={{ display: 'block', mt: 1, color: 'success.main', fontWeight: 500 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  Consistent distribution achieved
                </Box>
              )}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Additional Benefits List */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Additional Trust Benefits
        </Typography>

        <Grid container spacing={2}>
          {[
            {
              title: 'Avoid Multiple Probates',
              description: 'If you own property in multiple states, each state requires separate probate. A trust avoids this entirely.',
            },
            {
              title: 'Faster Distribution',
              description: 'Trust assets can be distributed immediately. Probate typically takes 6-18 months.',
            },
            {
              title: 'Reduced Costs',
              description: 'Probate fees (attorney, executor, court) typically run 3-7% of estate value. Trusts avoid these.',
            },
            {
              title: 'Contest Protection',
              description: 'Trusts are harder to contest than Wills. The trust has been operating during your lifetime.',
            },
            {
              title: 'Creditor Protection',
              description: 'Properly structured trusts can protect beneficiaries\' inheritances from their creditors and divorcing spouses.',
            },
            {
              title: 'Easy Updates',
              description: 'Trust amendments are simple and private. Will changes require new witnesses and notarization.',
            },
          ].map((benefit, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <CheckCircleIcon color="success" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default BenefitsSummaryComponent;
