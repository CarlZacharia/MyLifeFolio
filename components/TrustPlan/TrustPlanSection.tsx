'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Button,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

import { useFormContext } from '../../lib/FormContext';
import {
  TrustPlanData,
  TrustCenteredPlan,
  TrustPlanView,
} from './trustPlanTypes';
import {
  generateTrustPlanData,
  calculateProjectedBenefits,
} from './trustPlanUtils';
import CurrentPlanAnalysisComponent from './CurrentPlanAnalysis';
import TrustCenteredPlanComponent from './TrustCenteredPlan';
import BenefitsSummaryComponent from './BenefitsSummary';
import FundingChecklistComponent from './FundingChecklist';
import { generateTrustPlanReport } from './trustPlanReport';

interface TabPanelProps {
  children?: React.ReactNode;
  value: TrustPlanView;
  current: TrustPlanView;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, current }) => (
  <Box role="tabpanel" hidden={value !== current} sx={{ py: 3 }}>
    {value === current && children}
  </Box>
);

export const TrustPlanSection: React.FC = () => {
  const { formData } = useFormContext();
  const [activeTab, setActiveTab] = useState<TrustPlanView>('comparison');
  const [trustPlanData, setTrustPlanData] = useState<TrustPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Generate analysis on mount or when formData changes significantly
  useEffect(() => {
    setIsLoading(true);
    // Small delay to show loading state
    const timer = setTimeout(() => {
      const data = generateTrustPlanData(formData);
      setTrustPlanData(data);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  // Handle plan changes (user accepts/rejects recommendations)
  const handlePlanChange = (newPlan: TrustCenteredPlan) => {
    if (!trustPlanData) return;

    // Recalculate benefits based on new accepted recommendations
    const newBenefits = calculateProjectedBenefits(
      trustPlanData.currentPlanAnalysis,
      {
        assetsToRetitle: newPlan.assetsToRetitle,
        beneficiaryChanges: newPlan.beneficiaryChanges,
        distributionAge: newPlan.distributionPlan.distributionAge,
      }
    );

    setTrustPlanData({
      ...trustPlanData,
      trustCenteredPlan: {
        ...newPlan,
        projectedBenefits: newBenefits,
      },
    });
  };

  // Regenerate analysis
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateTrustPlanData(formData);
      setTrustPlanData(data);
      setIsLoading(false);
    }, 500);
  };

  // Export report to Word document
  const handleExportReport = async () => {
    if (!trustPlanData) return;

    setIsExporting(true);
    try {
      const clientName = formData.name || 'Client';
      const spouseName = formData.spouseName || undefined;
      await generateTrustPlanReport(trustPlanData, clientName, spouseName);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Check if we have enough data to analyze
  const hasAssets = formData.realEstate.length > 0 ||
    formData.bankAccounts.length > 0 ||
    formData.retirementAccounts.length > 0 ||
    formData.lifeInsurance.length > 0 ||
    formData.otherAssets.length > 0;

  if (!hasAssets) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <AlertTitle>No Assets to Analyze</AlertTitle>
          Please add assets in the Assets section before using the Trust Planning tool.
          The analysis requires information about your real estate, bank accounts,
          retirement accounts, and other assets to generate recommendations.
        </Alert>
      </Box>
    );
  }

  if (isLoading || !trustPlanData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Analyzing your estate plan...
        </Typography>
      </Box>
    );
  }

  const { currentPlanAnalysis, trustCenteredPlan } = trustPlanData;

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8b 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountBalanceIcon sx={{ fontSize: 36 }} />
              Trust-Centered Planning
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Compare your current estate plan with a trust-centered approach
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleExportReport}
              disabled={isExporting}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              {isExporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<CompareArrowsIcon />}
            label="Current vs. Trust Plan"
            value="comparison"
            iconPosition="start"
          />
          <Tab
            icon={<BarChartIcon />}
            label="Benefits Summary"
            value="benefits"
            iconPosition="start"
          />
          <Tab
            icon={<ChecklistIcon />}
            label="Funding Checklist"
            value="checklist"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Comparison View - Side by Side */}
      <TabPanel value="comparison" current={activeTab}>
        <Grid container spacing={3}>
          {/* Left Panel - Current Plan */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '2px solid',
                borderColor: '#ffcdd2',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #ffcdd2',
                  color: '#c62828',
                  fontWeight: 600,
                }}
              >
                Your Current Plan
              </Typography>
              <CurrentPlanAnalysisComponent analysis={currentPlanAnalysis} />
            </Paper>
          </Grid>

          {/* Right Panel - Trust-Centered Plan */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '2px solid',
                borderColor: '#c8e6c9',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #c8e6c9',
                  color: '#2e7d32',
                  fontWeight: 600,
                }}
              >
                Trust-Centered Plan
              </Typography>
              <TrustCenteredPlanComponent
                plan={trustCenteredPlan}
                onPlanChange={handlePlanChange}
              />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Benefits View */}
      <TabPanel value="benefits" current={activeTab}>
        <BenefitsSummaryComponent
          currentAnalysis={currentPlanAnalysis}
          projectedBenefits={trustCenteredPlan.projectedBenefits}
        />
      </TabPanel>

      {/* Funding Checklist View */}
      <TabPanel value="checklist" current={activeTab}>
        <FundingChecklistComponent
          plan={trustCenteredPlan}
          trustName={trustCenteredPlan.trustName}
        />
      </TabPanel>

      {/* Quick Stats Footer */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 2,
          bgcolor: 'grey.100',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">Total Estate</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(currentPlanAnalysis.totalEstateValue)}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">Current Probate Estate</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(currentPlanAnalysis.probateEstateSecondDeath)}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">With Trust Plan</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(trustCenteredPlan.projectedBenefits.probateAvoidance.projectedProbateEstate)}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">Issues Found</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: currentPlanAnalysis.allIssues.length > 0 ? 'warning.main' : 'success.main' }}>
            {currentPlanAnalysis.allIssues.length}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TrustPlanSection;
