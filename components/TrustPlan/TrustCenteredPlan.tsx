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
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';

import {
  TrustCenteredPlan as TrustCenteredPlanType,
  AssetRetitling,
  BeneficiaryChange,
  ProjectedBenefits,
} from './trustPlanTypes';
import { formatCurrency } from './trustPlanUtils';

interface TrustCenteredPlanProps {
  plan: TrustCenteredPlanType;
  onPlanChange: (plan: TrustCenteredPlanType) => void;
}

export const TrustCenteredPlanComponent: React.FC<TrustCenteredPlanProps> = ({
  plan,
  onPlanChange,
}) => {
  // Handle toggling acceptance of a retitling recommendation
  const handleRetitlingToggle = (index: number) => {
    const newRetitlings = [...plan.assetsToRetitle];
    newRetitlings[index] = { ...newRetitlings[index], accepted: !newRetitlings[index].accepted };

    onPlanChange({
      ...plan,
      assetsToRetitle: newRetitlings,
    });
  };

  // Handle toggling acceptance of a beneficiary change
  const handleBeneficiaryChangeToggle = (index: number) => {
    const newChanges = [...plan.beneficiaryChanges];
    newChanges[index] = { ...newChanges[index], accepted: !newChanges[index].accepted };

    onPlanChange({
      ...plan,
      beneficiaryChanges: newChanges,
    });
  };

  // Handle trust name change
  const handleTrustNameChange = (newName: string) => {
    onPlanChange({
      ...plan,
      trustName: newName,
    });
  };

  // Handle distribution age change
  const handleDistributionAgeChange = (age: number) => {
    onPlanChange({
      ...plan,
      distributionPlan: {
        ...plan.distributionPlan,
        distributionAge: age,
      },
    });
  };

  // Calculate stats
  const acceptedRetitlings = plan.assetsToRetitle.filter(a => a.accepted);
  const acceptedBeneficiaryChanges = plan.beneficiaryChanges.filter(a => a.accepted);
  const totalRetitlingValue = acceptedRetitlings.reduce((sum, a) => sum + a.assetValue, 0);
  const totalBeneficiaryChangeValue = acceptedBeneficiaryChanges.reduce((sum, a) => sum + a.assetValue, 0);

  return (
    <Box>
      {/* Trust Details */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1b5e20' }}>
          Proposed Trust Structure
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <TextField
              fullWidth
              label="Trust Name"
              value={plan.trustName}
              onChange={(e) => handleTrustNameChange(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ bgcolor: 'white', mb: 2 }}
            />

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Trust Type
            </Typography>
            <Chip
              label={plan.trustType === 'joint_revocable' ? 'Joint Revocable Trust' : 'Individual Revocable Trust'}
              color="primary"
              sx={{ mb: 2 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Grantors (Trust Creators)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {plan.grantors.map((grantor, i) => (
                <Chip key={i} icon={<PersonIcon />} label={grantor} variant="outlined" />
              ))}
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Successor Trustees
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {plan.successorTrustees.length > 0 ? (
                plan.successorTrustees.map((trustee, i) => (
                  <Chip key={i} icon={<GroupIcon />} label={`${i + 1}. ${trustee}`} variant="outlined" size="small" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  No successor trustees designated
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Assets to Retitle */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <HomeIcon color="primary" />
            <Typography sx={{ fontWeight: 600 }}>
              Assets to Retitle to Trust ({acceptedRetitlings.length}/{plan.assetsToRetitle.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', mr: 2 }}>
              {formatCurrency(totalRetitlingValue)}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {plan.assetsToRetitle.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No assets require retitling - all assets are properly structured.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ fontWeight: 600 }}>Accept</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Asset</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Current Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Proposed Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.assetsToRetitle.map((retitling, index) => (
                    <TableRow
                      key={retitling.assetId}
                      hover
                      sx={{ opacity: retitling.accepted ? 1 : 0.6 }}
                    >
                      <TableCell padding="checkbox">
                        <Switch
                          checked={retitling.accepted}
                          onChange={() => handleRetitlingToggle(index)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{retitling.assetDescription}</Typography>
                      </TableCell>
                      <TableCell>{formatCurrency(retitling.assetValue)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {retitling.currentTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <ArrowForwardIcon color="action" fontSize="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                          {retitling.proposedTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={retitling.method === 'deed' ? 'New Deed' : 'Account Retitle'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Beneficiary Changes */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <PersonIcon color="primary" />
            <Typography sx={{ fontWeight: 600 }}>
              Beneficiary Designation Changes ({acceptedBeneficiaryChanges.length}/{plan.beneficiaryChanges.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', mr: 2 }}>
              {formatCurrency(totalBeneficiaryChangeValue)}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {plan.beneficiaryChanges.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No beneficiary changes recommended - current designations are appropriate.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ fontWeight: 600 }}>Accept</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Asset</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Current Beneficiary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Proposed Beneficiary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.beneficiaryChanges.map((change, index) => (
                    <TableRow
                      key={change.assetId}
                      hover
                      sx={{ opacity: change.accepted ? 1 : 0.6 }}
                    >
                      <TableCell padding="checkbox">
                        <Switch
                          checked={change.accepted}
                          onChange={() => handleBeneficiaryChangeToggle(index)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{change.assetDescription}</Typography>
                      </TableCell>
                      <TableCell>{formatCurrency(change.assetValue)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {change.currentBeneficiary || 'None'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <ArrowForwardIcon color="action" fontSize="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                          {change.proposedBeneficiary}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={change.reason}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {change.reason}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Distribution Plan Settings */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon color="primary" />
            <Typography sx={{ fontWeight: 600 }}>
              Trust Distribution Settings
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Distribution Age for Beneficiaries
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {[18, 21, 25, 30, 35].map((age) => (
                  <Chip
                    key={age}
                    label={age}
                    onClick={() => handleDistributionAgeChange(age)}
                    color={plan.distributionPlan.distributionAge === age ? 'primary' : 'default'}
                    variant={plan.distributionPlan.distributionAge === age ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Beneficiaries will receive their inheritance outright when they reach this age.
                Until then, the trustee manages the funds for their benefit.
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Distribution Method
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={plan.distributionPlan.perStirpes}
                    onChange={(e) => onPlanChange({
                      ...plan,
                      distributionPlan: {
                        ...plan.distributionPlan,
                        perStirpes: e.target.checked,
                      },
                    })}
                  />
                }
                label="Per Stirpes"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Per Stirpes: If a beneficiary predeceases, their share goes to their children.
              </Typography>
            </Box>
          </Box>

          {plan.distributionPlan.residuaryBeneficiaries.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Residuary Beneficiaries
              </Typography>
              <List dense>
                {plan.distributionPlan.residuaryBeneficiaries.map((beneficiary, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={beneficiary.name}
                      secondary={`${beneficiary.relationship} - ${beneficiary.percentage}%`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Action Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          bgcolor: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon /> Implementation Summary
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1565c0' }}>
              {acceptedRetitlings.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assets to Retitle
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1565c0' }}>
              {acceptedBeneficiaryChanges.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Beneficiary Changes
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#2e7d32' }}>
              {formatCurrency(totalRetitlingValue + totalBeneficiaryChangeValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Protected from Probate
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TrustCenteredPlanComponent;
