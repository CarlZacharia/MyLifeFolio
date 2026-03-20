'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import SecurityIcon from '@mui/icons-material/Security';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon from '@mui/icons-material/Category';
import ComputerIcon from '@mui/icons-material/Computer';

import { CurrentPlanAnalysis as CurrentPlanAnalysisType, AssetAnalysis, PlanningIssue, IssueSeverity } from './trustPlanTypes';
import { formatCurrency } from './trustPlanUtils';

interface CurrentPlanAnalysisProps {
  analysis: CurrentPlanAnalysisType;
}

// Get icon for issue severity
const getSeverityIcon = (severity: IssueSeverity) => {
  switch (severity) {
    case 'high':
      return <ErrorIcon color="error" />;
    case 'medium':
      return <WarningIcon color="warning" />;
    case 'low':
      return <InfoIcon color="info" />;
    case 'info':
    default:
      return <InfoIcon color="disabled" />;
  }
};

// Get color for issue severity
const getSeverityColor = (severity: IssueSeverity): 'error' | 'warning' | 'info' | 'default' => {
  switch (severity) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

// Get icon for asset type
const getAssetTypeIcon = (assetType: string) => {
  switch (assetType) {
    case 'realEstate':
      return <HomeIcon />;
    case 'bankAccount':
    case 'nonQualifiedInvestment':
      return <AccountBalanceIcon />;
    case 'retirementAccount':
      return <SavingsIcon />;
    case 'lifeInsurance':
      return <SecurityIcon />;
    case 'vehicle':
      return <DirectionsCarIcon />;
    case 'digitalAsset':
      return <ComputerIcon />;
    default:
      return <CategoryIcon />;
  }
};

// Get human-readable asset type name
const getAssetTypeName = (assetType: string): string => {
  switch (assetType) {
    case 'realEstate':
      return 'Real Estate';
    case 'bankAccount':
      return 'Bank Account';
    case 'nonQualifiedInvestment':
      return 'Investment';
    case 'retirementAccount':
      return 'Retirement Account';
    case 'lifeInsurance':
      return 'Life Insurance';
    case 'vehicle':
      return 'Vehicle';
    case 'otherAsset':
      return 'Other Asset';
    case 'businessInterest':
      return 'Business Interest';
    case 'digitalAsset':
      return 'Digital Asset';
    default:
      return assetType;
  }
};

// Get passage method description
const getPassageDescription = (method: string): string => {
  switch (method) {
    case 'probate':
      return 'Probate';
    case 'joint_survivorship':
      return 'To Survivor';
    case 'beneficiary_designation':
      return 'To Beneficiary';
    case 'trust':
      return 'Via Trust';
    case 'deed_remainder':
      return 'To Remainderman';
    case 'operation_of_law':
      return 'By Law';
    default:
      return method;
  }
};

export const CurrentPlanAnalysisComponent: React.FC<CurrentPlanAnalysisProps> = ({ analysis }) => {
  const { totalEstateValue, probateEstateFirstDeath, probateEstateSecondDeath, assetAnalyses, allIssues, stats } = analysis;

  // Group assets by type
  const assetsByType = assetAnalyses.reduce((acc, asset) => {
    if (!acc[asset.assetType]) {
      acc[asset.assetType] = [];
    }
    acc[asset.assetType].push(asset);
    return acc;
  }, {} as Record<string, AssetAnalysis[]>);

  // Count issues by severity
  const issuesBySevertiy = {
    high: allIssues.filter(i => i.severity === 'high').length,
    medium: allIssues.filter(i => i.severity === 'medium').length,
    low: allIssues.filter(i => i.severity === 'low').length,
  };

  return (
    <Box>
      {/* Summary Statistics */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e3a5f' }}>
          Current Plan Summary
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Estate Value</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a5f' }}>
              {formatCurrency(totalEstateValue)}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Probate Estate (1st Death)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: probateEstateFirstDeath > 0 ? '#d32f2f' : '#2e7d32' }}>
              {formatCurrency(probateEstateFirstDeath)}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Probate Estate (2nd Death)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: probateEstateSecondDeath > 0 ? '#d32f2f' : '#2e7d32' }}>
              {formatCurrency(probateEstateSecondDeath)}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Assets Needing Probate</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: stats.assetsRequiringProbate > 0 ? '#ed6c02' : '#2e7d32' }}>
              {stats.assetsRequiringProbate} of {assetAnalyses.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Issues Summary */}
      {allIssues.length > 0 && (
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <WarningIcon color="warning" />
              <Typography sx={{ fontWeight: 600 }}>
                Issues Identified ({allIssues.length})
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {issuesBySevertiy.high > 0 && (
                  <Chip size="small" label={`${issuesBySevertiy.high} High`} color="error" />
                )}
                {issuesBySevertiy.medium > 0 && (
                  <Chip size="small" label={`${issuesBySevertiy.medium} Medium`} color="warning" />
                )}
                {issuesBySevertiy.low > 0 && (
                  <Chip size="small" label={`${issuesBySevertiy.low} Low`} color="info" />
                )}
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {allIssues.map((issue, index) => (
                <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ mt: 0.5 }}>
                    {getSeverityIcon(issue.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {issue.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block' }}>
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          {issue.description}
                        </Typography>
                        {issue.affectedBeneficiaries && issue.affectedBeneficiaries.length > 0 && (
                          <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block', mt: 0.5 }}>
                            Affected: {issue.affectedBeneficiaries.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Minor Beneficiaries Alert */}
      {stats.minorBeneficiariesUnprotected > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Minor Beneficiaries Without Protection</AlertTitle>
          {stats.minorBeneficiariesUnprotected} minor beneficiary(ies) will receive assets directly without trust protection.
          A trust would provide professional management until they reach an appropriate age.
        </Alert>
      )}

      {/* Asset Analysis by Type */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600, color: '#1e3a5f' }}>
        Asset-by-Asset Analysis
      </Typography>

      {Object.entries(assetsByType).map(([assetType, assets]) => (
        <Accordion key={assetType} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {getAssetTypeIcon(assetType)}
              <Typography sx={{ fontWeight: 600 }}>
                {getAssetTypeName(assetType)} ({assets.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', mr: 2 }}>
                {formatCurrency(assets.reduce((sum, a) => sum + a.value, 0))}
              </Typography>
              {assets.some(a => a.requiresProbateSecondDeath) && (
                <Chip size="small" icon={<GavelIcon />} label="Probate" color="warning" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ownership</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>At 1st Death</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>At 2nd Death</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Issues</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.assetId} hover>
                      <TableCell>
                        <Typography variant="body2">{asset.description}</Typography>
                        {asset.currentBeneficiaries.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Beneficiaries: {asset.currentBeneficiaries.join(', ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(asset.value)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{asset.currentOwner}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.currentOwnershipForm}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getPassageDescription(asset.passageMethodFirstDeath)}
                          color={asset.requiresProbateFirstDeath ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getPassageDescription(asset.passageMethodSecondDeath)}
                          color={asset.requiresProbateSecondDeath ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {asset.issues.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {asset.issues.map((issue, i) => (
                              <Chip
                                key={i}
                                size="small"
                                label={issue.title}
                                color={getSeverityColor(issue.severity)}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <CheckCircleIcon color="success" fontSize="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Second Death Problem Explanation */}
      {stats.assetsWithNoSuccessor > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 3,
            bgcolor: '#fff3e0',
            border: '1px solid #ffb74d',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: '#e65100', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon /> The "Second Death" Problem
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You have <strong>{stats.assetsWithNoSuccessor} asset(s)</strong> that pass to the surviving spouse
            at first death (good!), but then require probate when the survivor dies.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Joint accounts and property held as Tenants by Entirety or JTWROS automatically pass to the
            survivor. However, after the survivor dies, these assets become part of their individual estate
            and will require probate unless retitled to a trust or given a beneficiary designation.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CurrentPlanAnalysisComponent;
