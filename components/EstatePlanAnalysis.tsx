'use client';

import React, { useState, useMemo } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  ButtonGroup,
  Divider,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormContext, MaritalStatus, RealEstateOwner, OwnershipForm, DistributionPlan, ResiduaryBeneficiary } from '../lib/FormContext';

type AnalysisView = 'summary' | 'client-first' | 'spouse-first';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// Generic asset interface for categorization
interface CategorizedAsset {
  type: string;
  description: string;
  value: string;
  owner: string;
  ownershipForm?: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries?: string[]; // Store beneficiaries for scenario analysis
  secondaryBeneficiaries?: string[]; // Store secondary beneficiaries
  secondaryDistributionType?: 'Per Stirpes' | 'Per Capita' | ''; // Distribution type for secondary beneficiaries
  clientPercentage?: string;
  spousePercentage?: string;
  clientSpouseJointType?: string; // For TIC with "Client, Spouse and Other"
  clientSpouseCombinedPercentage?: string; // For TIC with "Client, Spouse and Other" when owned as TBE/JTWROS
  // For TIC assets, this holds the calculated value based on ownership percentage
  calculatedValue?: number;
  // For scenario display - how asset passes (e.g., "Joint with Spouse", "Beneficiary Designation")
  passageMethod?: string;
  // For personal property memorandum items - beneficiaries are called "legatees"
  isPersonalPropertyMemo?: boolean;
}

// Beneficiary share from a specific asset
interface BeneficiaryShare {
  beneficiaryName: string;
  percentage: number;
  amount: number;
}

// Asset with beneficiary breakdown
interface AssetWithBeneficiaryBreakdown {
  asset: CategorizedAsset;
  displayValue: number;
  beneficiaryShares: BeneficiaryShare[];
}

// Heir's total inheritance summary
interface HeirInheritance {
  name: string;
  assets: { description: string; amount: number }[];
  total: number;
}

// Asset category definition
interface AssetCategory {
  id: string;
  title: string;
  description: string;
  assets: CategorizedAsset[];
  totalValue: number;
}

const formatCurrency = (value: string | number): string => {
  if (!value) return '$0.00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

const parsePercentage = (value: string): number => {
  if (!value) return 0;
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num / 100; // Convert percentage to decimal
};

// Helper to format beneficiary names from an array
const formatBeneficiaryList = (beneficiaries: string[], distributionType?: string): string => {
  if (!beneficiaries || beneficiaries.length === 0) return '';
  const names = beneficiaries.join(', ');
  if (distributionType && distributionType !== '') {
    return `${names} (${distributionType})`;
  }
  return names;
};

// Helper to format Will residuary beneficiaries with percentages
// For sweetheart plans where spouse has predeceased, shows children as contingent beneficiaries
const formatResiduaryBeneficiaries = (
  residuaryBeneficiaries: ResiduaryBeneficiary[],
  shareType: 'equal' | 'percentage',
  distributionPlan?: DistributionPlan,
  children?: { name: string }[]
): string => {
  // For sweetheart plans, if no residuary beneficiaries are set, assume children share equally
  if (distributionPlan?.distributionType === 'sweetheart' || distributionPlan?.isSweetheartPlan) {
    if (children && children.length > 0) {
      const childNames = children.map(c => c.name).join(', ');
      return `${childNames} (Equal Shares)`;
    }
    return 'Children (Equal Shares)';
  }

  if (!residuaryBeneficiaries || residuaryBeneficiaries.length === 0) return 'Per Will';

  if (shareType === 'equal') {
    const names = residuaryBeneficiaries.map(b => b.name).join(', ');
    return `${names} (Equal Shares)`;
  }

  // Percentage shares - show each beneficiary with their percentage
  return residuaryBeneficiaries
    .map(b => `${b.name} (${b.percentage}%)`)
    .join(', ');
};

// Normalize beneficiary name by extracting actual name from prefixed formats
// e.g., "child:0:JR Ewing Jr" -> "JR Ewing Jr"
// e.g., "spouse:Jane Doe" -> "Jane Doe"
// e.g., "beneficiary:1:John Smith" -> "John Smith"
const normalizeBeneficiaryName = (name: string): string => {
  // Check for patterns like "child:0:Name", "spouse:Name", "beneficiary:1:Name"
  const colonParts = name.split(':');
  if (colonParts.length >= 2) {
    // If format is "type:index:name" (3+ parts), return everything after the second colon
    if (colonParts.length >= 3) {
      return colonParts.slice(2).join(':').trim();
    }
    // If format is "type:name" (2 parts) and first part looks like a type identifier
    const firstPart = colonParts[0].toLowerCase();
    if (['child', 'spouse', 'beneficiary', 'charity', 'client'].includes(firstPart) ||
        /^(child|spouse|beneficiary|charity)\d*$/.test(firstPart)) {
      return colonParts.slice(1).join(':').trim();
    }
  }
  return name.trim();
};

// Filter out deceased persons from beneficiary list
const filterOutDeceased = (
  beneficiaries: string[] | undefined,
  deceasedNames: string[]
): string[] => {
  if (!beneficiaries || beneficiaries.length === 0) return [];

  return beneficiaries.filter(b => {
    const bLower = b.toLowerCase();
    // Check if this beneficiary matches any deceased person
    return !deceasedNames.some(deceased => {
      const deceasedLower = deceased.toLowerCase();
      return bLower.includes(deceasedLower) ||
             deceasedLower.includes(bLower) ||
             (bLower === 'spouse' && deceasedNames.length > 0) ||
             (bLower === 'client' && deceasedNames.length > 0);
    });
  });
};

// Calculate beneficiary shares for an asset based on Will distribution or designated beneficiaries
// Key logic:
// 1. Filter out any deceased persons from beneficiary lists
// 2. If primary beneficiaries remain after filtering -> use them
// 3. If primary beneficiaries are all deceased -> use secondary beneficiaries
// 4. If no beneficiaries remain -> use the Will plan
const calculateBeneficiaryShares = (
  assetValue: number,
  primaryBeneficiaries: string[] | undefined,
  secondaryBeneficiaries: string[] | undefined,
  distributionType: string | undefined,
  residuaryBeneficiaries: ResiduaryBeneficiary[] | undefined,
  shareType: 'equal' | 'percentage',
  distributionPlan: DistributionPlan | undefined,
  children: { name: string }[] | undefined,
  deceasedPersonNames: string[] // Names of people who have already died in this scenario
): BeneficiaryShare[] => {

  // Filter out deceased persons from primary beneficiaries
  const livingPrimaryBeneficiaries = filterOutDeceased(primaryBeneficiaries, deceasedPersonNames);

  // Filter out deceased persons from secondary beneficiaries
  const livingSecondaryBeneficiaries = filterOutDeceased(secondaryBeneficiaries, deceasedPersonNames);

  // Case 1: Living primary beneficiaries exist - use them
  if (livingPrimaryBeneficiaries.length > 0) {
    const sharePerBeneficiary = assetValue / livingPrimaryBeneficiaries.length;
    return livingPrimaryBeneficiaries.map(name => ({
      beneficiaryName: normalizeBeneficiaryName(name),
      percentage: 100 / livingPrimaryBeneficiaries.length,
      amount: sharePerBeneficiary,
    }));
  }

  // Case 2: No living primary beneficiaries - use secondary beneficiaries if they exist
  if (livingSecondaryBeneficiaries.length > 0) {
    const sharePerBeneficiary = assetValue / livingSecondaryBeneficiaries.length;
    return livingSecondaryBeneficiaries.map(name => ({
      beneficiaryName: normalizeBeneficiaryName(name),
      percentage: 100 / livingSecondaryBeneficiaries.length,
      amount: sharePerBeneficiary,
    }));
  }

  // Case 3: No living designated beneficiaries - use Will plan
  // For sweetheart plans, use children equally
  if (distributionPlan?.distributionType === 'sweetheart' || distributionPlan?.isSweetheartPlan) {
    if (children && children.length > 0) {
      const sharePerChild = assetValue / children.length;
      const percentPerChild = 100 / children.length;
      return children.map(child => ({
        beneficiaryName: normalizeBeneficiaryName(child.name),
        percentage: percentPerChild,
        amount: sharePerChild,
      }));
    }
    return [{ beneficiaryName: 'Children (per Will)', percentage: 100, amount: assetValue }];
  }

  // Use residuary beneficiaries from Will
  if (residuaryBeneficiaries && residuaryBeneficiaries.length > 0) {
    if (shareType === 'equal') {
      const sharePerBeneficiary = assetValue / residuaryBeneficiaries.length;
      const percentPerBeneficiary = 100 / residuaryBeneficiaries.length;
      return residuaryBeneficiaries.map(b => ({
        beneficiaryName: normalizeBeneficiaryName(b.name),
        percentage: percentPerBeneficiary,
        amount: sharePerBeneficiary,
      }));
    } else {
      // Percentage-based shares
      return residuaryBeneficiaries.map(b => ({
        beneficiaryName: normalizeBeneficiaryName(b.name),
        percentage: b.percentage,
        amount: (assetValue * b.percentage) / 100,
      }));
    }
  }

  // Fallback
  return [{ beneficiaryName: 'Per Will', percentage: 100, amount: assetValue }];
};

// Aggregate all beneficiary shares across multiple assets into heir inheritance totals
const aggregateHeirInheritance = (
  assetsWithShares: { asset: CategorizedAsset; displayValue: number; shares: BeneficiaryShare[] }[]
): HeirInheritance[] => {
  const heirMap = new Map<string, HeirInheritance>();

  assetsWithShares.forEach(({ asset, shares }) => {
    shares.forEach(share => {
      const existing = heirMap.get(share.beneficiaryName);
      if (existing) {
        existing.assets.push({ description: asset.description, amount: share.amount });
        existing.total += share.amount;
      } else {
        heirMap.set(share.beneficiaryName, {
          name: share.beneficiaryName,
          assets: [{ description: asset.description, amount: share.amount }],
          total: share.amount,
        });
      }
    });
  });

  // Sort by total amount descending
  return Array.from(heirMap.values()).sort((a, b) => b.total - a.total);
};

// Child type definition for filtering
interface ChildInfo {
  name: string;
  relationship: string;
}

// Filter children based on whose Will is being used for distribution
// When the surviving spouse dies, their Will distributes to "their children" which by default
// only includes children of that spouse (Child of Both + Child of Spouse Only)
// However, if stepchildren inclusion flags are checked, we include those stepchildren too
const getChildrenForWill = (
  allChildren: ChildInfo[],
  willOwner: 'client' | 'spouse',
  includeClientStepchildrenInSpouseWill: boolean,
  includeSpouseStepchildrenInClientWill: boolean
): ChildInfo[] => {
  return allChildren.filter(child => {
    const rel = child.relationship;

    if (willOwner === 'client') {
      // Client's Will includes:
      // - Child of Client Only (client's biological/adopted children from prior relationship)
      // - Child of Both (shared children)
      // - Child of Spouse Only if includeSpouseStepchildrenInClientWill is true
      if (rel === 'Child of Client Only' || rel === 'Child of Both') {
        return true;
      }
      if (rel === 'Child of Spouse Only' && includeSpouseStepchildrenInClientWill) {
        return true;
      }
      return false;
    } else {
      // Spouse's Will includes:
      // - Child of Spouse Only (spouse's biological/adopted children from prior relationship)
      // - Child of Both (shared children)
      // - Child of Client Only if includeClientStepchildrenInSpouseWill is true
      if (rel === 'Child of Spouse Only' || rel === 'Child of Both') {
        return true;
      }
      if (rel === 'Child of Client Only' && includeClientStepchildrenInSpouseWill) {
        return true;
      }
      return false;
    }
  });
};

// Calculate the proportional value for TIC assets based on client+spouse ownership percentages
const calculateTICValue = (
  totalValue: string,
  clientPercentage?: string,
  spousePercentage?: string,
  clientSpouseCombinedPercentage?: string
): number => {
  const total = parseCurrency(totalValue);

  // If combined percentage is provided (when client+spouse own as TBE/JTWROS), use it
  if (clientSpouseCombinedPercentage) {
    const combinedPct = parsePercentage(clientSpouseCombinedPercentage);
    return total * combinedPct;
  }

  // Otherwise, sum individual percentages
  const clientPct = parsePercentage(clientPercentage || '');
  const spousePct = parsePercentage(spousePercentage || '');
  const combinedPct = clientPct + spousePct;
  return total * combinedPct;
};

const CategoryAccordion: React.FC<{ category: AssetCategory; defaultExpanded?: boolean }> = ({
  category,
  defaultExpanded = false
}) => {
  const isEmpty = category.assets.length === 0;

  return (
    <Accordion defaultExpanded={defaultExpanded} disabled={isEmpty}>
      <AccordionSummary expandIcon={isEmpty ? null : <ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isEmpty ? 'text.secondary' : 'inherit' }}>
              {category.title}
            </Typography>
            <Chip
              label={isEmpty ? 'None' : `${category.assets.length} asset${category.assets.length !== 1 ? 's' : ''}`}
              size="small"
              color={isEmpty ? 'default' : 'primary'}
              variant="outlined"
            />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isEmpty ? 'text.secondary' : 'primary.main' }}>
            {formatCurrency(category.totalValue)}
          </Typography>
        </Box>
      </AccordionSummary>
      {!isEmpty && (
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {category.description}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Asset Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Beneficiaries/Legatees</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {category.assets.map((asset, index) => {
                // Use calculated value for TIC assets, otherwise use raw value
                const displayValue = asset.calculatedValue !== undefined
                  ? asset.calculatedValue
                  : asset.value;

                // Determine beneficiary/legatee display text
                let beneficiaryText = 'No';
                if (asset.isPersonalPropertyMemo) {
                  beneficiaryText = 'Legatees';
                } else if (asset.hasBeneficiaries) {
                  // For Lady Bird Deed or Life Estate, show the deed type
                  if (asset.ownershipForm === 'Lady Bird Deed') {
                    beneficiaryText = 'Yes - Lady Bird Deed';
                  } else if (asset.ownershipForm === 'Life Estate') {
                    beneficiaryText = 'Yes - Life Estate';
                  } else {
                    beneficiaryText = 'Yes';
                  }
                }

                return (
                  <TableRow key={index}>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.description}</TableCell>
                    <TableCell>{asset.owner}</TableCell>
                    <TableCell>{beneficiaryText}</TableCell>
                    <TableCell align="right">{formatCurrency(displayValue)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
      )}
    </Accordion>
  );
};

// Scenario section component for death order analysis - enhanced with beneficiary breakdown
interface ScenarioSectionProps {
  title: string;
  assets: CategorizedAsset[];
  totalValue: number;
  color?: string;
  subtitle?: string;
  // Props needed for beneficiary calculation
  distributionPlan?: DistributionPlan;
  children?: { name: string }[];
  showBeneficiaryBreakdown?: boolean;
  deceasedPersonNames?: string[]; // Names of people who have already died in this scenario
}

const ScenarioSection: React.FC<ScenarioSectionProps> = ({
  title,
  assets,
  totalValue,
  color = 'primary.main',
  subtitle,
  distributionPlan,
  children,
  showBeneficiaryBreakdown = false,
  deceasedPersonNames = []
}) => {
  if (assets.length === 0) return null;

  // Calculate beneficiary shares for each asset
  const assetsWithShares = assets.map(asset => {
    const displayValue = asset.calculatedValue !== undefined
      ? asset.calculatedValue
      : parseCurrency(asset.value);

    const shares = calculateBeneficiaryShares(
      displayValue,
      asset.primaryBeneficiaries,
      asset.secondaryBeneficiaries,
      asset.secondaryDistributionType,
      distributionPlan?.residuaryBeneficiaries,
      distributionPlan?.residuaryShareType || 'equal',
      distributionPlan,
      children,
      deceasedPersonNames
    );

    return { asset, displayValue, shares };
  });

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: subtitle ? 1 : 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color }}>
          {formatCurrency(totalValue)}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}

      {/* Asset list with beneficiary breakdown */}
      {assetsWithShares.map(({ asset, displayValue, shares }, index) => (
        <Box key={index} sx={{ mb: index < assetsWithShares.length - 1 ? 2 : 0 }}>
          {/* Asset header row */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'grey.100',
            p: 1,
            borderRadius: 1
          }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {asset.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {asset.description}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(displayValue)}
            </Typography>
          </Box>

          {/* Beneficiary breakdown table */}
          {showBeneficiaryBreakdown && shares.length > 0 && (
            <TableContainer sx={{ mt: 0.5 }}>
              <Table size="small">
                <TableBody>
                  {shares.map((share, shareIndex) => (
                    <TableRow key={shareIndex} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ pl: 3, py: 0.5, width: '60%' }}>
                        <Typography variant="body2">
                          → {share.beneficiaryName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5, width: '15%' }}>
                        <Typography variant="body2" color="text.secondary">
                          {share.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 0.5, width: '25%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(share.amount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ))}
    </Paper>
  );
};

// Heir Summary component - shows each heir's total inheritance with asset breakdown
interface HeirSummaryProps {
  title: string;
  heirs: HeirInheritance[];
}

const HeirSummary: React.FC<HeirSummaryProps> = ({ title, heirs }) => {
  if (heirs.length === 0) return null;

  const grandTotal = heirs.reduce((sum, heir) => sum + heir.total, 0);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {title}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {formatCurrency(grandTotal)}
        </Typography>
      </Box>

      {heirs.map((heir, heirIndex) => (
        <Accordion key={heirIndex} defaultExpanded={heirIndex === 0} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>
                {heir.name}
              </Typography>
              <Typography sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(heir.total)}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Asset</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {heir.assets.map((asset, assetIndex) => (
                    <TableRow key={assetIndex}>
                      <TableCell>{asset.description}</TableCell>
                      <TableCell align="right">{formatCurrency(asset.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Total for {heir.name}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(heir.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

// Asset liquidity priority for cash bequest deductions
// Cash bequests are paid from residuary/probate assets in order of liquidity
const ASSET_LIQUIDITY_PRIORITY: { [key: string]: number } = {
  'Checking': 1,
  'Savings': 2,
  'Money Market': 3,
  'Certificate of Deposit': 4,
  'Health Savings Account': 5,
  'Other': 6,
  'Bank Account': 7, // Generic bank account
  'Non-Qualified Investment': 10,
  'Retirement Account': 20,
  'Life Insurance': 30,
  'Vehicle': 40,
  'Other Asset': 50,
  'Business Interest': 60,
  'Real Estate': 100, // Least liquid
};

// Get liquidity priority for an asset (lower = more liquid)
const getAssetLiquidityPriority = (assetType: string, accountType?: string): number => {
  // For bank accounts, use the specific account type
  if (assetType === 'Bank Account' && accountType) {
    return ASSET_LIQUIDITY_PRIORITY[accountType] || ASSET_LIQUIDITY_PRIORITY['Bank Account'];
  }
  return ASSET_LIQUIDITY_PRIORITY[assetType] || 1000;
};

// Interface for tracking cash bequest deductions
interface CashBequestDeduction {
  assetDescription: string;
  assetType: string;
  originalValue: number;
  deductedAmount: number;
  remainingValue: number;
}

// Calculate total cash bequests and determine deductions from probate assets
const calculateCashBequestDeductions = (
  cashGifts: { beneficiaryName: string; amount: string }[],
  probateAssets: CategorizedAsset[]
): {
  totalCashBequests: number;
  deductions: CashBequestDeduction[];
  adjustedProbateAssets: CategorizedAsset[];
  remainingBequest: number;
} => {
  const totalCashBequests = cashGifts.reduce(
    (sum, gift) => sum + parseCurrency(gift.amount),
    0
  );

  if (totalCashBequests === 0 || probateAssets.length === 0) {
    return {
      totalCashBequests,
      deductions: [],
      adjustedProbateAssets: probateAssets,
      remainingBequest: 0,
    };
  }

  // Sort probate assets by liquidity (most liquid first)
  const sortedAssets = [...probateAssets].sort((a, b) => {
    const priorityA = getAssetLiquidityPriority(a.type, a.type === 'Bank Account' ? a.description : undefined);
    const priorityB = getAssetLiquidityPriority(b.type, b.type === 'Bank Account' ? b.description : undefined);
    return priorityA - priorityB;
  });

  const deductions: CashBequestDeduction[] = [];
  const adjustedAssets: CategorizedAsset[] = [];
  let remainingBequest = totalCashBequests;

  for (const asset of sortedAssets) {
    const assetValue = parseCurrency(asset.value);

    if (remainingBequest <= 0) {
      // No more deductions needed, keep asset as-is
      adjustedAssets.push(asset);
      continue;
    }

    if (assetValue <= remainingBequest) {
      // Fully consume this asset
      deductions.push({
        assetDescription: asset.description,
        assetType: asset.type,
        originalValue: assetValue,
        deductedAmount: assetValue,
        remainingValue: 0,
      });
      remainingBequest -= assetValue;
      // Don't add to adjustedAssets since it's fully consumed
    } else {
      // Partially consume this asset
      deductions.push({
        assetDescription: asset.description,
        assetType: asset.type,
        originalValue: assetValue,
        deductedAmount: remainingBequest,
        remainingValue: assetValue - remainingBequest,
      });
      // Add adjusted asset with remaining value
      adjustedAssets.push({
        ...asset,
        value: formatCurrency(assetValue - remainingBequest),
        calculatedValue: assetValue - remainingBequest,
      });
      remainingBequest = 0;
    }
  }

  return {
    totalCashBequests,
    deductions,
    adjustedProbateAssets: adjustedAssets,
    remainingBequest,
  };
};

const EstatePlanAnalysis: React.FC = () => {
  const { formData } = useFormContext();
  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);
  const [analysisView, setAnalysisView] = useState<AnalysisView>('summary');

  // Blended family detection for warning alerts
  const blendedFamilyInfo = useMemo(() => {
    const clientOnlyChildren = formData.children.filter(
      (child) => child.relationship === 'Child of Client Only'
    );
    const spouseOnlyChildren = formData.children.filter(
      (child) => child.relationship === 'Child of Spouse Only'
    );

    const hasClientStepchildren = clientOnlyChildren.length > 0;
    const hasSpouseStepchildren = spouseOnlyChildren.length > 0;
    const isBlendedFamily = hasClientStepchildren || hasSpouseStepchildren;

    // Determine if any stepchildren are excluded from the other spouse's Will
    const clientStepchildrenExcludedFromSpouseWill = hasClientStepchildren && !formData.includeClientStepchildrenInSpouseWill;
    const spouseStepchildrenExcludedFromClientWill = hasSpouseStepchildren && !formData.includeSpouseStepchildrenInClientWill;

    return {
      isBlendedFamily,
      hasClientStepchildren,
      hasSpouseStepchildren,
      clientOnlyChildrenNames: clientOnlyChildren.map(c => c.name),
      spouseOnlyChildrenNames: spouseOnlyChildren.map(c => c.name),
      clientStepchildrenExcludedFromSpouseWill,
      spouseStepchildrenExcludedFromClientWill,
    };
  }, [formData.children, formData.includeClientStepchildrenInSpouseWill, formData.includeSpouseStepchildrenInClientWill]);

  // Helper to check if asset is client-only (sole ownership or Lady Bird/Life Estate owned by Client)
  const isClientSole = (owner: string, ownershipForm?: string): boolean => {
    if (owner !== 'Client') return false;
    // Lady Bird Deed and Life Estate owned by Client are considered Client assets (non-probate)
    if (ownershipForm === 'Lady Bird Deed' || ownershipForm === 'Life Estate') return true;
    return !ownershipForm || ownershipForm === 'Sole';
  };

  // Helper to check if asset is spouse-only (sole ownership or Lady Bird/Life Estate owned by Spouse)
  const isSpouseSole = (owner: string, ownershipForm?: string): boolean => {
    if (owner !== 'Spouse') return false;
    // Lady Bird Deed and Life Estate owned by Spouse are considered Spouse assets (non-probate)
    if (ownershipForm === 'Lady Bird Deed' || ownershipForm === 'Life Estate') return true;
    return !ownershipForm || ownershipForm === 'Sole';
  };

  // Helper to check if joint client+spouse with TBE, JTWROS, Lady Bird Deed, or Life Estate
  // For assets without ownershipForm (like bank accounts), treat "Client and Spouse" as joint
  const isJointClientSpouse = (owner: string, ownershipForm?: string): boolean => {
    if (owner !== 'Client and Spouse') return false;
    // If no ownership form specified (e.g., bank accounts), treat as joint
    if (!ownershipForm) return true;
    return ownershipForm === 'Tenants by Entirety' ||
           ownershipForm === 'JTWROS' ||
           ownershipForm === 'Lady Bird Deed' ||
           ownershipForm === 'Life Estate';
  };

  // Helper to check if Lady Bird Deed or Life Estate (has remainder beneficiaries)
  const isLadyBirdOrLifeEstate = (ownershipForm?: string): boolean => {
    return ownershipForm === 'Lady Bird Deed' || ownershipForm === 'Life Estate';
  };

  // Helper to check if TIC ownership
  const isTIC = (ownershipForm?: string): boolean => {
    return ownershipForm === 'Tenants in Common';
  };

  // Helper to check if JTWROS with others
  const isJTWROSWithOther = (owner: string, ownershipForm?: string): boolean => {
    return ownershipForm === 'JTWROS' &&
      (owner === 'Client and Other' || owner === 'Spouse and Other' || owner === 'Client, Spouse and Other');
  };

  // Helper to determine passage method based on ownership
  const getPassageMethod = (owner: string, ownershipForm?: string, hasBeneficiaries?: boolean): string => {
    // Lady Bird Deed - life estate with remainder to beneficiaries
    if (isLadyBirdOrLifeEstate(ownershipForm)) {
      if (owner === 'Client and Spouse') {
        return hasBeneficiaries
          ? 'Lady Bird Deed (Joint Life Estate → Remainder Beneficiaries)'
          : 'Lady Bird Deed (Joint Life Estate)';
      }
      if (owner === 'Client') {
        return hasBeneficiaries
          ? 'Lady Bird Deed (Life Estate → Remainder Beneficiaries)'
          : 'Lady Bird Deed (Life Estate)';
      }
      if (owner === 'Spouse') {
        return hasBeneficiaries
          ? 'Lady Bird Deed (Life Estate → Remainder Beneficiaries)'
          : 'Lady Bird Deed (Life Estate)';
      }
    }
    if (owner === 'Client and Spouse') {
      if (ownershipForm === 'Tenants by Entirety') return 'Joint with Spouse (TBE)';
      if (ownershipForm === 'JTWROS') return 'Joint with Spouse (JTWROS)';
      // For assets without ownershipForm (like bank accounts), treat as joint
      if (!ownershipForm) return 'Joint with Spouse';
    }
    if (ownershipForm === 'JTWROS') {
      if (owner === 'Client and Other') return 'Joint with Other (JTWROS)';
      if (owner === 'Spouse and Other') return 'Joint with Other (JTWROS)';
      if (owner === 'Client, Spouse and Other') return 'Joint with Other (JTWROS)';
    }
    // Handle joint with others for assets without ownershipForm
    if (!ownershipForm) {
      if (owner === 'Client and Other') return 'Joint with Other';
      if (owner === 'Spouse and Other') return 'Joint with Other';
      if (owner === 'Client, Spouse and Other') return 'Joint with Other';
    }
    if (ownershipForm === 'Tenants in Common') return 'Tenants in Common';
    if (hasBeneficiaries) return 'Beneficiary Designation';
    return 'Probate';
  };

  // Categorize real estate
  const categorizeRealEstate = (): CategorizedAsset[] => {
    return formData.realEstate.map(property => {
      const isTICProperty = property.ownershipForm === 'Tenants in Common';
      const calculatedValue = isTICProperty
        ? calculateTICValue(
            property.value,
            property.clientOwnershipPercentage,
            property.spouseOwnershipPercentage,
            property.clientSpouseCombinedPercentage
          )
        : undefined;
      const hasBeneficiaries = property.primaryBeneficiaries.length > 0;

      // Build passage method, including client/spouse joint type for TIC with Other
      let passageMethod = getPassageMethod(property.owner, property.ownershipForm, hasBeneficiaries);
      if (isTICProperty && property.owner === 'Client, Spouse and Other' && property.clientSpouseJointType) {
        const jointTypeLabel = property.clientSpouseJointType === 'Tenants by Entirety' ? 'TBE' : 'JTWROS';
        passageMethod = `TIC (Client+Spouse as ${jointTypeLabel})`;
      }

      return {
        type: 'Real Estate',
        description: `${property.street}, ${property.city}, ${property.state}`,
        value: property.value,
        owner: property.owner,
        ownershipForm: property.ownershipForm,
        hasBeneficiaries,
        primaryBeneficiaries: property.primaryBeneficiaries,
        clientPercentage: property.clientOwnershipPercentage,
        spousePercentage: property.spouseOwnershipPercentage,
        clientSpouseJointType: property.clientSpouseJointType,
        clientSpouseCombinedPercentage: property.clientSpouseCombinedPercentage,
        calculatedValue,
        passageMethod,
      };
    });
  };

  // Categorize bank accounts
  const categorizeBankAccounts = (): CategorizedAsset[] => {
    return formData.bankAccounts.map(account => {
      const hasBeneficiaries = account.hasBeneficiaries && account.primaryBeneficiaries.length > 0;
      return {
        type: 'Bank Account',
        description: account.institution,
        value: account.amount,
        owner: account.owner,
        hasBeneficiaries,
        primaryBeneficiaries: account.primaryBeneficiaries,
        secondaryBeneficiaries: account.secondaryBeneficiaries,
        secondaryDistributionType: account.secondaryDistributionType,
        passageMethod: getPassageMethod(account.owner, undefined, hasBeneficiaries),
      };
    });
  };

  // Categorize non-qualified investments
  const categorizeInvestments = (): CategorizedAsset[] => {
    return formData.nonQualifiedInvestments.map(investment => {
      const hasBeneficiaries = investment.hasBeneficiaries && investment.primaryBeneficiaries.length > 0;
      return {
        type: 'Investment',
        description: `${investment.institution} - ${investment.description}`,
        value: investment.value,
        owner: investment.owner,
        hasBeneficiaries,
        primaryBeneficiaries: investment.primaryBeneficiaries,
        secondaryBeneficiaries: investment.secondaryBeneficiaries,
        secondaryDistributionType: investment.secondaryDistributionType,
        passageMethod: getPassageMethod(investment.owner, undefined, hasBeneficiaries),
      };
    });
  };

  // Categorize retirement accounts
  const categorizeRetirement = (): CategorizedAsset[] => {
    return formData.retirementAccounts.map(account => {
      const hasBeneficiaries = account.hasBeneficiaries && account.primaryBeneficiaries.length > 0;
      return {
        type: 'Retirement Account',
        description: `${account.institution} - ${account.accountType}`,
        value: account.value,
        owner: account.owner,
        hasBeneficiaries,
        primaryBeneficiaries: account.primaryBeneficiaries,
        secondaryBeneficiaries: account.secondaryBeneficiaries,
        secondaryDistributionType: account.secondaryDistributionType,
        passageMethod: getPassageMethod(account.owner, undefined, hasBeneficiaries),
      };
    });
  };

  // Categorize life insurance (death benefit - the amount passing to beneficiaries)
  const categorizeLifeInsurance = (): CategorizedAsset[] => {
    return formData.lifeInsurance
      .filter(policy => policy.deathBenefit && parseCurrency(policy.deathBenefit) > 0)
      .map(policy => {
        const hasBeneficiaries = policy.hasBeneficiaries && policy.primaryBeneficiaries.length > 0;
        return {
          type: 'Life Insurance',
          description: `${policy.company} - ${policy.policyType}`,
          value: policy.deathBenefit,
          owner: policy.owner,
          hasBeneficiaries,
          primaryBeneficiaries: policy.primaryBeneficiaries,
          secondaryBeneficiaries: policy.secondaryBeneficiaries,
          secondaryDistributionType: policy.secondaryDistributionType,
          passageMethod: getPassageMethod(policy.owner, undefined, hasBeneficiaries),
        };
      });
  };

  // Categorize vehicles
  const categorizeVehicles = (): CategorizedAsset[] => {
    return formData.vehicles.map(vehicle => {
      const hasBeneficiaries = vehicle.hasBeneficiaries && vehicle.primaryBeneficiaries.length > 0;
      return {
        type: 'Vehicle',
        description: vehicle.yearMakeModel,
        value: vehicle.value,
        owner: vehicle.owner,
        hasBeneficiaries,
        primaryBeneficiaries: vehicle.primaryBeneficiaries,
        secondaryBeneficiaries: vehicle.secondaryBeneficiaries,
        secondaryDistributionType: vehicle.secondaryDistributionType,
        passageMethod: getPassageMethod(vehicle.owner, undefined, hasBeneficiaries),
      };
    });
  };

  // Categorize other assets
  const categorizeOtherAssets = (): CategorizedAsset[] => {
    return formData.otherAssets.map(asset => {
      const hasBeneficiaries = asset.hasBeneficiaries && asset.primaryBeneficiaries.length > 0;
      const isPersonalPropertyMemo = asset.addToPersonalPropertyMemo === true;
      // Personal property memo items pass via the memo (non-probate), with legatees as beneficiaries
      const effectiveHasBeneficiaries = hasBeneficiaries || isPersonalPropertyMemo;

      let passageMethod = getPassageMethod(asset.owner, undefined, hasBeneficiaries);
      if (isPersonalPropertyMemo) {
        passageMethod = 'Personal Property Memorandum';
      }

      return {
        type: 'Other Asset',
        description: asset.description,
        value: asset.value,
        owner: asset.owner,
        hasBeneficiaries: effectiveHasBeneficiaries,
        primaryBeneficiaries: asset.primaryBeneficiaries,
        secondaryBeneficiaries: asset.secondaryBeneficiaries,
        secondaryDistributionType: asset.secondaryDistributionType,
        passageMethod,
        isPersonalPropertyMemo,
      };
    });
  };

  // Categorize business interests
  const categorizeBusinessInterests = (): CategorizedAsset[] => {
    return formData.businessInterests.map(business => {
      // Calculate estimated value based on ownership percentage
      const fullVal = parseCurrency(business.fullValue);
      const pct = parsePercentage(business.ownershipPercentage || '');
      const calculatedValue = fullVal * pct;
      return {
        type: 'Business Interest',
        description: `${business.businessName} (${business.entityType})`,
        value: business.fullValue,
        owner: business.owner,
        hasBeneficiaries: false,
        passageMethod: getPassageMethod(business.owner, undefined, false),
        calculatedValue: calculatedValue > 0 ? calculatedValue : undefined,
      };
    });
  };

  // Categorize digital assets
  const categorizeDigitalAssets = (): CategorizedAsset[] => {
    return formData.digitalAssets.map(asset => ({
      type: 'Digital Asset',
      description: `${asset.platform} - ${asset.description}`,
      value: asset.value,
      owner: asset.owner,
      hasBeneficiaries: false,
      passageMethod: getPassageMethod(asset.owner, undefined, false),
    }));
  };

  // Get all assets
  const allAssets: CategorizedAsset[] = [
    ...categorizeRealEstate(),
    ...categorizeBankAccounts(),
    ...categorizeInvestments(),
    ...categorizeRetirement(),
    ...categorizeLifeInsurance(),
    ...categorizeVehicles(),
    ...categorizeOtherAssets(),
    ...categorizeBusinessInterests(),
    ...categorizeDigitalAssets(),
  ];

  // Category 1: Client Probate Assets (sole ownership, no beneficiaries)
  const clientProbateAssets = allAssets.filter(asset =>
    isClientSole(asset.owner, asset.ownershipForm) && !asset.hasBeneficiaries
  );

  // Category 2: Spouse Probate Assets (sole ownership, no beneficiaries)
  const spouseProbateAssets = allAssets.filter(asset =>
    isSpouseSole(asset.owner, asset.ownershipForm) && !asset.hasBeneficiaries
  );

  // Client Non-Probate Assets (sole ownership WITH beneficiaries - IRAs, etc.)
  const clientNonProbateAssets = allAssets.filter(asset =>
    isClientSole(asset.owner, asset.ownershipForm) && asset.hasBeneficiaries
  );

  // Spouse Non-Probate Assets (sole ownership WITH beneficiaries - IRAs, etc.)
  const spouseNonProbateAssets = allAssets.filter(asset =>
    isSpouseSole(asset.owner, asset.ownershipForm) && asset.hasBeneficiaries
  );

  // Category 3: Joint Client+Spouse (TBE/JTWROS/Lady Bird/Life Estate) without beneficiaries
  const jointNoBeneficiaries = allAssets.filter(asset =>
    isJointClientSpouse(asset.owner, asset.ownershipForm) &&
    !asset.hasBeneficiaries
  );

  // Category 4: Joint Client+Spouse (TBE/JTWROS/Lady Bird/Life Estate) with beneficiaries
  // Lady Bird Deed and Life Estate assets with joint ownership are now included here
  const jointWithBeneficiaries = allAssets.filter(asset =>
    isJointClientSpouse(asset.owner, asset.ownershipForm) &&
    asset.hasBeneficiaries
  );

  // Category 5: Tenants in Common - Client and Other
  const ticClientOther = allAssets.filter(asset =>
    asset.owner === 'Client and Other' && isTIC(asset.ownershipForm)
  );

  // Category 6: Tenants in Common - Spouse and Other
  const ticSpouseOther = allAssets.filter(asset =>
    asset.owner === 'Spouse and Other' && isTIC(asset.ownershipForm)
  );

  // Category 7: Tenants in Common - Client, Spouse and Other
  const ticClientSpouseOther = allAssets.filter(asset =>
    asset.owner === 'Client, Spouse and Other' && isTIC(asset.ownershipForm)
  );

  // Category 8: JTWROS - Client and Other (or joint without ownership form specified)
  const jtwrosClientOther = allAssets.filter(asset =>
    asset.owner === 'Client and Other' && (asset.ownershipForm === 'JTWROS' || !asset.ownershipForm)
  );

  // Category 9: JTWROS - Spouse and Other (or joint without ownership form specified)
  const jtwrosSpouseOther = allAssets.filter(asset =>
    asset.owner === 'Spouse and Other' && (asset.ownershipForm === 'JTWROS' || !asset.ownershipForm)
  );

  // Category 10: JTWROS - Client, Spouse and Other (or joint without ownership form specified)
  const jtwrosClientSpouseOther = allAssets.filter(asset =>
    asset.owner === 'Client, Spouse and Other' && (asset.ownershipForm === 'JTWROS' || !asset.ownershipForm)
  );

  // Calculate totals - use calculatedValue for TIC assets (proportional ownership)
  const calculateTotal = (assets: CategorizedAsset[]): number => {
    return assets.reduce((sum, asset) => {
      // For TIC assets, use the calculated proportional value
      if (asset.calculatedValue !== undefined) {
        return sum + asset.calculatedValue;
      }
      return sum + parseCurrency(asset.value);
    }, 0);
  };

  // Get the display value for an asset (proportional for TIC, full for others)
  const getAssetDisplayValue = (asset: CategorizedAsset): number => {
    if (asset.calculatedValue !== undefined) {
      return asset.calculatedValue;
    }
    return parseCurrency(asset.value);
  };

  const categories: AssetCategory[] = [
    {
      id: 'client-probate',
      title: '1. Client Probate Assets',
      description: 'Assets owned solely by the Client without designated beneficiaries. These assets will pass through probate.',
      assets: clientProbateAssets,
      totalValue: calculateTotal(clientProbateAssets),
    },
    {
      id: 'client-non-probate',
      title: '2. Client Non-Probate Assets',
      description: 'Assets owned solely by the Client with designated beneficiaries. These assets pass directly to beneficiaries and avoid probate.',
      assets: clientNonProbateAssets,
      totalValue: calculateTotal(clientNonProbateAssets),
    },
    {
      id: 'spouse-probate',
      title: '3. Spouse Probate Assets',
      description: 'Assets owned solely by the Spouse without designated beneficiaries. These assets will pass through probate.',
      assets: spouseProbateAssets,
      totalValue: calculateTotal(spouseProbateAssets),
    },
    {
      id: 'spouse-non-probate',
      title: '4. Spouse Non-Probate Assets',
      description: 'Assets owned solely by the Spouse with designated beneficiaries. These assets pass directly to beneficiaries and avoid probate.',
      assets: spouseNonProbateAssets,
      totalValue: calculateTotal(spouseNonProbateAssets),
    },
    {
      id: 'joint-no-beneficiaries',
      title: '5. Joint (Client & Spouse) - No Beneficiaries',
      description: 'Assets owned jointly by Client and Spouse as Tenants by Entirety or JTWROS without beneficiaries. These pass to the surviving spouse automatically, then through probate.',
      assets: jointNoBeneficiaries,
      totalValue: calculateTotal(jointNoBeneficiaries),
    },
    {
      id: 'joint-with-beneficiaries',
      title: '6. Joint (Client & Spouse) - With Beneficiaries',
      description: 'Assets owned jointly by Client and Spouse (TBE, JTWROS, Lady Bird Deed, or Life Estate) with designated beneficiaries. These pass to the surviving spouse, then to beneficiaries or remainder interest holders.',
      assets: jointWithBeneficiaries,
      totalValue: calculateTotal(jointWithBeneficiaries),
    },
    {
      id: 'tic-client-other',
      title: '7. Tenants in Common - Client & Other',
      description: 'Assets owned by Client and another party as Tenants in Common. Client\'s share passes through their estate.',
      assets: ticClientOther,
      totalValue: calculateTotal(ticClientOther),
    },
    {
      id: 'tic-spouse-other',
      title: '8. Tenants in Common - Spouse & Other',
      description: 'Assets owned by Spouse and another party as Tenants in Common. Spouse\'s share passes through their estate.',
      assets: ticSpouseOther,
      totalValue: calculateTotal(ticSpouseOther),
    },
    {
      id: 'tic-client-spouse-other',
      title: '9. Tenants in Common - Client, Spouse & Other',
      description: 'Assets owned by Client, Spouse, and another party as Tenants in Common. Each owner\'s share passes through their estate.',
      assets: ticClientSpouseOther,
      totalValue: calculateTotal(ticClientSpouseOther),
    },
    {
      id: 'jtwros-client-other',
      title: '10. JTWROS - Client & Other',
      description: 'Assets owned by Client and another party as Joint Tenants with Rights of Survivorship. Passes to surviving owner(s).',
      assets: jtwrosClientOther,
      totalValue: calculateTotal(jtwrosClientOther),
    },
    {
      id: 'jtwros-spouse-other',
      title: '11. JTWROS - Spouse & Other',
      description: 'Assets owned by Spouse and another party as Joint Tenants with Rights of Survivorship. Passes to surviving owner(s).',
      assets: jtwrosSpouseOther,
      totalValue: calculateTotal(jtwrosSpouseOther),
    },
    {
      id: 'jtwros-client-spouse-other',
      title: '12. JTWROS - Client, Spouse & Other',
      description: 'Assets owned by Client, Spouse, and another party as Joint Tenants with Rights of Survivorship. Passes to surviving owner(s).',
      assets: jtwrosClientSpouseOther,
      totalValue: calculateTotal(jtwrosClientSpouseOther),
    },
  ];

  // Filter out spouse categories if single
  const filteredCategories = showSpouse
    ? categories
    : categories.filter(cat =>
        !cat.id.includes('spouse') &&
        !cat.id.includes('joint')
      );

  // Calculate grand total
  const grandTotal = filteredCategories.reduce((sum, cat) => sum + cat.totalValue, 0);

  // Calculate probate totals
  const clientProbateTotal = calculateTotal(clientProbateAssets);
  const spouseProbateTotal = calculateTotal(spouseProbateAssets);
  const jointNoBeneficiariesTotal = calculateTotal(jointNoBeneficiaries);

  // Calculate non-probate totals (sole ownership with beneficiaries)
  const clientNonProbateTotal = calculateTotal(clientNonProbateAssets);
  const spouseNonProbateTotal = calculateTotal(spouseNonProbateAssets);

  // Calculate joint totals for summary
  const jointClientSpouseTotal = calculateTotal(jointNoBeneficiaries) + calculateTotal(jointWithBeneficiaries);
  const jointClientOtherTotal = calculateTotal(ticClientOther) + calculateTotal(jtwrosClientOther);
  const jointSpouseOtherTotal = calculateTotal(ticSpouseOther) + calculateTotal(jtwrosSpouseOther);
  const jointClientSpouseOtherTotal = calculateTotal(ticClientSpouseOther) + calculateTotal(jtwrosClientSpouseOther);


  // Scenario-specific asset groupings
  // Helper to check if spouse is the primary beneficiary
  const hasSpouseAsPrimaryBeneficiary = (asset: CategorizedAsset): boolean => {
    return asset.primaryBeneficiaries?.some(b =>
      b.toLowerCase() === 'spouse' || b.toLowerCase().includes('spouse')
    ) || false;
  };

  // Helper to check if client is the primary beneficiary
  const hasClientAsPrimaryBeneficiary = (asset: CategorizedAsset): boolean => {
    return asset.primaryBeneficiaries?.some(b =>
      b.toLowerCase() === 'client' || b.toLowerCase().includes('client')
    ) || false;
  };

  // Assets that pass to spouse on first death (joint assets)
  // Lady Bird/Life Estate assets are included here as they function similarly for estate planning purposes
  const jointToSurvivor = allAssets.filter(asset =>
    isJointClientSpouse(asset.owner, asset.ownershipForm)
  );

  // Client assets with spouse as beneficiary
  const clientAssetsWithSpouseAsBeneficiary = allAssets.filter(asset =>
    isClientSole(asset.owner, asset.ownershipForm) &&
    asset.hasBeneficiaries &&
    hasSpouseAsPrimaryBeneficiary(asset)
  );

  // Client assets with non-spouse beneficiaries
  const clientAssetsWithOtherBeneficiaries = allAssets.filter(asset =>
    isClientSole(asset.owner, asset.ownershipForm) &&
    asset.hasBeneficiaries &&
    !hasSpouseAsPrimaryBeneficiary(asset)
  );

  // Spouse assets with client as beneficiary
  const spouseAssetsWithClientAsBeneficiary = allAssets.filter(asset =>
    isSpouseSole(asset.owner, asset.ownershipForm) &&
    asset.hasBeneficiaries &&
    hasClientAsPrimaryBeneficiary(asset)
  );

  // Spouse assets with non-client beneficiaries
  const spouseAssetsWithOtherBeneficiaries = allAssets.filter(asset =>
    isSpouseSole(asset.owner, asset.ownershipForm) &&
    asset.hasBeneficiaries &&
    !hasClientAsPrimaryBeneficiary(asset)
  );

  // Assets owned jointly with others (pass to other joint owner)
  const clientJointWithOther = allAssets.filter(asset =>
    (asset.owner === 'Client and Other' || asset.owner === 'Client, Spouse and Other') &&
    asset.ownershipForm === 'JTWROS'
  );

  const spouseJointWithOther = allAssets.filter(asset =>
    (asset.owner === 'Spouse and Other' || asset.owner === 'Client, Spouse and Other') &&
    asset.ownershipForm === 'JTWROS'
  );

  // Check dispositive intentions for spouse provision
  const provideForSpouseFirst = formData.provideForSpouseThenChildren;

  // Render scenario view for "Client Dies First"
  const renderClientDiesFirst = () => {
    // Combine assets that pass to spouse:
    // 1. Joint assets (TBE/JTWROS)
    // 2. Assets with spouse as beneficiary
    // 3. If provideForSpouseFirst, include probate assets too
    const assetsToSpouse: CategorizedAsset[] = [
      ...jointToSurvivor.map(a => ({ ...a, passageMethod: a.passageMethod || 'Joint with Spouse' })),
      ...clientAssetsWithSpouseAsBeneficiary.map(a => ({ ...a, passageMethod: 'Spouse as Beneficiary' })),
      ...(provideForSpouseFirst
        ? clientProbateAssets.map(a => ({ ...a, passageMethod: 'Probate (Spouse Primary)' }))
        : []),
    ];

    // Assets that pass to other beneficiaries (not spouse)
    // Note: Lady Bird/Life Estate assets are now included in jointToSurvivor (assetsToSpouse)
    const assetsToOtherBeneficiaries = [
      ...clientAssetsWithOtherBeneficiaries,
    ];

    // Probate assets only shown separately if NOT providing for spouse first
    const probateAssetsToShow = provideForSpouseFirst ? [] : clientProbateAssets;

    // Spouse's own assets (sole ownership - both probate and non-probate)
    const spouseOwnAssets: CategorizedAsset[] = [
      ...spouseProbateAssets.map(a => ({ ...a, passageMethod: 'Spouse Sole Ownership' })),
      ...spouseNonProbateAssets.map(a => ({ ...a, passageMethod: 'Spouse Sole Ownership' })),
    ];

    // Calculate total assets available to spouse after client dies
    const totalToSpouse = calculateTotal(assetsToSpouse);
    const totalSpouseOwn = calculateTotal(spouseOwnAssets);
    const totalAvailableToSpouse = totalToSpouse + totalSpouseOwn;

    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2, mt: 2 }}>
          When Client Dies First
        </Typography>

        <ScenarioSection
          title="Assets Passing to Spouse"
          assets={assetsToSpouse}
          totalValue={totalToSpouse}
          color="success.main"
        />

        <ScenarioSection
          title="Spouse's Own Assets (Already Owned)"
          assets={spouseOwnAssets}
          totalValue={totalSpouseOwn}
          color="success.main"
        />

        {/* Total Available to Spouse Summary */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.50', borderColor: 'success.main' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Total Assets Available to Spouse
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(totalAvailableToSpouse)}
            </Typography>
          </Box>
        </Paper>

        <ScenarioSection
          title="Assets Passing to Other Beneficiaries"
          assets={assetsToOtherBeneficiaries}
          totalValue={calculateTotal(assetsToOtherBeneficiaries)}
          color="info.main"
          subtitle="These assets pass directly to the designated beneficiaries (not spouse) when Client dies."
          distributionPlan={formData.clientDistributionPlan}
          children={formData.children}
          showBeneficiaryBreakdown={true}
          deceasedPersonNames={[formData.name]}
        />

        <ScenarioSection
          title="Assets Subject to Probate"
          assets={probateAssetsToShow}
          totalValue={calculateTotal(probateAssetsToShow)}
          color="error.main"
        />

        <ScenarioSection
          title="Assets Passing to Joint Owners (Other)"
          assets={clientJointWithOther}
          totalValue={calculateTotal(clientJointWithOther)}
          color="warning.main"
        />

        {/* Cash Bequests at First Death - only if timing is 'atFirstDeath' */}
        {showSpouse && formData.cashBequestTiming === 'atFirstDeath' && formData.cashGiftsToBeneficiaries.length > 0 && (() => {
          // Calculate deductions from client's probate assets
          const firstDeathCashBequestResult = calculateCashBequestDeductions(
            formData.cashGiftsToBeneficiaries,
            clientProbateAssets
          );

          return (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: firstDeathCashBequestResult.remainingBequest > 0 ? 'error.main' : 'secondary.main' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: firstDeathCashBequestResult.remainingBequest > 0 ? 'error.main' : 'secondary.main', mb: 1 }}>
                Cash Bequests (Paid at Client&apos;s Death)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These cash gifts are paid from the Client&apos;s probate estate at first death.
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.cashGiftsToBeneficiaries.map((gift, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{gift.beneficiaryName}</TableCell>
                        <TableCell align="right">{formatCurrency(parseCurrency(gift.amount))}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Total Cash Bequests</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(firstDeathCashBequestResult.totalCashBequests)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {firstDeathCashBequestResult.remainingBequest > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Insufficient Probate Assets for Cash Bequests
                  </Typography>
                  <Typography variant="body2">
                    The Client&apos;s probate estate does not have enough assets to fully fund the cash bequests.
                    There is a shortfall of {formatCurrency(firstDeathCashBequestResult.remainingBequest)}.
                  </Typography>
                </Alert>
              )}
            </Paper>
          );
        })()}

        {/* First Death Heir Summary - for assets going to non-spouse beneficiaries */}
        {(() => {
          // Calculate shares for assets going to other beneficiaries at first death
          const firstDeathAssetsWithShares = assetsToOtherBeneficiaries.map(asset => {
            const displayValue = asset.calculatedValue !== undefined
              ? asset.calculatedValue
              : parseCurrency(asset.value);

            const shares = calculateBeneficiaryShares(
              displayValue,
              asset.primaryBeneficiaries,
              asset.secondaryBeneficiaries,
              asset.secondaryDistributionType,
              formData.clientDistributionPlan.residuaryBeneficiaries,
              formData.clientDistributionPlan.residuaryShareType,
              formData.clientDistributionPlan,
              formData.children,
              [formData.name] // Only client is deceased at first death
            );

            return { asset, displayValue, shares };
          });

          const firstDeathHeirs = aggregateHeirInheritance(firstDeathAssetsWithShares);

          if (firstDeathHeirs.length === 0) return null;

          return (
            <HeirSummary
              title="Summary: Inheritance at Client's Death"
              heirs={firstDeathHeirs}
            />
          );
        })()}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
          Then When Spouse Dies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          After Client&apos;s death, Spouse will own all joint assets plus any assets inherited from Client. The following shows the complete estate distribution when Spouse subsequently dies.
        </Typography>

        {/* Blended Family Warning - Client's stepchildren excluded from Spouse's Will */}
        {blendedFamilyInfo.clientStepchildrenExcludedFromSpouseWill && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Blended Family Consideration
            </Typography>
            <Typography variant="body2">
              {formData.name}&apos;s children from a prior relationship ({blendedFamilyInfo.clientOnlyChildrenNames.join(', ')}) are not included in {formData.spouseName}&apos;s Will distribution. When {formData.spouseName} dies, these stepchildren will not inherit from {formData.spouseName}&apos;s estate unless designated as beneficiaries on specific assets.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              To include these children in {formData.spouseName}&apos;s Will, enable the option in the New Plan Provisions section.
            </Typography>
          </Alert>
        )}

        {/* Calculate total estate at spouse's death - includes:
            1. Spouse's original assets (probate and non-probate)
            2. Joint assets that passed to spouse
            3. Client's assets where spouse was beneficiary
            4. Client's probate assets if provideForSpouseFirst
        */}
        {(() => {
          // All assets spouse owns at death (inherited from client + their own)
          const spouseEstateAtDeath: CategorizedAsset[] = [
            // Spouse's original assets
            ...spouseProbateAssets.map(a => ({ ...a, passageMethod: 'Spouse Original Asset' })),
            ...spouseNonProbateAssets.map(a => ({ ...a, passageMethod: 'Spouse Original Asset' })),
            // Joint assets inherited from client
            ...jointToSurvivor.map(a => ({ ...a, passageMethod: 'Inherited from Client (Joint)' })),
            // Client assets with spouse as beneficiary
            ...clientAssetsWithSpouseAsBeneficiary.map(a => ({ ...a, passageMethod: 'Inherited from Client (Beneficiary)' })),
            // Client probate assets if providing for spouse first
            ...(provideForSpouseFirst
              ? clientProbateAssets.map(a => ({ ...a, passageMethod: 'Inherited from Client (Probate)' }))
              : []),
          ];

          const totalSpouseEstate = calculateTotal(spouseEstateAtDeath);

          // Get spouse's Will distribution plan for probate assets
          const spouseDistPlan = formData.spouseDistributionPlan;
          // For blended families: filter children based on whose Will is being used
          const childrenForSpouseWill = getChildrenForWill(
            formData.children,
            'spouse',
            formData.includeClientStepchildrenInSpouseWill,
            formData.includeSpouseStepchildrenInClientWill
          );
          const spouseWillBeneficiaries = formatResiduaryBeneficiaries(
            spouseDistPlan.residuaryBeneficiaries,
            spouseDistPlan.residuaryShareType,
            spouseDistPlan,
            childrenForSpouseWill
          );

          // Spouse's original non-probate assets - these pass to their designated secondary beneficiaries
          const spouseOriginalNonProbate: CategorizedAsset[] = [
            ...spouseNonProbateAssets.map(a => {
              const secondaryBenefs = formatBeneficiaryList(a.secondaryBeneficiaries || [], a.secondaryDistributionType);
              return {
                ...a,
                passageMethod: secondaryBenefs || 'Secondary Beneficiaries (Not Designated)'
              };
            }),
          ];

          // Joint assets with beneficiaries - these pass to designated beneficiaries
          const jointAssetsWithBenef: CategorizedAsset[] = [
            ...jointWithBeneficiaries.map(a => {
              const secondaryBenefs = formatBeneficiaryList(a.secondaryBeneficiaries || [], a.secondaryDistributionType);
              return {
                ...a,
                passageMethod: secondaryBenefs || formatBeneficiaryList(a.primaryBeneficiaries || []) || 'Beneficiary Designation'
              };
            }),
          ];

          // Assets subject to beneficiary redesignation - inherited from client with beneficiary designations
          // Spouse may keep original secondary beneficiaries OR designate new ones after rollover
          const assetsSubjectToRedesignation: CategorizedAsset[] = [
            ...clientAssetsWithSpouseAsBeneficiary.map(a => {
              const secondaryBenefs = formatBeneficiaryList(a.secondaryBeneficiaries || [], a.secondaryDistributionType);
              return {
                ...a,
                passageMethod: secondaryBenefs ? `${secondaryBenefs} (May Redesignate)` : 'Inherited (May Redesignate)'
              };
            }),
          ];

          // Assets going to probate - show Will beneficiaries with their percentages
          // Also include TIC assets where spouse's share goes through probate
          const rawAssetsToSpouseProbate: CategorizedAsset[] = [
            ...spouseProbateAssets.map(a => ({ ...a, passageMethod: spouseWillBeneficiaries })),
            ...jointNoBeneficiaries.map(a => ({ ...a, passageMethod: spouseWillBeneficiaries })),
            ...(provideForSpouseFirst
              ? clientProbateAssets.map(a => ({ ...a, passageMethod: spouseWillBeneficiaries }))
              : []),
            // TIC assets where spouse has a share - spouse's percentage goes through probate
            ...ticSpouseOther.map(a => ({
              ...a,
              passageMethod: `Spouse's Share: ${spouseWillBeneficiaries}`
            })),
            // TIC with Client, Spouse and Other - spouse's share goes through probate after client predeceased
            ...ticClientSpouseOther.map(a => ({
              ...a,
              passageMethod: `Spouse's Share: ${spouseWillBeneficiaries}`
            })),
          ];

          // Apply cash bequest deductions from probate assets (paid before residuary distribution)
          // Only apply at survivor's death if timing is 'atSurvivorDeath' (or for single/unmarried people)
          // If timing is 'atFirstDeath', cash bequests were already paid when client died
          const shouldApplyCashBequestsAtSecondDeath =
            !showSpouse || formData.cashBequestTiming === 'atSurvivorDeath';

          const cashBequestResult = shouldApplyCashBequestsAtSecondDeath
            ? calculateCashBequestDeductions(
                formData.cashGiftsToBeneficiaries,
                rawAssetsToSpouseProbate
              )
            : { totalCashBequests: 0, deductions: [], adjustedProbateAssets: rawAssetsToSpouseProbate, remainingBequest: 0 };

          const assetsToSpouseProbate = cashBequestResult.adjustedProbateAssets;
          const totalCashBequestsDeducted = cashBequestResult.totalCashBequests;

          // Collect all assets with their beneficiary shares for heir summary
          // Note: Lady Bird/Life Estate assets are now included in jointAssetsWithBenef
          const allDistributedAssets = [
            ...spouseOriginalNonProbate,
            ...jointAssetsWithBenef,
            ...assetsSubjectToRedesignation,
            ...assetsToSpouseProbate,
          ];

          // When spouse dies (second death), both client and spouse are deceased
          // Use spouse's Will for distribution, filter out both deceased persons from beneficiaries
          const bothDeceased = [formData.name, formData.spouseName].filter(Boolean);
          const allAssetsWithShares = allDistributedAssets.map(asset => {
            const displayValue = asset.calculatedValue !== undefined
              ? asset.calculatedValue
              : parseCurrency(asset.value);

            const shares = calculateBeneficiaryShares(
              displayValue,
              asset.primaryBeneficiaries,
              asset.secondaryBeneficiaries,
              asset.secondaryDistributionType,
              spouseDistPlan.residuaryBeneficiaries,
              spouseDistPlan.residuaryShareType,
              spouseDistPlan,
              childrenForSpouseWill, // Use filtered children for spouse's Will
              bothDeceased
            );

            return { asset, displayValue, shares };
          });

          // Also include assets that passed to other beneficiaries at client's death (first death)
          // These need to be added to the final heir summary
          // For first death (client), use client's children for client's will distribution
          const childrenForClientWillFirstDeath = getChildrenForWill(
            formData.children,
            'client',
            formData.includeClientStepchildrenInSpouseWill,
            formData.includeSpouseStepchildrenInClientWill
          );
          const firstDeathAssetsWithShares = assetsToOtherBeneficiaries.map(asset => {
            const displayValue = asset.calculatedValue !== undefined
              ? asset.calculatedValue
              : parseCurrency(asset.value);

            const shares = calculateBeneficiaryShares(
              displayValue,
              asset.primaryBeneficiaries,
              asset.secondaryBeneficiaries,
              asset.secondaryDistributionType,
              formData.clientDistributionPlan.residuaryBeneficiaries,
              formData.clientDistributionPlan.residuaryShareType,
              formData.clientDistributionPlan,
              childrenForClientWillFirstDeath, // Use filtered children for client's Will
              [formData.name] // Only client was deceased at first death
            );

            return { asset, displayValue, shares };
          });

          // Combine both first death and second death assets for complete heir summary
          const allAssetsForHeirSummary = [...firstDeathAssetsWithShares, ...allAssetsWithShares];

          // Add cash gifts (general bequests) to heir summary - these are paid when both are deceased
          const cashGiftsAsShares = formData.cashGiftsToBeneficiaries.map(gift => ({
            asset: {
              type: 'Cash Gift',
              description: `Cash Gift to ${gift.beneficiaryName}`,
              value: gift.amount,
              owner: 'Estate',
              hasBeneficiaries: true,
            } as CategorizedAsset,
            displayValue: parseCurrency(gift.amount),
            shares: [{
              beneficiaryName: gift.beneficiaryName,
              percentage: 100,
              amount: parseCurrency(gift.amount),
            }],
          }));

          const allAssetsWithCashGifts = [...allAssetsForHeirSummary, ...cashGiftsAsShares];
          const heirInheritances = aggregateHeirInheritance(allAssetsWithCashGifts);

          return (
            <>
              {/* Total Estate Summary at Spouse's Death */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total Estate at Spouse&apos;s Death
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(totalSpouseEstate)}
                  </Typography>
                </Box>
              </Paper>

              <ScenarioSection
                title="Spouse's Assets Passing to Beneficiaries"
                assets={spouseOriginalNonProbate}
                totalValue={calculateTotal(spouseOriginalNonProbate)}
                color="info.main"
                subtitle="These are Spouse's original assets with beneficiary designations. They pass to the designated secondary beneficiaries."
                distributionPlan={spouseDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              <ScenarioSection
                title="Joint Assets Passing to Beneficiaries"
                assets={jointAssetsWithBenef}
                totalValue={calculateTotal(jointAssetsWithBenef)}
                color="info.main"
                subtitle="Joint assets that now pass to their designated beneficiaries."
                distributionPlan={spouseDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              <ScenarioSection
                title="Assets Subject to Beneficiary Redesignation"
                assets={assetsSubjectToRedesignation}
                totalValue={calculateTotal(assetsSubjectToRedesignation)}
                color="#ed6c02"
                subtitle="Spouse inherited these from Client and may keep the original secondary beneficiaries OR designate new beneficiaries after rolling over the accounts."
                distributionPlan={spouseDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              <ScenarioSection
                title="Assets Passing to Joint Owners (Other)"
                assets={spouseJointWithOther}
                totalValue={calculateTotal(spouseJointWithOther)}
                color="warning.main"
              />

              {/* Cash Bequests Section - show deductions from probate estate */}
              {totalCashBequestsDeducted > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: cashBequestResult.remainingBequest > 0 ? 'error.main' : 'secondary.main' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: cashBequestResult.remainingBequest > 0 ? 'error.main' : 'secondary.main', mb: 1 }}>
                    Cash Bequests (Paid from Probate Estate)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These specific cash gifts are paid from the probate estate before the residuary is distributed to the Will beneficiaries.
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.cashGiftsToBeneficiaries.map((gift, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{gift.beneficiaryName}</TableCell>
                            <TableCell align="right">{formatCurrency(parseCurrency(gift.amount))}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Total Cash Bequests</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(totalCashBequestsDeducted)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Warning if insufficient probate assets to cover cash bequests */}
                  {cashBequestResult.remainingBequest > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Insufficient Probate Assets for Cash Bequests
                      </Typography>
                      <Typography variant="body2">
                        The probate estate does not have enough assets to fully fund the cash bequests.
                        There is a shortfall of {formatCurrency(cashBequestResult.remainingBequest)}.
                        The cash bequest beneficiaries may receive reduced amounts or nothing, as probate assets are insufficient.
                      </Typography>
                    </Alert>
                  )}
                </Paper>
              )}

              <ScenarioSection
                title="Assets Subject to Probate (Distributed per Will)"
                assets={assetsToSpouseProbate}
                totalValue={calculateTotal(assetsToSpouseProbate)}
                color="error.main"
                subtitle={totalCashBequestsDeducted > 0 ? `After deducting ${formatCurrency(totalCashBequestsDeducted)} for cash bequests, the remaining probate assets are distributed per the Will.` : undefined}
                distributionPlan={spouseDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              {/* Heir Summary - Total inheritance per beneficiary */}
              <Divider sx={{ my: 3 }} />
              <HeirSummary
                title="Summary: Each Heir's Total Inheritance"
                heirs={heirInheritances}
              />
            </>
          );
        })()}
      </Box>
    );
  };

  // Render scenario view for "Spouse Dies First"
  const renderSpouseDiesFirst = () => {
    // Combine assets that pass to client:
    // 1. Joint assets (TBE/JTWROS)
    // 2. Assets with client as beneficiary
    // 3. If provideForSpouseFirst, include probate assets too (spouse would have same intention)
    const assetsToClient: CategorizedAsset[] = [
      ...jointToSurvivor.map(a => ({ ...a, passageMethod: a.passageMethod || 'Joint with Client' })),
      ...spouseAssetsWithClientAsBeneficiary.map(a => ({ ...a, passageMethod: 'Client as Beneficiary' })),
      ...(provideForSpouseFirst
        ? spouseProbateAssets.map(a => ({ ...a, passageMethod: 'Probate (Client Primary)' }))
        : []),
    ];

    // Assets that pass to other beneficiaries (not client)
    // Note: Lady Bird/Life Estate assets are now included in jointToSurvivor (assetsToClient)
    const assetsToOtherBeneficiaries = [
      ...spouseAssetsWithOtherBeneficiaries,
    ];

    // Probate assets only shown separately if NOT providing for spouse first
    const probateAssetsToShow = provideForSpouseFirst ? [] : spouseProbateAssets;

    // Client's own assets (sole ownership - both probate and non-probate)
    const clientOwnAssets: CategorizedAsset[] = [
      ...clientProbateAssets.map(a => ({ ...a, passageMethod: 'Client Sole Ownership' })),
      ...clientNonProbateAssets.map(a => ({ ...a, passageMethod: 'Client Sole Ownership' })),
    ];

    // Calculate total assets available to client after spouse dies
    const totalToClient = calculateTotal(assetsToClient);
    const totalClientOwn = calculateTotal(clientOwnAssets);
    const totalAvailableToClient = totalToClient + totalClientOwn;

    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2, mt: 2 }}>
          When Spouse Dies First
        </Typography>

        <ScenarioSection
          title="Assets Passing to Client"
          assets={assetsToClient}
          totalValue={totalToClient}
          color="success.main"
        />

        <ScenarioSection
          title="Client's Own Assets (Already Owned)"
          assets={clientOwnAssets}
          totalValue={totalClientOwn}
          color="success.main"
        />

        {/* Total Available to Client Summary */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.50', borderColor: 'success.main' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Total Assets Available to Client
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(totalAvailableToClient)}
            </Typography>
          </Box>
        </Paper>

        <ScenarioSection
          title="Assets Passing to Other Beneficiaries"
          assets={assetsToOtherBeneficiaries}
          totalValue={calculateTotal(assetsToOtherBeneficiaries)}
          color="info.main"
          subtitle="These assets pass directly to the designated beneficiaries (not client) when Spouse dies."
          distributionPlan={formData.spouseDistributionPlan}
          children={formData.children}
          showBeneficiaryBreakdown={true}
          deceasedPersonNames={[formData.spouseName]}
        />

        <ScenarioSection
          title="Assets Subject to Probate"
          assets={probateAssetsToShow}
          totalValue={calculateTotal(probateAssetsToShow)}
          color="error.main"
        />

        <ScenarioSection
          title="Assets Passing to Joint Owners (Other)"
          assets={spouseJointWithOther}
          totalValue={calculateTotal(spouseJointWithOther)}
          color="warning.main"
        />

        {/* Cash Bequests at First Death - only if timing is 'atFirstDeath' */}
        {showSpouse && formData.cashBequestTiming === 'atFirstDeath' && formData.cashGiftsToBeneficiaries.length > 0 && (() => {
          // Calculate deductions from spouse's probate assets
          const firstDeathCashBequestResult = calculateCashBequestDeductions(
            formData.cashGiftsToBeneficiaries,
            spouseProbateAssets
          );

          return (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: firstDeathCashBequestResult.remainingBequest > 0 ? 'error.main' : 'secondary.main' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: firstDeathCashBequestResult.remainingBequest > 0 ? 'error.main' : 'secondary.main', mb: 1 }}>
                Cash Bequests (Paid at Spouse&apos;s Death)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These cash gifts are paid from the Spouse&apos;s probate estate at first death.
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.cashGiftsToBeneficiaries.map((gift, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{gift.beneficiaryName}</TableCell>
                        <TableCell align="right">{formatCurrency(parseCurrency(gift.amount))}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Total Cash Bequests</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(firstDeathCashBequestResult.totalCashBequests)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {firstDeathCashBequestResult.remainingBequest > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Insufficient Probate Assets for Cash Bequests
                  </Typography>
                  <Typography variant="body2">
                    The Spouse&apos;s probate estate does not have enough assets to fully fund the cash bequests.
                    There is a shortfall of {formatCurrency(firstDeathCashBequestResult.remainingBequest)}.
                  </Typography>
                </Alert>
              )}
            </Paper>
          );
        })()}

        {/* First Death Heir Summary - for assets going to non-client beneficiaries */}
        {(() => {
          // Calculate shares for assets going to other beneficiaries at first death
          const firstDeathAssetsWithShares = assetsToOtherBeneficiaries.map(asset => {
            const displayValue = asset.calculatedValue !== undefined
              ? asset.calculatedValue
              : parseCurrency(asset.value);

            const shares = calculateBeneficiaryShares(
              displayValue,
              asset.primaryBeneficiaries,
              asset.secondaryBeneficiaries,
              asset.secondaryDistributionType,
              formData.spouseDistributionPlan.residuaryBeneficiaries,
              formData.spouseDistributionPlan.residuaryShareType,
              formData.spouseDistributionPlan,
              formData.children,
              [formData.spouseName] // Only spouse is deceased at first death
            );

            return { asset, displayValue, shares };
          });

          const firstDeathHeirs = aggregateHeirInheritance(firstDeathAssetsWithShares);

          if (firstDeathHeirs.length === 0) return null;

          return (
            <HeirSummary
              title="Summary: Inheritance at Spouse's Death"
              heirs={firstDeathHeirs}
            />
          );
        })()}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
          Then When Client Dies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          After Spouse&apos;s death, Client will own all joint assets plus any assets inherited from Spouse. The following shows the complete estate distribution when Client subsequently dies.
        </Typography>

        {/* Blended Family Warning - Spouse's stepchildren excluded from Client's Will */}
        {blendedFamilyInfo.spouseStepchildrenExcludedFromClientWill && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Blended Family Consideration
            </Typography>
            <Typography variant="body2">
              {formData.spouseName}&apos;s children from a prior relationship ({blendedFamilyInfo.spouseOnlyChildrenNames.join(', ')}) are not included in {formData.name}&apos;s Will distribution. When {formData.name} dies, these stepchildren will not inherit from {formData.name}&apos;s estate unless designated as beneficiaries on specific assets.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              To include these children in {formData.name}&apos;s Will, enable the option in the New Plan Provisions section.
            </Typography>
          </Alert>
        )}

        {/* Calculate total estate at client's death - includes:
            1. Client's original assets (probate and non-probate)
            2. Joint assets that passed to client
            3. Spouse's assets where client was beneficiary
            4. Spouse's probate assets if provideForSpouseFirst
        */}
        {(() => {
          // All assets client owns at death (inherited from spouse + their own)
          const clientEstateAtDeath: CategorizedAsset[] = [
            // Client's original assets
            ...clientProbateAssets.map(a => ({ ...a, passageMethod: 'Client Original Asset' })),
            ...clientNonProbateAssets.map(a => ({ ...a, passageMethod: 'Client Original Asset' })),
            // Joint assets inherited from spouse
            ...jointToSurvivor.map(a => ({ ...a, passageMethod: 'Inherited from Spouse (Joint)' })),
            // Spouse assets with client as beneficiary
            ...spouseAssetsWithClientAsBeneficiary.map(a => ({ ...a, passageMethod: 'Inherited from Spouse (Beneficiary)' })),
            // Spouse probate assets if providing for spouse first (same intention applies)
            ...(provideForSpouseFirst
              ? spouseProbateAssets.map(a => ({ ...a, passageMethod: 'Inherited from Spouse (Probate)' }))
              : []),
          ];

          const totalClientEstate = calculateTotal(clientEstateAtDeath);

          // Get client's Will distribution plan for probate assets
          const clientDistPlan = formData.clientDistributionPlan;
          // For blended families: filter children based on whose Will is being used
          const childrenForClientWill = getChildrenForWill(
            formData.children,
            'client',
            formData.includeClientStepchildrenInSpouseWill,
            formData.includeSpouseStepchildrenInClientWill
          );
          const clientWillBeneficiaries = formatResiduaryBeneficiaries(
            clientDistPlan.residuaryBeneficiaries,
            clientDistPlan.residuaryShareType,
            clientDistPlan,
            childrenForClientWill
          );

          // Client's original non-probate assets - these pass to their designated secondary beneficiaries
          const clientOriginalNonProbate: CategorizedAsset[] = [
            ...clientNonProbateAssets.map(a => {
              const secondaryBenefs = formatBeneficiaryList(a.secondaryBeneficiaries || [], a.secondaryDistributionType);
              return {
                ...a,
                passageMethod: secondaryBenefs || 'Secondary Beneficiaries (Not Designated)'
              };
            }),
          ];

          // Joint assets with beneficiaries - these pass to designated beneficiaries
          const jointAssetsWithBenef: CategorizedAsset[] = [
            ...jointWithBeneficiaries.map(a => {
              const secondaryBenefs = formatBeneficiaryList(a.secondaryBeneficiaries || [], a.secondaryDistributionType);
              return {
                ...a,
                passageMethod: secondaryBenefs || formatBeneficiaryList(a.primaryBeneficiaries || []) || 'Beneficiary Designation'
              };
            }),
          ];

          // Assets subject to beneficiary redesignation - inherited from spouse with beneficiary designations
          // Client may keep original secondary beneficiaries OR designate new ones after rollover
          const assetsSubjectToRedesignation: CategorizedAsset[] = [
            ...spouseAssetsWithClientAsBeneficiary.map(a => {
              const secondaryBenefs = formatBeneficiaryList(a.secondaryBeneficiaries || [], a.secondaryDistributionType);
              return {
                ...a,
                passageMethod: secondaryBenefs ? `${secondaryBenefs} (May Redesignate)` : 'Inherited (May Redesignate)'
              };
            }),
          ];

          // Assets going to probate - show Will beneficiaries with their percentages
          // Also include TIC assets where client's share goes through probate
          const rawAssetsToClientProbate: CategorizedAsset[] = [
            ...clientProbateAssets.map(a => ({ ...a, passageMethod: clientWillBeneficiaries })),
            ...jointNoBeneficiaries.map(a => ({ ...a, passageMethod: clientWillBeneficiaries })),
            ...(provideForSpouseFirst
              ? spouseProbateAssets.map(a => ({ ...a, passageMethod: clientWillBeneficiaries }))
              : []),
            // TIC assets where client has a share - client's percentage goes through probate
            ...ticClientOther.map(a => ({
              ...a,
              passageMethod: `Client's Share: ${clientWillBeneficiaries}`
            })),
            // TIC with Client, Spouse and Other - client's share goes through probate after spouse predeceased
            ...ticClientSpouseOther.map(a => ({
              ...a,
              passageMethod: `Client's Share: ${clientWillBeneficiaries}`
            })),
          ];

          // Apply cash bequest deductions from probate assets (paid before residuary distribution)
          // Only apply at survivor's death if timing is 'atSurvivorDeath' (or for single/unmarried people)
          // If timing is 'atFirstDeath', cash bequests were already paid when spouse died
          const shouldApplyCashBequestsAtClientDeath =
            !showSpouse || formData.cashBequestTiming === 'atSurvivorDeath';

          const cashBequestResultClient = shouldApplyCashBequestsAtClientDeath
            ? calculateCashBequestDeductions(
                formData.cashGiftsToBeneficiaries,
                rawAssetsToClientProbate
              )
            : { totalCashBequests: 0, deductions: [], adjustedProbateAssets: rawAssetsToClientProbate, remainingBequest: 0 };

          const assetsToClientProbate = cashBequestResultClient.adjustedProbateAssets;
          const totalCashBequestsDeductedClient = cashBequestResultClient.totalCashBequests;

          // Collect all assets with their beneficiary shares for heir summary
          // Note: Lady Bird/Life Estate assets are now included in jointAssetsWithBenef
          const allDistributedAssets = [
            ...clientOriginalNonProbate,
            ...jointAssetsWithBenef,
            ...assetsSubjectToRedesignation,
            ...assetsToClientProbate,
          ];

          // When client dies (second death), both client and spouse are deceased
          // Use client's Will for distribution, filter out both deceased persons from beneficiaries
          const bothDeceased = [formData.name, formData.spouseName].filter(Boolean);
          const allAssetsWithShares = allDistributedAssets.map(asset => {
            const displayValue = asset.calculatedValue !== undefined
              ? asset.calculatedValue
              : parseCurrency(asset.value);

            const shares = calculateBeneficiaryShares(
              displayValue,
              asset.primaryBeneficiaries,
              asset.secondaryBeneficiaries,
              asset.secondaryDistributionType,
              clientDistPlan.residuaryBeneficiaries,
              clientDistPlan.residuaryShareType,
              clientDistPlan,
              childrenForClientWill, // Use filtered children for client's Will
              bothDeceased
            );

            return { asset, displayValue, shares };
          });

          // Also include assets that passed to other beneficiaries at spouse's death (first death)
          // These need to be added to the final heir summary
          // For first death (spouse), use spouse's children for spouse's will distribution
          const childrenForSpouseWillFirstDeath = getChildrenForWill(
            formData.children,
            'spouse',
            formData.includeClientStepchildrenInSpouseWill,
            formData.includeSpouseStepchildrenInClientWill
          );
          const firstDeathAssetsWithShares = assetsToOtherBeneficiaries.map(asset => {
            const displayValue = asset.calculatedValue !== undefined
              ? asset.calculatedValue
              : parseCurrency(asset.value);

            const shares = calculateBeneficiaryShares(
              displayValue,
              asset.primaryBeneficiaries,
              asset.secondaryBeneficiaries,
              asset.secondaryDistributionType,
              formData.spouseDistributionPlan.residuaryBeneficiaries,
              formData.spouseDistributionPlan.residuaryShareType,
              formData.spouseDistributionPlan,
              childrenForSpouseWillFirstDeath, // Use filtered children for spouse's Will
              [formData.spouseName] // Only spouse was deceased at first death
            );

            return { asset, displayValue, shares };
          });

          // Combine both first death and second death assets for complete heir summary
          const allAssetsForHeirSummary = [...firstDeathAssetsWithShares, ...allAssetsWithShares];

          // Add cash gifts (general bequests) to heir summary - these are paid when both are deceased
          const cashGiftsAsShares = formData.cashGiftsToBeneficiaries.map(gift => ({
            asset: {
              type: 'Cash Gift',
              description: `Cash Gift to ${gift.beneficiaryName}`,
              value: gift.amount,
              owner: 'Estate',
              hasBeneficiaries: true,
            } as CategorizedAsset,
            displayValue: parseCurrency(gift.amount),
            shares: [{
              beneficiaryName: gift.beneficiaryName,
              percentage: 100,
              amount: parseCurrency(gift.amount),
            }],
          }));

          const allAssetsWithCashGifts = [...allAssetsForHeirSummary, ...cashGiftsAsShares];
          const heirInheritances = aggregateHeirInheritance(allAssetsWithCashGifts);

          return (
            <>
              {/* Total Estate Summary at Client's Death */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total Estate at Client&apos;s Death
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(totalClientEstate)}
                  </Typography>
                </Box>
              </Paper>

              <ScenarioSection
                title="Client's Assets Passing to Beneficiaries"
                assets={clientOriginalNonProbate}
                totalValue={calculateTotal(clientOriginalNonProbate)}
                color="info.main"
                subtitle="These are Client's original assets with beneficiary designations. They pass to the designated secondary beneficiaries."
                distributionPlan={clientDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              <ScenarioSection
                title="Joint Assets Passing to Beneficiaries"
                assets={jointAssetsWithBenef}
                totalValue={calculateTotal(jointAssetsWithBenef)}
                color="info.main"
                subtitle="Joint assets that now pass to their designated beneficiaries."
                distributionPlan={clientDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              <ScenarioSection
                title="Assets Subject to Beneficiary Redesignation"
                assets={assetsSubjectToRedesignation}
                totalValue={calculateTotal(assetsSubjectToRedesignation)}
                color="#ed6c02"
                subtitle="Client inherited these from Spouse and may keep the original secondary beneficiaries OR designate new beneficiaries after rolling over the accounts."
                distributionPlan={clientDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              <ScenarioSection
                title="Assets Passing to Joint Owners (Other)"
                assets={clientJointWithOther}
                totalValue={calculateTotal(clientJointWithOther)}
                color="warning.main"
              />

              {/* Cash Bequests Section - show deductions from probate estate */}
              {totalCashBequestsDeductedClient > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: cashBequestResultClient.remainingBequest > 0 ? 'error.main' : 'secondary.main' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: cashBequestResultClient.remainingBequest > 0 ? 'error.main' : 'secondary.main', mb: 1 }}>
                    Cash Bequests (Paid from Probate Estate)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These specific cash gifts are paid from the probate estate before the residuary is distributed to the Will beneficiaries.
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.cashGiftsToBeneficiaries.map((gift, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{gift.beneficiaryName}</TableCell>
                            <TableCell align="right">{formatCurrency(parseCurrency(gift.amount))}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Total Cash Bequests</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(totalCashBequestsDeductedClient)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Warning if insufficient probate assets to cover cash bequests */}
                  {cashBequestResultClient.remainingBequest > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Insufficient Probate Assets for Cash Bequests
                      </Typography>
                      <Typography variant="body2">
                        The probate estate does not have enough assets to fully fund the cash bequests.
                        There is a shortfall of {formatCurrency(cashBequestResultClient.remainingBequest)}.
                        The cash bequest beneficiaries may receive reduced amounts or nothing, as probate assets are insufficient.
                      </Typography>
                    </Alert>
                  )}
                </Paper>
              )}

              <ScenarioSection
                title="Assets Subject to Probate (Distributed per Will)"
                assets={assetsToClientProbate}
                totalValue={calculateTotal(assetsToClientProbate)}
                color="error.main"
                subtitle={totalCashBequestsDeductedClient > 0 ? `After deducting ${formatCurrency(totalCashBequestsDeductedClient)} for cash bequests, the remaining probate assets are distributed per the Will.` : undefined}
                distributionPlan={clientDistPlan}
                children={formData.children}
                showBeneficiaryBreakdown={true}
                deceasedPersonNames={[formData.name, formData.spouseName].filter(Boolean)}
              />

              {/* Heir Summary - Total inheritance per beneficiary */}
              <Divider sx={{ my: 3 }} />
              <HeirSummary
                title="Summary: Each Heir's Total Inheritance"
                heirs={heirInheritances}
              />
            </>
          );
        })()}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        ESTATE PLAN ANALYSIS
      </Typography>

      {/* View Selector */}
      {showSpouse && (
        <Box sx={{ mb: 3 }}>
          <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
            <Button
              variant={analysisView === 'summary' ? 'contained' : 'outlined'}
              onClick={() => setAnalysisView('summary')}
            >
              Asset Summary
            </Button>
            <Button
              variant={analysisView === 'client-first' ? 'contained' : 'outlined'}
              onClick={() => setAnalysisView('client-first')}
            >
              Client Dies First
            </Button>
            <Button
              variant={analysisView === 'spouse-first' ? 'contained' : 'outlined'}
              onClick={() => setAnalysisView('spouse-first')}
            >
              Spouse Dies First
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {/* Scenario Views */}
      {analysisView === 'client-first' && showSpouse && renderClientDiesFirst()}
      {analysisView === 'spouse-first' && showSpouse && renderSpouseDiesFirst()}

      {/* Summary View (default) */}
      {(analysisView === 'summary' || !showSpouse) && (
        <>
          {/* Summary Statistics */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Asset Summary
            </Typography>

            {/* Row 1: Total Estate Value */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Estate Value</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {formatCurrency(grandTotal)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Row 2: Client Probate and Client Non-Probate */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Client Probate</Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, color: 'error.main' }}>
                  {formatCurrency(clientProbateTotal)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Client Non-Probate</Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, color: 'success.main' }}>
                  {formatCurrency(clientNonProbateTotal)}
                </Typography>
              </Box>
            </Box>

            {/* Row 3: Spouse Probate and Spouse Non-Probate */}
            {showSpouse && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Spouse Probate</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'error.main' }}>
                      {formatCurrency(spouseProbateTotal)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Spouse Non-Probate</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'success.main' }}>
                      {formatCurrency(spouseNonProbateTotal)}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Row 4: Joint Assets */}
            {showSpouse && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Joint Client-Spouse</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'info.main' }}>
                      {formatCurrency(jointClientSpouseTotal)}
                    </Typography>
                  </Box>
                  {jointClientOtherTotal > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Joint Client-Other</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 500, color: 'warning.main' }}>
                        {formatCurrency(jointClientOtherTotal)}
                      </Typography>
                    </Box>
                  )}
                  {jointSpouseOtherTotal > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Joint Spouse-Other</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 500, color: 'warning.main' }}>
                        {formatCurrency(jointSpouseOtherTotal)}
                      </Typography>
                    </Box>
                  )}
                  {jointClientSpouseOtherTotal > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Joint Client, Spouse & Other</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 500, color: 'warning.main' }}>
                        {formatCurrency(jointClientSpouseOtherTotal)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}

          </Paper>

      {/* Probate Warning */}
          {(clientProbateTotal > 0 || spouseProbateTotal > 0) && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'error.50', borderColor: 'error.main' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main', mb: 1 }}>
                Probate Alert
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {clientProbateTotal > 0 && (
                  <>The Client has {formatCurrency(clientProbateTotal)} in assets that will require probate. </>
                )}
                {spouseProbateTotal > 0 && showSpouse && (
                  <>The Spouse has {formatCurrency(spouseProbateTotal)} in assets that will require probate. </>
                )}
                Consider adding beneficiary designations or transferring to a trust to avoid probate.
              </Typography>
            </Paper>
          )}

          {/* Asset Categories */}
          <Box sx={{ mb: 3 }}>
            {filteredCategories.map((category) => (
              <CategoryAccordion
                key={category.id}
                category={category}
                defaultExpanded={category.assets.length > 0 && category.totalValue > 0}
              />
            ))}
          </Box>

          {/* Heir Distribution Summary for Single People */}
          {!showSpouse && allAssets.length > 0 && (() => {
            // Calculate beneficiary shares for all client assets
            const allAssetsWithShares: AssetWithBeneficiaryBreakdown[] = allAssets.map(asset => {
              const assetValue = parseCurrency(asset.value);
              const shares = calculateBeneficiaryShares(
                assetValue,
                asset.primaryBeneficiaries,
                asset.secondaryBeneficiaries,
                asset.secondaryDistributionType,
                formData.clientDistributionPlan.residuaryBeneficiaries,
                formData.clientDistributionPlan.residuaryShareType,
                formData.clientDistributionPlan,
                formData.children,
                [formData.name] // Client is deceased
              );

              return {
                asset,
                displayValue: assetValue,
                beneficiaryShares: shares,
              };
            });

            // Add cash gifts (general bequests) to heir summary
            const cashGiftsAsShares = formData.cashGiftsToBeneficiaries.map(gift => ({
              asset: {
                type: 'Cash Gift',
                description: `Cash Gift to ${gift.beneficiaryName}`,
                value: gift.amount,
                owner: 'Estate',
                hasBeneficiaries: true,
              } as CategorizedAsset,
              displayValue: parseCurrency(gift.amount),
              beneficiaryShares: [{
                beneficiaryName: gift.beneficiaryName,
                percentage: 100,
                amount: parseCurrency(gift.amount),
              }],
            }));

            const allAssetsWithCashGifts = [...allAssetsWithShares, ...cashGiftsAsShares];
            const heirInheritances = aggregateHeirInheritance(allAssetsWithCashGifts);

            if (heirInheritances.length === 0) return null;

            return (
              <HeirSummary
                title="Projected Distribution to Heirs"
                heirs={heirInheritances}
              />
            );
          })()}

          {/* No Assets Message */}
          {allAssets.length === 0 && (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No assets have been entered. Please complete the Assets section to see the estate plan analysis.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default EstatePlanAnalysis;
