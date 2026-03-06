'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tabs,
  Tab,
  Button,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useFormContext, MaritalStatus, IncomeSource, IncomeFrequency, MedicalInsurance, MedicareCoverageType, RoyaltyCategory, RoyaltyItem, PaymentFrequency, Transferability } from '../lib/FormContext';
import { HelpIcon, VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const INCOME_FREQUENCY_OPTIONS: { value: IncomeFrequency; label: string }[] = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi-Annually', label: 'Semi-Annually' },
  { value: 'Annually', label: 'Annually' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Bi-Weekly', label: 'Bi-Weekly' },
];

const calculateMonthlyAmount = (amount: string, frequency: IncomeFrequency): number => {
  const numAmount = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  if (isNaN(numAmount) || !frequency) return 0;

  switch (frequency) {
    case 'Monthly':
      return numAmount;
    case 'Quarterly':
      return numAmount / 3;
    case 'Semi-Annually':
      return numAmount / 6;
    case 'Annually':
      return numAmount / 12;
    case 'Weekly':
      return numAmount * 52 / 12;
    case 'Bi-Weekly':
      return numAmount * 26 / 12;
    default:
      return 0;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const calculateTotalMonthlyIncome = (incomeSources: IncomeSource[]): number => {
  return incomeSources.reduce((total, source) => {
    return total + calculateMonthlyAmount(source.amount, source.frequency);
  }, 0);
};

const parseCurrency = (value: string): number => {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

const calculateTotalInsuranceCost = (insurance: MedicalInsurance): number => {
  return (
    parseCurrency(insurance.medicarePartBDeduction) +
    parseCurrency(insurance.medicareCoverageCost) +
    parseCurrency(insurance.privateInsuranceCost) +
    parseCurrency(insurance.otherInsuranceCost)
  );
};

const MEDICARE_COVERAGE_OPTIONS: { value: MedicareCoverageType; label: string }[] = [
  { value: 'Medicare Advantage', label: 'Medicare Advantage' },
  { value: 'Medicare Supplement', label: 'Medicare Supplement (Medigap)' },
];

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// Royalty category -> specific types mapping
const ROYALTY_TYPES: Record<string, string[]> = {
  'Intellectual Property Royalties': [
    'Book/written work royalties (traditional publishing)',
    'Music royalties (mechanical, performance, synchronization, print)',
    'Songwriter/composer royalties (PRO distributions — ASCAP, BMI, SESAC)',
    'Music master recording royalties',
    'Film/TV/screenplay royalties',
    'Software licensing royalties',
    'Patent royalties',
    'Trademark licensing fees',
    'Franchise royalties received',
    'Photography/stock image licensing',
    'Art reproduction licensing',
  ],
  'Digital & Online Income Streams': [
    'YouTube channel monetization',
    'Podcast sponsorship/ad revenue',
    'Online course platform royalties (Udemy, Coursera, etc.)',
    'App store revenue (Apple, Google Play)',
    'Ebook royalties (Amazon KDP, etc.)',
    'Stock video/audio licensing',
  ],
  'Natural Resource Rights': [
    'Oil and gas royalties (surface owner or mineral rights holder)',
    'Mineral rights royalties (coal, iron ore, copper, lithium, etc.)',
    'Timber/lumber royalties',
    'Water rights leases',
    'Gravel/quarry extraction rights',
    'Geothermal rights',
    'Wind energy lease payments (land leased to wind farm operators)',
    'Solar energy lease payments (land leased for solar arrays)',
    'Pipeline easement payments',
    'Subsurface rights payments',
  ],
  'Real Property & Land-Based Streams': [
    'Cell tower lease payments',
    'Billboard lease payments',
    'Agricultural land leases (cash rent or crop share)',
    'Grazing rights leases',
    'Hunting/fishing rights leases',
    'Riparian/water access leases',
    'Railroad easement payments',
    'Utility easement payments',
  ],
  'Financial & Investment Streams': [
    'Annuity payments (fixed, variable, indexed)',
    'Structured settlement payments',
    'Lottery/prize installment payments',
    'Bond interest (municipal, corporate, Treasury)',
    'Preferred stock dividends',
    'REIT distributions',
    'Private mortgage/seller-financed note payments received',
    'Trust distributions (income beneficiary)',
    'Inherited IRA required minimum distributions',
  ],
  'Business & Commercial Streams': [
    'Franchise fees received (if franchisor)',
    'Licensing fees for proprietary processes or trade secrets',
    'Non-compete/non-solicitation payment streams',
    'Earn-out payments from business sale',
    'Consulting retainer agreements',
    'Commission overrides (insurance, financial products)',
    'Insurance renewal commissions (book of business)',
  ],
  'Government & Settlement Streams': [
    'Tribal distribution payments',
    'Indian trust land income',
    'Tobacco settlement payments (MSA distributions)',
    'Class action settlement installments',
    'Eminent domain installment payments',
    'Crop insurance payments (recurring)',
    'Conservation/CRP (Conservation Reserve Program) payments',
  ],
};

const ROYALTY_CATEGORY_OPTIONS: RoyaltyCategory[] = [
  'Intellectual Property Royalties',
  'Digital & Online Income Streams',
  'Natural Resource Rights',
  'Real Property & Land-Based Streams',
  'Financial & Investment Streams',
  'Business & Commercial Streams',
  'Government & Settlement Streams',
];

const ROYALTY_FREQUENCY_OPTIONS: { value: PaymentFrequency; label: string }[] = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi-Annually', label: 'Semi-Annually' },
  { value: 'Annually', label: 'Annually' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Bi-Weekly', label: 'Bi-Weekly' },
  { value: 'Irregular', label: 'Irregular' },
];

const TRANSFERABILITY_OPTIONS: { value: Transferability; label: string }[] = [
  { value: 'Assignable', label: 'Assignable' },
  { value: 'Heritable', label: 'Heritable' },
  { value: 'Assignable & Heritable', label: 'Assignable & Heritable' },
  { value: 'Non-Transferable', label: 'Non-Transferable' },
  { value: 'Unknown', label: 'Unknown' },
];

const EMPTY_ROYALTY: RoyaltyItem = {
  category: '',
  type: '',
  payor: '',
  paymentFrequency: '',
  approximateAmount: '',
  amountPeriod: 'Monthly',
  contractExpirationDate: '',
  underlyingAssetOrRight: '',
  transferability: '',
  documentedInEstatePlan: '',
};

const IncomeSection: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<RoyaltyCategory>('');
  const [selectedType, setSelectedType] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Royalty handlers
  const handleAddRoyalty = () => {
    if (!selectedCategory || !selectedType) return;
    const newRoyalty: RoyaltyItem = {
      ...EMPTY_ROYALTY,
      category: selectedCategory,
      type: selectedType,
    };
    updateFormData({ royalties: [...formData.royalties, newRoyalty] });
    setEditIndex(formData.royalties.length);
    setSelectedType('');
  };

  const handleUpdateRoyalty = (index: number, updates: Partial<RoyaltyItem>) => {
    const newRoyalties = [...formData.royalties];
    newRoyalties[index] = { ...newRoyalties[index], ...updates };
    updateFormData({ royalties: newRoyalties });
  };

  const handleDeleteRoyalty = (index: number) => {
    const newRoyalties = formData.royalties.filter((_, i) => i !== index);
    updateFormData({ royalties: newRoyalties });
    if (editIndex === index) setEditIndex(null);
    else if (editIndex !== null && editIndex > index) setEditIndex(editIndex - 1);
  };

  const availableTypes = selectedCategory ? ROYALTY_TYPES[selectedCategory] || [] : [];

  const clientName = formData.name || 'Client';
  const spouseName = formData.spouseName || 'Spouse';

  const renderClientIncome = () => (
    <Grid container spacing={2}>
      {/* Client's Income Sources */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Income Sources
          </Typography>
          <HelpIcon helpId={230} onClick={() => openHelp(230)} />
        </Box>
      </Grid>

      {formData.clientIncomeSources.map((incomeSource, index) => (
        <React.Fragment key={`client-income-${index}`}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={index === 0 ? 'Income Source' : `Income Source ${index + 1}`}
              value={incomeSource.description}
              onChange={(e) => {
                const newSources = [...formData.clientIncomeSources];
                newSources[index] = { ...newSources[index], description: e.target.value };
                updateFormData({ clientIncomeSources: newSources });
              }}
              variant="outlined"
              size="small"
              placeholder={index === 0 ? 'Social Security' : 'e.g., Pension, Part-time work'}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Amount"
              value={incomeSource.amount}
              onChange={(e) => {
                const newSources = [...formData.clientIncomeSources];
                newSources[index] = { ...newSources[index], amount: e.target.value };
                updateFormData({ clientIncomeSources: newSources });
              }}
              variant="outlined"
              size="small"
              placeholder="$0.00"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Frequency</InputLabel>
              <Select
                label="Frequency"
                value={incomeSource.frequency}
                onChange={(e) => {
                  const newSources = [...formData.clientIncomeSources];
                  newSources[index] = { ...newSources[index], frequency: e.target.value as IncomeFrequency };
                  updateFormData({ clientIncomeSources: newSources });
                }}
                notched
                displayEmpty
              >
                <MenuItem value="" disabled>Select frequency</MenuItem>
                {INCOME_FREQUENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Monthly Amount"
              value={incomeSource.amount && incomeSource.frequency
                ? formatCurrency(calculateMonthlyAmount(incomeSource.amount, incomeSource.frequency))
                : ''}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: 'action.hover' }}
            />
          </Grid>
        </React.Fragment>
      ))}

      {/* Total Monthly Income */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mr: 2 }}>
            Total Monthly Income:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatCurrency(calculateTotalMonthlyIncome(formData.clientIncomeSources))}
          </Typography>
        </Box>
      </Grid>

      {/* Client's Medical Insurance */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Medical Insurance
          </Typography>
          <HelpIcon helpId={231} onClick={() => openHelp(231)} />
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Medicare Part B Monthly Deduction"
          value={formData.clientMedicalInsurance.medicarePartBDeduction}
          onChange={(e) => {
            updateFormData({
              clientMedicalInsurance: {
                ...formData.clientMedicalInsurance,
                medicarePartBDeduction: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="$0.00"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={8} />

      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
            Medicare Coverage Type
          </FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RadioGroup
              row
              value={formData.clientMedicalInsurance.medicareCoverageType}
              onChange={(e) => {
                updateFormData({
                  clientMedicalInsurance: {
                    ...formData.clientMedicalInsurance,
                    medicareCoverageType: e.target.value as MedicareCoverageType,
                  },
                });
              }}
            >
              {MEDICARE_COVERAGE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            <TextField
              label="Plan Name"
              value={formData.clientMedicalInsurance.medicarePlanName}
              onChange={(e) => {
                updateFormData({
                  clientMedicalInsurance: {
                    ...formData.clientMedicalInsurance,
                    medicarePlanName: e.target.value,
                  },
                });
              }}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Box>
        </FormControl>
      </Grid>

      {formData.clientMedicalInsurance.medicareCoverageType && (
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label={`${formData.clientMedicalInsurance.medicareCoverageType} Monthly Cost`}
            value={formData.clientMedicalInsurance.medicareCoverageCost}
            onChange={(e) => {
              updateFormData({
                clientMedicalInsurance: {
                  ...formData.clientMedicalInsurance,
                  medicareCoverageCost: e.target.value,
                },
              });
            }}
            variant="outlined"
            size="small"
            placeholder="$0.00"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Private Insurance (if any)"
          value={formData.clientMedicalInsurance.privateInsuranceDescription}
          onChange={(e) => {
            updateFormData({
              clientMedicalInsurance: {
                ...formData.clientMedicalInsurance,
                privateInsuranceDescription: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="e.g., Employer-provided, Blue Cross"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Private Insurance Monthly Cost"
          value={formData.clientMedicalInsurance.privateInsuranceCost}
          onChange={(e) => {
            updateFormData({
              clientMedicalInsurance: {
                ...formData.clientMedicalInsurance,
                privateInsuranceCost: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="$0.00"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Other Insurance (if any)"
          value={formData.clientMedicalInsurance.otherInsuranceDescription}
          onChange={(e) => {
            updateFormData({
              clientMedicalInsurance: {
                ...formData.clientMedicalInsurance,
                otherInsuranceDescription: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="e.g., VA benefits, Medicaid"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Other Insurance Monthly Cost"
          value={formData.clientMedicalInsurance.otherInsuranceCost}
          onChange={(e) => {
            updateFormData({
              clientMedicalInsurance: {
                ...formData.clientMedicalInsurance,
                otherInsuranceCost: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="$0.00"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Total Monthly Insurance Cost */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mr: 2 }}>
            Total Monthly Insurance Cost:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
            {formatCurrency(calculateTotalInsuranceCost(formData.clientMedicalInsurance))}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );

  const renderSpouseIncome = () => (
    <Grid container spacing={2}>
      {/* Spouse's Income Sources */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Spouse&apos;s Income Sources
          </Typography>
          <HelpIcon helpId={232} onClick={() => openHelp(232)} />
        </Box>
      </Grid>

      {formData.spouseIncomeSources.map((incomeSource, index) => (
        <React.Fragment key={`spouse-income-${index}`}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={index === 0 ? 'Income Source' : `Income Source ${index + 1}`}
              value={incomeSource.description}
              onChange={(e) => {
                const newSources = [...formData.spouseIncomeSources];
                newSources[index] = { ...newSources[index], description: e.target.value };
                updateFormData({ spouseIncomeSources: newSources });
              }}
              variant="outlined"
              size="small"
              placeholder={index === 0 ? 'Social Security' : 'e.g., Pension, Part-time work'}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Amount"
              value={incomeSource.amount}
              onChange={(e) => {
                const newSources = [...formData.spouseIncomeSources];
                newSources[index] = { ...newSources[index], amount: e.target.value };
                updateFormData({ spouseIncomeSources: newSources });
              }}
              variant="outlined"
              size="small"
              placeholder="$0.00"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Frequency</InputLabel>
              <Select
                label="Frequency"
                value={incomeSource.frequency}
                onChange={(e) => {
                  const newSources = [...formData.spouseIncomeSources];
                  newSources[index] = { ...newSources[index], frequency: e.target.value as IncomeFrequency };
                  updateFormData({ spouseIncomeSources: newSources });
                }}
                notched
                displayEmpty
              >
                <MenuItem value="" disabled>Select frequency</MenuItem>
                {INCOME_FREQUENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Monthly Amount"
              value={incomeSource.amount && incomeSource.frequency
                ? formatCurrency(calculateMonthlyAmount(incomeSource.amount, incomeSource.frequency))
                : ''}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: 'action.hover' }}
            />
          </Grid>
        </React.Fragment>
      ))}

      {/* Spouse Total Monthly Income */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mr: 2 }}>
            Spouse&apos;s Total Monthly Income:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatCurrency(calculateTotalMonthlyIncome(formData.spouseIncomeSources))}
          </Typography>
        </Box>
      </Grid>

      {/* Spouse's Medical Insurance */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Spouse&apos;s Medical Insurance
          </Typography>
          <HelpIcon helpId={233} onClick={() => openHelp(233)} />
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Medicare Part B Monthly Deduction"
          value={formData.spouseMedicalInsurance.medicarePartBDeduction}
          onChange={(e) => {
            updateFormData({
              spouseMedicalInsurance: {
                ...formData.spouseMedicalInsurance,
                medicarePartBDeduction: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="$0.00"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={8} />

      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
            Medicare Coverage Type
          </FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RadioGroup
              row
              value={formData.spouseMedicalInsurance.medicareCoverageType}
              onChange={(e) => {
                updateFormData({
                  spouseMedicalInsurance: {
                    ...formData.spouseMedicalInsurance,
                    medicareCoverageType: e.target.value as MedicareCoverageType,
                  },
                });
              }}
            >
              {MEDICARE_COVERAGE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            <TextField
              label="Plan Name"
              value={formData.spouseMedicalInsurance.medicarePlanName}
              onChange={(e) => {
                updateFormData({
                  spouseMedicalInsurance: {
                    ...formData.spouseMedicalInsurance,
                    medicarePlanName: e.target.value,
                  },
                });
              }}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Box>
        </FormControl>
      </Grid>

      {formData.spouseMedicalInsurance.medicareCoverageType && (
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label={`${formData.spouseMedicalInsurance.medicareCoverageType} Monthly Cost`}
            value={formData.spouseMedicalInsurance.medicareCoverageCost}
            onChange={(e) => {
              updateFormData({
                spouseMedicalInsurance: {
                  ...formData.spouseMedicalInsurance,
                  medicareCoverageCost: e.target.value,
                },
              });
            }}
            variant="outlined"
            size="small"
            placeholder="$0.00"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Private Insurance (if any)"
          value={formData.spouseMedicalInsurance.privateInsuranceDescription}
          onChange={(e) => {
            updateFormData({
              spouseMedicalInsurance: {
                ...formData.spouseMedicalInsurance,
                privateInsuranceDescription: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="e.g., Employer-provided, Blue Cross"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Private Insurance Monthly Cost"
          value={formData.spouseMedicalInsurance.privateInsuranceCost}
          onChange={(e) => {
            updateFormData({
              spouseMedicalInsurance: {
                ...formData.spouseMedicalInsurance,
                privateInsuranceCost: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="$0.00"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Other Insurance (if any)"
          value={formData.spouseMedicalInsurance.otherInsuranceDescription}
          onChange={(e) => {
            updateFormData({
              spouseMedicalInsurance: {
                ...formData.spouseMedicalInsurance,
                otherInsuranceDescription: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="e.g., VA benefits, Medicaid"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Other Insurance Monthly Cost"
          value={formData.spouseMedicalInsurance.otherInsuranceCost}
          onChange={(e) => {
            updateFormData({
              spouseMedicalInsurance: {
                ...formData.spouseMedicalInsurance,
                otherInsuranceCost: e.target.value,
              },
            });
          }}
          variant="outlined"
          size="small"
          placeholder="$0.00"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Spouse Total Monthly Insurance Cost */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mr: 2 }}>
            Spouse&apos;s Total Monthly Insurance Cost:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
            {formatCurrency(calculateTotalInsuranceCost(formData.spouseMedicalInsurance))}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );



  const renderRoyalties = () => (
    <Grid container spacing={2} sx={{ mt: 3 }}>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Royalties &amp; Income Streams
          </Typography>
          <HelpIcon helpId={300} onClick={() => openHelp(300)} />
        </Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Document any royalties, licensing fees, or recurring income streams you receive. Select a category, then choose the specific type to add it.
        </Typography>
      </Grid>

      {/* Category and Type Selection */}
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel shrink>Category</InputLabel>
                <Select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as RoyaltyCategory);
                    setSelectedType('');
                  }}
                  notched
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select a category</MenuItem>
                  {ROYALTY_CATEGORY_OPTIONS.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth variant="outlined" size="small" disabled={!selectedCategory}>
                <InputLabel shrink>Type</InputLabel>
                <Select
                  label="Type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  notched
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select a type</MenuItem>
                  {availableTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddRoyalty}
                disabled={!selectedCategory || !selectedType}
                fullWidth
                sx={{ height: 40 }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Added Royalties List */}
      {formData.royalties.length === 0 && (
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No royalties or income streams added yet.
          </Typography>
        </Grid>
      )}

      {formData.royalties.map((royalty, index) => (
        <Grid item xs={12} key={`royalty-${index}`}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderColor: editIndex === index ? 'primary.main' : 'divider',
              borderWidth: editIndex === index ? 2 : 1,
            }}
          >
            {/* Header row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: editIndex === index ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={royalty.category} size="small" color="primary" variant="outlined" />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {royalty.type}
                </Typography>
                {royalty.approximateAmount && (
                  <Chip
                    label={`${royalty.approximateAmount} / ${royalty.amountPeriod}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box>
                <IconButton
                  size="small"
                  onClick={() => setEditIndex(editIndex === index ? null : index)}
                  color={editIndex === index ? 'primary' : 'default'}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteRoyalty(index)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Expanded edit form */}
            {editIndex === index && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Payor"
                      value={royalty.payor}
                      onChange={(e) => handleUpdateRoyalty(index, { payor: e.target.value })}
                      variant="outlined"
                      size="small"
                      placeholder="e.g., Penguin Random House, ASCAP"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel shrink>Payment Frequency</InputLabel>
                      <Select
                        label="Payment Frequency"
                        value={royalty.paymentFrequency}
                        onChange={(e) => handleUpdateRoyalty(index, { paymentFrequency: e.target.value as PaymentFrequency })}
                        notched
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select frequency</MenuItem>
                        {ROYALTY_FREQUENCY_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Approximate Amount"
                        value={royalty.approximateAmount}
                        onChange={(e) => handleUpdateRoyalty(index, { approximateAmount: e.target.value })}
                        variant="outlined"
                        size="small"
                        placeholder="$0.00"
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormControl variant="outlined" size="small" sx={{ minWidth: 110 }}>
                        <InputLabel shrink>Period</InputLabel>
                        <Select
                          label="Period"
                          value={royalty.amountPeriod}
                          onChange={(e) => handleUpdateRoyalty(index, { amountPeriod: e.target.value as 'Monthly' | 'Annually' })}
                          notched
                        >
                          <MenuItem value="Monthly">Monthly</MenuItem>
                          <MenuItem value="Annually">Annually</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Contract/Agreement Expiration Date"
                      value={royalty.contractExpirationDate}
                      onChange={(e) => handleUpdateRoyalty(index, { contractExpirationDate: e.target.value })}
                      variant="outlined"
                      size="small"
                      placeholder="e.g., 12/31/2030 or N/A"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Underlying Asset or Right"
                      value={royalty.underlyingAssetOrRight}
                      onChange={(e) => handleUpdateRoyalty(index, { underlyingAssetOrRight: e.target.value })}
                      variant="outlined"
                      size="small"
                      placeholder="e.g., Patent #US1234567, mineral rights on 40 acres in TX"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel shrink>Transferability</InputLabel>
                      <Select
                        label="Transferability"
                        value={royalty.transferability}
                        onChange={(e) => handleUpdateRoyalty(index, { transferability: e.target.value as Transferability })}
                        notched
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select</MenuItem>
                        {TRANSFERABILITY_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel shrink>Documented in Estate Plan?</InputLabel>
                      <Select
                        label="Documented in Estate Plan?"
                        value={royalty.documentedInEstatePlan}
                        onChange={(e) => handleUpdateRoyalty(index, { documentedInEstatePlan: e.target.value as 'Yes' | 'No' | 'Unsure' })}
                        notched
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select</MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                        <MenuItem value="Unsure">Unsure</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          Income &amp; Medical Insurance
        </Typography>
        <VideoHelpIcon helpId={230} onClick={() => openHelp(230)} size="medium" />
      </Box>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Enter your income sources and medical insurance details. This information helps us understand your financial picture.
      </Typography>

      {showSpouse ? (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label={clientName}
              sx={{
                color: activeTab === 0 ? '#1a237e' : 'text.secondary',
                '&.Mui-selected': { color: '#1a237e' },
              }}
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label={spouseName}
              sx={{
                color: activeTab === 1 ? '#2e7d32' : 'text.secondary',
                '&.Mui-selected': { color: '#2e7d32' },
              }}
            />
          </Tabs>

          {activeTab === 0 && renderClientIncome()}
          {activeTab === 1 && renderSpouseIncome()}
        </>
      ) : (
        renderClientIncome()
      )}

      {renderRoyalties()}

      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default IncomeSection;
