'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useFormContext,
  DistributionPlan,
  AssetGift,
  CashGift,
  ResiduaryBeneficiary,
} from '../lib/FormContext';
import { CashGiftModal } from './CashGiftModal';

// Helper to format currency
const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(numValue)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numValue);
};

// Helper to parse value to number
const parseValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
};

// Interface for probate assets
interface ProbateAsset {
  id: string;
  description: string;
  value: number;
  type: string;
}

// Interface for available beneficiaries
interface AvailableBeneficiary {
  id: string;
  name: string;
  relationship: string;
}

interface DistributionPlanSectionProps {
  personType: 'client' | 'spouse';
  personName: string;
  spouseName?: string;
}

const DistributionPlanSection: React.FC<DistributionPlanSectionProps> = ({
  personType,
  personName,
  spouseName,
}) => {
  const { formData, updateFormData } = useFormContext();
  const [cashGiftModalOpen, setCashGiftModalOpen] = useState(false);
  const [editingCashGiftIndex, setEditingCashGiftIndex] = useState<number | null>(null);

  // Get the distribution plan for this person
  const plan: DistributionPlan = personType === 'client'
    ? formData.clientDistributionPlan
    : formData.spouseDistributionPlan;

  // Update the distribution plan
  const updatePlan = (updates: Partial<DistributionPlan>) => {
    const fieldName = personType === 'client' ? 'clientDistributionPlan' : 'spouseDistributionPlan';
    updateFormData({
      [fieldName]: { ...plan, ...updates },
    });
  };

  // Get available beneficiaries (children + other beneficiaries + spouse + charities)
  const availableBeneficiaries: AvailableBeneficiary[] = useMemo(() => {
    const beneficiaries: AvailableBeneficiary[] = [];

    // Add spouse if applicable
    if (spouseName && personType === 'client') {
      beneficiaries.push({ id: 'spouse', name: spouseName, relationship: 'Spouse' });
    } else if (personName && personType === 'spouse') {
      beneficiaries.push({ id: 'client', name: personName, relationship: 'Spouse' });
    }

    // Add children
    formData.children.forEach((child, index) => {
      beneficiaries.push({
        id: `child-${index}`,
        name: child.name,
        relationship: child.relationship || 'Child',
      });
    });

    // Add other beneficiaries
    formData.otherBeneficiaries.forEach((ben, index) => {
      beneficiaries.push({
        id: `beneficiary-${index}`,
        name: ben.name,
        relationship: ben.relationship || 'Other',
      });
    });

    // Add charities
    formData.charities.forEach((charity, index) => {
      beneficiaries.push({
        id: `charity-${index}`,
        name: charity.name,
        relationship: 'Charity',
      });
    });

    return beneficiaries;
  }, [formData.children, formData.otherBeneficiaries, formData.charities, spouseName, personName, personType]);

  // Get probate assets for this person
  // Includes: probate forms, joint ownership between spouses (TBE, JTWROS), and TIC
  const probateAssets: ProbateAsset[] = useMemo(() => {
    const assets: ProbateAsset[] = [];
    const ownerMatch = personType === 'client' ? 'Client' : 'Spouse';

    // Real Estate - includes:
    // 1. Probate forms (Sole, Life Estate, Living Trust)
    // 2. Tenants in Common (TIC) - person's share
    // 3. Joint ownership between spouses (TBE, JTWROS) - will pass to survivor then be distributed
    formData.realEstate.forEach((property, index) => {
      const isOwner = property.owner.includes(ownerMatch);
      if (!isOwner) return;

      // Include sole ownership, life estate, living trust
      const isProbateForm = ['Sole', 'Life Estate', 'Living Trust'].includes(property.ownershipForm);

      // Include Tenants in Common
      const isTIC = property.ownershipForm === 'Tenants in Common';

      // Include joint ownership between spouses (TBE, JTWROS) when owner is "Client and Spouse"
      const isJointBetweenSpouses = (property.ownershipForm === 'Tenants by Entirety' || property.ownershipForm === 'JTWROS')
        && property.owner === 'Client and Spouse';

      if (isProbateForm || isTIC || isJointBetweenSpouses) {
        const address = [property.street, property.city, property.state].filter(Boolean).join(', ');
        let typeLabel = 'Real Estate';
        if (isTIC) typeLabel = 'Real Estate (TIC)';
        if (isJointBetweenSpouses) typeLabel = `Real Estate (${property.ownershipForm})`;

        assets.push({
          id: `realEstate-${index}`,
          description: address || `Property ${index + 1}`,
          value: parseValue(property.value),
          type: typeLabel,
        });
      }
    });

    // Bank Accounts without beneficiaries
    formData.bankAccounts.forEach((account, index) => {
      const isOwner = account.owner.includes(ownerMatch) || account.owner === 'Joint';
      const hasBeneficiaries = account.hasBeneficiaries && account.primaryBeneficiaries.length > 0;
      if (isOwner && !hasBeneficiaries) {
        assets.push({
          id: `bankAccount-${index}`,
          description: `${account.accountType} at ${account.institution}`,
          value: parseValue(account.amount),
          type: 'Bank Account',
        });
      }
    });

    // Non-Qualified Investments without beneficiaries
    formData.nonQualifiedInvestments.forEach((investment, index) => {
      const isOwner = investment.owner.includes(ownerMatch) || investment.owner === 'Joint';
      const hasBeneficiaries = investment.hasBeneficiaries && investment.primaryBeneficiaries.length > 0;
      if (isOwner && !hasBeneficiaries) {
        assets.push({
          id: `investment-${index}`,
          description: `${investment.description} at ${investment.institution}`,
          value: parseValue(investment.value),
          type: 'Investment',
        });
      }
    });

    // Vehicles
    formData.vehicles.forEach((vehicle, index) => {
      const isOwner = vehicle.owner.includes(ownerMatch) || vehicle.owner === 'Joint';
      if (isOwner) {
        assets.push({
          id: `vehicle-${index}`,
          description: vehicle.yearMakeModel,
          value: parseValue(vehicle.value),
          type: 'Vehicle',
        });
      }
    });

    // Other Assets without beneficiaries
    formData.otherAssets.forEach((asset, index) => {
      const isOwner = asset.owner.includes(ownerMatch) || asset.owner === 'Joint';
      const hasBeneficiaries = asset.hasBeneficiaries && asset.primaryBeneficiaries.length > 0;
      if (isOwner && !hasBeneficiaries) {
        assets.push({
          id: `otherAsset-${index}`,
          description: asset.description,
          value: parseValue(asset.value),
          type: 'Other',
        });
      }
    });

    // Business Interests
    formData.businessInterests.forEach((business, index) => {
      const isOwner = business.owner.includes(ownerMatch);
      if (isOwner) {
        const ownershipPct = parseFloat(business.ownershipPercentage) || 100;
        const fullValue = parseValue(business.fullValue);
        const proRataValue = (fullValue * ownershipPct) / 100;
        assets.push({
          id: `business-${index}`,
          description: `${business.businessName} (${business.ownershipPercentage}%)`,
          value: proRataValue,
          type: 'Business',
        });
      }
    });

    return assets;
  }, [formData, personType]);

  // Handle distribution type change
  const handleDistributionTypeChange = (type: 'sweetheart' | 'spouseFirstDiffering' | 'custom') => {
    if (type === 'sweetheart') {
      // Clear specific gifts when switching to sweetheart plan
      updatePlan({
        distributionType: 'sweetheart',
        isSweetheartPlan: true,
        hasSpecificGifts: false,
        specificAssetGifts: [],
        residuaryBeneficiaries: [],
        residuaryShareType: 'equal',
      });
    } else if (type === 'spouseFirstDiffering') {
      // Spouse is primary, show residuary for contingent beneficiaries with custom percentages
      updatePlan({
        distributionType: 'spouseFirstDiffering',
        isSweetheartPlan: false,
        hasSpecificGifts: false,
        specificAssetGifts: [],
        residuaryShareType: 'percentage',
      });
    } else {
      // Custom - full control
      updatePlan({
        distributionType: 'custom',
        isSweetheartPlan: false,
      });
    }
  };

  // Handle specific asset gift checkbox
  const handleAssetRecipientToggle = (assetId: string, recipientId: string) => {
    const existingGift = plan.specificAssetGifts.find(g => g.assetId === assetId);
    const asset = probateAssets.find(a => a.id === assetId);

    if (existingGift) {
      const hasRecipient = existingGift.recipientIds.includes(recipientId);
      const newRecipientIds = hasRecipient
        ? existingGift.recipientIds.filter(id => id !== recipientId)
        : [...existingGift.recipientIds, recipientId];

      if (newRecipientIds.length === 0) {
        // Remove the gift entirely if no recipients
        updatePlan({
          specificAssetGifts: plan.specificAssetGifts.filter(g => g.assetId !== assetId),
        });
      } else {
        updatePlan({
          specificAssetGifts: plan.specificAssetGifts.map(g =>
            g.assetId === assetId ? { ...g, recipientIds: newRecipientIds } : g
          ),
        });
      }
    } else if (asset) {
      // Create new gift
      updatePlan({
        specificAssetGifts: [
          ...plan.specificAssetGifts,
          {
            assetId,
            assetDescription: asset.description,
            assetValue: asset.value,
            recipientIds: [recipientId],
          },
        ],
      });
    }
  };

  // Check if a recipient is selected for an asset
  const isRecipientSelected = (assetId: string, recipientId: string): boolean => {
    const gift = plan.specificAssetGifts.find(g => g.assetId === assetId);
    return gift?.recipientIds.includes(recipientId) || false;
  };

  // Cash Gift handlers
  const handleAddCashGift = () => {
    setEditingCashGiftIndex(null);
    setCashGiftModalOpen(true);
  };

  const handleEditCashGift = (index: number) => {
    setEditingCashGiftIndex(index);
    setCashGiftModalOpen(true);
  };

  const handleSaveCashGift = (gift: CashGift) => {
    if (editingCashGiftIndex !== null) {
      const newGifts = [...plan.cashGifts];
      newGifts[editingCashGiftIndex] = gift;
      updatePlan({ cashGifts: newGifts });
    } else {
      updatePlan({ cashGifts: [...plan.cashGifts, gift] });
    }
    setCashGiftModalOpen(false);
    setEditingCashGiftIndex(null);
  };

  const handleDeleteCashGift = () => {
    if (editingCashGiftIndex !== null) {
      updatePlan({
        cashGifts: plan.cashGifts.filter((_, i) => i !== editingCashGiftIndex),
      });
      setCashGiftModalOpen(false);
      setEditingCashGiftIndex(null);
    }
  };

  // Residuary beneficiary handlers
  const handleAddResiduaryBeneficiary = (beneficiary: AvailableBeneficiary) => {
    if (plan.residuaryBeneficiaries.find(b => b.id === beneficiary.id)) return;

    const equalShare = 100 / (plan.residuaryBeneficiaries.length + 1);
    const newBeneficiaries = [
      ...plan.residuaryBeneficiaries.map(b => ({ ...b, percentage: equalShare })),
      { ...beneficiary, percentage: equalShare },
    ];
    updatePlan({ residuaryBeneficiaries: newBeneficiaries });
  };

  const handleRemoveResiduaryBeneficiary = (id: string) => {
    const remaining = plan.residuaryBeneficiaries.filter(b => b.id !== id);
    if (remaining.length > 0 && plan.residuaryShareType === 'equal') {
      const equalShare = 100 / remaining.length;
      updatePlan({
        residuaryBeneficiaries: remaining.map(b => ({ ...b, percentage: equalShare })),
      });
    } else {
      updatePlan({ residuaryBeneficiaries: remaining });
    }
  };

  const handlePercentageChange = (id: string, percentage: number) => {
    updatePlan({
      residuaryBeneficiaries: plan.residuaryBeneficiaries.map(b =>
        b.id === id ? { ...b, percentage } : b
      ),
    });
  };

  const handleShareTypeChange = (shareType: 'equal' | 'percentage') => {
    if (shareType === 'equal' && plan.residuaryBeneficiaries.length > 0) {
      const equalShare = 100 / plan.residuaryBeneficiaries.length;
      updatePlan({
        residuaryShareType: shareType,
        residuaryBeneficiaries: plan.residuaryBeneficiaries.map(b => ({ ...b, percentage: equalShare })),
      });
    } else {
      updatePlan({ residuaryShareType: shareType });
    }
  };

  // Calculate total percentage
  const totalPercentage = plan.residuaryBeneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
  const percentageValid = Math.abs(totalPercentage - 100) < 0.01;

  // Check if person is married (has a spouse)
  const isMarried = formData.maritalStatus === 'Married' ||
                    formData.maritalStatus === 'Second Marriage' ||
                    formData.maritalStatus === 'Domestic Partnership';

  // Get beneficiaries not yet added to residuary
  // Exclude spouse since spouse is always primary beneficiary in custom distribution
  const availableForResiduary = availableBeneficiaries.filter(
    b => b.id !== 'spouse' && b.id !== 'client' && !plan.residuaryBeneficiaries.find(rb => rb.id === b.id)
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: '#1a237e' }}>
        {personName}&apos;s Distribution Plan
      </Typography>

      {/* Distribution Plan Type Options */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ fontWeight: 500 }}>
            How would you like to distribute your estate?
          </FormLabel>
          <RadioGroup
            value={plan.distributionType || (isMarried ? 'sweetheart' : 'custom')}
            onChange={(e) => handleDistributionTypeChange(e.target.value as 'sweetheart' | 'spouseFirstDiffering' | 'custom')}
          >
            {/* Only show spouse-related options if married */}
            {isMarried && (
              <>
                <FormControlLabel
                  value="sweetheart"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Sweetheart Plan</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Everything to {spouseName || 'spouse'} first, then equally to children
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mb: 1 }}
                />
                <FormControlLabel
                  value="spouseFirstDiffering"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">All to Spouse First, Differing Amounts to Others</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {spouseName || 'Spouse'} receives everything first, then specify different amounts for each beneficiary
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mb: 1 }}
                />
              </>
            )}
            <FormControlLabel
              value="custom"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">{isMarried ? 'Completely Custom Distribution' : 'Custom Distribution'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isMarried
                      ? 'Specify exactly how each asset and the residuary should be distributed'
                      : 'Specify how you want your assets distributed to your beneficiaries'}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Sweetheart Plan Display */}
      {(plan.distributionType === 'sweetheart' || (!plan.distributionType && plan.isSweetheartPlan)) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Sweetheart Plan:</strong> All assets will pass to {spouseName || 'your spouse'} first.
            If {spouseName || 'your spouse'} predeceases you, assets will be distributed equally among your children.
          </Typography>
        </Alert>
      )}

      {/* Spouse First with Differing Amounts */}
      {plan.distributionType === 'spouseFirstDiffering' && (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Primary Beneficiary:</strong> {spouseName || 'Your spouse'} will receive everything first.
              The contingent beneficiaries below will receive their specified shares if {spouseName || 'your spouse'} predeceases you.
            </Typography>
          </Alert>

          {/* Residuary Distribution for Contingent Beneficiaries */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>
                Contingent Beneficiaries
                {plan.residuaryBeneficiaries.length > 0 && (
                  <Chip
                    label={plan.residuaryBeneficiaries.length}
                    size="small"
                    sx={{ ml: 1 }}
                    color="primary"
                  />
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Specify what percentage each beneficiary should receive if {spouseName || 'your spouse'} predeceases you.
              </Typography>

              {/* Residuary Beneficiaries Table */}
              {plan.residuaryBeneficiaries.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120 }}>Share %</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 60 }}>Remove</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plan.residuaryBeneficiaries.map(ben => (
                        <TableRow key={ben.id}>
                          <TableCell>{ben.name}</TableCell>
                          <TableCell>{ben.relationship}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={ben.percentage}
                              onChange={(e) => handlePercentageChange(ben.id, parseFloat(e.target.value) || 0)}
                              inputProps={{ min: 0, max: 100, step: 0.01 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveResiduaryBeneficiary(ben.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: percentageValid ? '#e8f5e9' : '#ffebee' }}>
                        <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {totalPercentage.toFixed(2)}%
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!percentageValid && plan.residuaryBeneficiaries.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Total percentage must equal 100%. Current total: {totalPercentage.toFixed(2)}%
                </Alert>
              )}

              {/* Add Beneficiary Buttons - exclude spouse since they're primary */}
              {availableBeneficiaries.filter(b => b.id !== 'spouse' && b.id !== 'client' && !plan.residuaryBeneficiaries.find(rb => rb.id === b.id)).length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                    Add:
                  </Typography>
                  {availableBeneficiaries
                    .filter(b => b.id !== 'spouse' && b.id !== 'client' && !plan.residuaryBeneficiaries.find(rb => rb.id === b.id))
                    .map(ben => (
                      <Button
                        key={ben.id}
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddResiduaryBeneficiary(ben)}
                      >
                        {ben.name}
                      </Button>
                    ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Notes */}
          <TextField
            fullWidth
            label="Distribution Notes"
            value={plan.notes}
            onChange={(e) => updatePlan({ notes: e.target.value })}
            variant="outlined"
            multiline
            rows={2}
            placeholder="Any additional notes about this distribution plan..."
          />
        </>
      )}

      {/* Custom Distribution */}
      {plan.distributionType === 'custom' && (
        <>
          {/* Specific Asset Gifts */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>
                Specific Asset Gifts
                {plan.specificAssetGifts.length > 0 && (
                  <Chip
                    label={plan.specificAssetGifts.length}
                    size="small"
                    sx={{ ml: 1 }}
                    color="primary"
                  />
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select which beneficiaries should receive each specific asset.
              </Typography>

              {probateAssets.length === 0 ? (
                <Alert severity="info">
                  No probate assets found. Assets with designated beneficiaries (like retirement accounts)
                  pass outside of the Will/Trust.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Asset</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Value</TableCell>
                        {availableBeneficiaries.map(ben => (
                          <TableCell key={ben.id} sx={{ fontWeight: 600, textAlign: 'center', minWidth: 80 }}>
                            {ben.name.split(' ')[0]}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {probateAssets.map(asset => (
                        <TableRow key={asset.id}>
                          <TableCell>{asset.description}</TableCell>
                          <TableCell>{asset.type}</TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(asset.value)}</TableCell>
                          {availableBeneficiaries.map(ben => (
                            <TableCell key={ben.id} sx={{ textAlign: 'center' }}>
                              <Checkbox
                                size="small"
                                checked={isRecipientSelected(asset.id, ben.id)}
                                onChange={() => handleAssetRecipientToggle(asset.id, ben.id)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Cash Gifts */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>
                Cash Gifts
                {plan.cashGifts.length > 0 && (
                  <Chip
                    label={plan.cashGifts.length}
                    size="small"
                    sx={{ ml: 1 }}
                    color="primary"
                  />
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Specify cash amounts to give to specific individuals.
              </Typography>

              {plan.cashGifts.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 60 }}>Edit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plan.cashGifts.map((gift, index) => (
                        <TableRow key={index}>
                          <TableCell>{gift.recipientName}</TableCell>
                          <TableCell>{gift.relationship}</TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>{gift.amount}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleEditCashGift(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddCashGift}
                size="small"
              >
                Add Cash Gift
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Residuary Distribution */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>
                Residuary Distribution
                {plan.residuaryBeneficiaries.length > 0 && (
                  <Chip
                    label={plan.residuaryBeneficiaries.length}
                    size="small"
                    sx={{ ml: 1 }}
                    color="primary"
                  />
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Show spouse as primary beneficiary notice */}
              {spouseName && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Primary Beneficiary:</strong> {spouseName} will receive the residuary estate first.
                    The contingent beneficiaries below will receive their shares if {spouseName} predeceases you.
                  </Typography>
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The residuary is everything that remains after specific gifts and cash gifts.
                {spouseName ? ' Select contingent beneficiaries and their shares.' : ' Select who receives the residuary and in what shares.'}
              </Typography>

              {/* Share Type Selection */}
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">
                  {spouseName ? 'Contingent Distribution Method' : 'Distribution Method'}
                </FormLabel>
                <RadioGroup
                  row
                  value={plan.residuaryShareType}
                  onChange={(e) => handleShareTypeChange(e.target.value as 'equal' | 'percentage')}
                >
                  <FormControlLabel value="equal" control={<Radio />} label="Equal Shares" />
                  <FormControlLabel value="percentage" control={<Radio />} label="Custom Percentages" />
                </RadioGroup>
              </FormControl>

              {/* Residuary Beneficiaries Table */}
              {plan.residuaryBeneficiaries.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120 }}>Share %</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 60 }}>Remove</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plan.residuaryBeneficiaries.map(ben => (
                        <TableRow key={ben.id}>
                          <TableCell>{ben.name}</TableCell>
                          <TableCell>{ben.relationship}</TableCell>
                          <TableCell>
                            {plan.residuaryShareType === 'equal' ? (
                              <Typography>{ben.percentage.toFixed(2)}%</Typography>
                            ) : (
                              <TextField
                                type="number"
                                size="small"
                                value={ben.percentage}
                                onChange={(e) => handlePercentageChange(ben.id, parseFloat(e.target.value) || 0)}
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                sx={{ width: 80 }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveResiduaryBeneficiary(ben.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: percentageValid ? '#e8f5e9' : '#ffebee' }}>
                        <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {totalPercentage.toFixed(2)}%
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!percentageValid && plan.residuaryBeneficiaries.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Total percentage must equal 100%. Current total: {totalPercentage.toFixed(2)}%
                </Alert>
              )}

              {/* Add Beneficiary Buttons */}
              {availableForResiduary.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                    Add:
                  </Typography>
                  {availableForResiduary.map(ben => (
                    <Button
                      key={ben.id}
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddResiduaryBeneficiary(ben)}
                    >
                      {ben.name}
                    </Button>
                  ))}
                </Box>
              )}

              {availableForResiduary.length === 0 && plan.residuaryBeneficiaries.length === 0 && (
                <Alert severity="warning">
                  No beneficiaries available. Please add children, other beneficiaries, or charities first.
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Notes */}
          <TextField
            fullWidth
            label="Distribution Notes"
            value={plan.notes}
            onChange={(e) => updatePlan({ notes: e.target.value })}
            variant="outlined"
            multiline
            rows={2}
            placeholder="Any additional notes about this distribution plan..."
          />
        </>
      )}

      {/* Cash Gift Modal */}
      <CashGiftModal
        open={cashGiftModalOpen}
        onClose={() => {
          setCashGiftModalOpen(false);
          setEditingCashGiftIndex(null);
        }}
        onSave={handleSaveCashGift}
        onDelete={editingCashGiftIndex !== null ? handleDeleteCashGift : undefined}
        initialData={editingCashGiftIndex !== null ? plan.cashGifts[editingCashGiftIndex] : undefined}
        isEdit={editingCashGiftIndex !== null}
      />
    </Box>
  );
};

export default DistributionPlanSection;
