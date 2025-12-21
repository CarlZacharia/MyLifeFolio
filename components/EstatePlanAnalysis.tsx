'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormContext, MaritalStatus, RealEstateOwner, OwnershipForm } from '../lib/FormContext';

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
  clientPercentage?: string;
  spousePercentage?: string;
  clientSpouseJointType?: string; // For TIC with "Client, Spouse and Other"
  clientSpouseCombinedPercentage?: string; // For TIC with "Client, Spouse and Other" when owned as TBE/JTWROS
  // For TIC assets, this holds the calculated value based on ownership percentage
  calculatedValue?: number;
  // For scenario display - how asset passes (e.g., "Joint with Spouse", "Beneficiary Designation")
  passageMethod?: string;
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
                <TableCell sx={{ fontWeight: 600 }}>Beneficiaries</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {category.assets.map((asset, index) => {
                // Use calculated value for TIC assets, otherwise use raw value
                const displayValue = asset.calculatedValue !== undefined
                  ? asset.calculatedValue
                  : asset.value;

                return (
                  <TableRow key={index}>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.description}</TableCell>
                    <TableCell>{asset.owner}</TableCell>
                    <TableCell>{asset.hasBeneficiaries ? 'Yes' : 'No'}</TableCell>
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

// Scenario section component for death order analysis
interface ScenarioSectionProps {
  title: string;
  assets: CategorizedAsset[];
  totalValue: number;
  color?: string;
  subtitle?: string;
}

const ScenarioSection: React.FC<ScenarioSectionProps> = ({ title, assets, totalValue, color = 'primary.main', subtitle }) => {
  if (assets.length === 0) return null;

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
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Asset Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>How It Passes</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset, index) => {
              const displayValue = asset.calculatedValue !== undefined
                ? asset.calculatedValue
                : asset.value;
              return (
                <TableRow key={index}>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>{asset.description}</TableCell>
                  <TableCell>{asset.passageMethod || '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(displayValue)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const EstatePlanAnalysis: React.FC = () => {
  const { formData } = useFormContext();
  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);
  const [analysisView, setAnalysisView] = useState<AnalysisView>('summary');

  // Helper to check if asset is client-only (sole ownership)
  const isClientSole = (owner: string, ownershipForm?: string): boolean => {
    return owner === 'Client' && (!ownershipForm || ownershipForm === 'Sole');
  };

  // Helper to check if asset is spouse-only (sole ownership)
  const isSpouseSole = (owner: string, ownershipForm?: string): boolean => {
    return owner === 'Spouse' && (!ownershipForm || ownershipForm === 'Sole');
  };

  // Helper to check if joint client+spouse with TBE or JTWROS
  // For assets without ownershipForm (like bank accounts), treat "Client and Spouse" as joint
  const isJointClientSpouse = (owner: string, ownershipForm?: string): boolean => {
    if (owner !== 'Client and Spouse') return false;
    // If no ownership form specified (e.g., bank accounts), treat as joint
    if (!ownershipForm) return true;
    return ownershipForm === 'Tenants by Entirety' || ownershipForm === 'JTWROS';
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
        passageMethod: getPassageMethod(account.owner, undefined, hasBeneficiaries),
      };
    });
  };

  // Categorize life insurance (cash value only)
  const categorizeLifeInsurance = (): CategorizedAsset[] => {
    return formData.lifeInsurance
      .filter(policy => policy.cashValue && parseCurrency(policy.cashValue) > 0)
      .map(policy => {
        const hasBeneficiaries = policy.hasBeneficiaries && policy.primaryBeneficiaries.length > 0;
        return {
          type: 'Life Insurance (Cash Value)',
          description: `${policy.company} - ${policy.policyType}`,
          value: policy.cashValue,
          owner: policy.owner,
          hasBeneficiaries,
          primaryBeneficiaries: policy.primaryBeneficiaries,
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
        passageMethod: getPassageMethod(vehicle.owner, undefined, hasBeneficiaries),
      };
    });
  };

  // Categorize other assets
  const categorizeOtherAssets = (): CategorizedAsset[] => {
    return formData.otherAssets.map(asset => {
      const hasBeneficiaries = asset.hasBeneficiaries && asset.primaryBeneficiaries.length > 0;
      return {
        type: 'Other Asset',
        description: asset.description,
        value: asset.value,
        owner: asset.owner,
        hasBeneficiaries,
        primaryBeneficiaries: asset.primaryBeneficiaries,
        passageMethod: getPassageMethod(asset.owner, undefined, hasBeneficiaries),
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

  // Category 3: Joint Client+Spouse (TBE/JTWROS) without beneficiaries
  const jointNoBeneficiaries = allAssets.filter(asset =>
    isJointClientSpouse(asset.owner, asset.ownershipForm) && !asset.hasBeneficiaries
  );

  // Category 4: Joint Client+Spouse (TBE/JTWROS) with beneficiaries
  const jointWithBeneficiaries = allAssets.filter(asset =>
    isJointClientSpouse(asset.owner, asset.ownershipForm) && asset.hasBeneficiaries
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
      description: 'Assets owned jointly by Client and Spouse as Tenants by Entirety or JTWROS with designated beneficiaries. These pass to the surviving spouse, then to beneficiaries.',
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
    const assetsToOtherBeneficiaries = clientAssetsWithOtherBeneficiaries;

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

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
          Then When Spouse Dies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          After Client&apos;s death, Spouse will own all joint assets plus any assets inherited from Client. The following shows the complete estate distribution when Spouse subsequently dies.
        </Typography>

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

          // Spouse's original non-probate assets - these pass to their designated secondary beneficiaries
          const spouseOriginalNonProbate: CategorizedAsset[] = [
            ...spouseNonProbateAssets.map(a => ({ ...a, passageMethod: 'Secondary Beneficiaries' })),
          ];

          // Joint assets with beneficiaries - these pass to designated beneficiaries
          const jointAssetsWithBenef: CategorizedAsset[] = [
            ...jointWithBeneficiaries.map(a => ({ ...a, passageMethod: 'Beneficiary Designation' })),
          ];

          // Assets subject to beneficiary redesignation - inherited from client with beneficiary designations
          // Spouse may keep original secondary beneficiaries OR designate new ones after rollover
          const assetsSubjectToRedesignation: CategorizedAsset[] = [
            ...clientAssetsWithSpouseAsBeneficiary.map(a => ({ ...a, passageMethod: 'Inherited (May Redesignate)' })),
          ];

          // Assets going to probate - no beneficiary designations
          const assetsToSpouseProbate: CategorizedAsset[] = [
            ...spouseProbateAssets.map(a => ({ ...a, passageMethod: 'Probate' })),
            ...jointNoBeneficiaries.map(a => ({ ...a, passageMethod: 'Probate (was Joint)' })),
            ...(provideForSpouseFirst
              ? clientProbateAssets.map(a => ({ ...a, passageMethod: 'Probate (Inherited from Client)' }))
              : []),
          ];

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
              />

              <ScenarioSection
                title="Joint Assets Passing to Beneficiaries"
                assets={jointAssetsWithBenef}
                totalValue={calculateTotal(jointAssetsWithBenef)}
                color="info.main"
                subtitle="Joint assets that now pass to their designated beneficiaries."
              />

              <ScenarioSection
                title="Assets Subject to Beneficiary Redesignation"
                assets={assetsSubjectToRedesignation}
                totalValue={calculateTotal(assetsSubjectToRedesignation)}
                color="#ed6c02"
                subtitle="Spouse inherited these from Client and may keep the original secondary beneficiaries OR designate new beneficiaries after rolling over the accounts."
              />

              <ScenarioSection
                title="Assets Passing to Joint Owners (Other)"
                assets={spouseJointWithOther}
                totalValue={calculateTotal(spouseJointWithOther)}
                color="warning.main"
              />

              <ScenarioSection
                title="Assets Subject to Probate"
                assets={assetsToSpouseProbate}
                totalValue={calculateTotal(assetsToSpouseProbate)}
                color="error.main"
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
    const assetsToOtherBeneficiaries = spouseAssetsWithOtherBeneficiaries;

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

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
          Then When Client Dies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          After Spouse&apos;s death, Client will own all joint assets plus any assets inherited from Spouse. The following shows the complete estate distribution when Client subsequently dies.
        </Typography>

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

          // Client's original non-probate assets - these pass to their designated secondary beneficiaries
          const clientOriginalNonProbate: CategorizedAsset[] = [
            ...clientNonProbateAssets.map(a => ({ ...a, passageMethod: 'Secondary Beneficiaries' })),
          ];

          // Joint assets with beneficiaries - these pass to designated beneficiaries
          const jointAssetsWithBenef: CategorizedAsset[] = [
            ...jointWithBeneficiaries.map(a => ({ ...a, passageMethod: 'Beneficiary Designation' })),
          ];

          // Assets subject to beneficiary redesignation - inherited from spouse with beneficiary designations
          // Client may keep original secondary beneficiaries OR designate new ones after rollover
          const assetsSubjectToRedesignation: CategorizedAsset[] = [
            ...spouseAssetsWithClientAsBeneficiary.map(a => ({ ...a, passageMethod: 'Inherited (May Redesignate)' })),
          ];

          // Assets going to probate - no beneficiary designations
          const assetsToClientProbate: CategorizedAsset[] = [
            ...clientProbateAssets.map(a => ({ ...a, passageMethod: 'Probate' })),
            ...jointNoBeneficiaries.map(a => ({ ...a, passageMethod: 'Probate (was Joint)' })),
            ...(provideForSpouseFirst
              ? spouseProbateAssets.map(a => ({ ...a, passageMethod: 'Probate (Inherited from Spouse)' }))
              : []),
          ];

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
              />

              <ScenarioSection
                title="Joint Assets Passing to Beneficiaries"
                assets={jointAssetsWithBenef}
                totalValue={calculateTotal(jointAssetsWithBenef)}
                color="info.main"
                subtitle="Joint assets that now pass to their designated beneficiaries."
              />

              <ScenarioSection
                title="Assets Subject to Beneficiary Redesignation"
                assets={assetsSubjectToRedesignation}
                totalValue={calculateTotal(assetsSubjectToRedesignation)}
                color="#ed6c02"
                subtitle="Client inherited these from Spouse and may keep the original secondary beneficiaries OR designate new beneficiaries after rolling over the accounts."
              />

              <ScenarioSection
                title="Assets Passing to Joint Owners (Other)"
                assets={clientJointWithOther}
                totalValue={calculateTotal(clientJointWithOther)}
                color="warning.main"
              />

              <ScenarioSection
                title="Assets Subject to Probate"
                assets={assetsToClientProbate}
                totalValue={calculateTotal(assetsToClientProbate)}
                color="error.main"
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
                  <Box>
                    <Typography variant="body2" color="text.secondary">Joint Client-Other</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'warning.main' }}>
                      {formatCurrency(jointClientOtherTotal)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Joint Spouse-Other</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'warning.main' }}>
                      {formatCurrency(jointSpouseOtherTotal)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Joint Client, Spouse & Other</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'warning.main' }}>
                      {formatCurrency(jointClientSpouseOtherTotal)}
                    </Typography>
                  </Box>
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
