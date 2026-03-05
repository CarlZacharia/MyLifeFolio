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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import { useFormContext, MaritalStatus, IncomeSource, IncomeFrequency, MedicalInsurance, MedicareCoverageType } from '../lib/FormContext';
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

const IncomeSection: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

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

  const renderSafeDepositBox = () => (
    <Grid container spacing={2} sx={{ mt: 3 }}>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Safe Deposit Box
          </Typography>
          <HelpIcon helpId={56} onClick={() => openHelp(56)} />
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl component="fieldset">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
              Do you have a safe deposit box?
            </FormLabel>
            <HelpIcon helpId={57} onClick={() => openHelp(57)} />
          </Box>
          <RadioGroup
            row
            value={formData.hasSafeDepositBox ? 'yes' : 'no'}
            onChange={(e) => {
              const hasBox = e.target.value === 'yes';
              updateFormData({
                hasSafeDepositBox: hasBox,
                safeDepositBoxBank: hasBox ? formData.safeDepositBoxBank : '',
                safeDepositBoxNumber: hasBox ? formData.safeDepositBoxNumber : '',
                safeDepositBoxLocation: hasBox ? formData.safeDepositBoxLocation : '',
                safeDepositBoxAccess: hasBox ? formData.safeDepositBoxAccess : '',
                safeDepositBoxContents: hasBox ? formData.safeDepositBoxContents : '',
              });
            }}
          >
            <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
            <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
          </RadioGroup>
        </FormControl>
      </Grid>

      {formData.hasSafeDepositBox && (
        <>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Bank/Institution"
              value={formData.safeDepositBoxBank}
              onChange={(e) => updateFormData({ safeDepositBoxBank: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., Chase Bank, First National Bank"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Box Number"
              value={formData.safeDepositBoxNumber}
              onChange={(e) => updateFormData({ safeDepositBoxNumber: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., Box #1234"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Branch Location/Address"
              value={formData.safeDepositBoxLocation}
              onChange={(e) => updateFormData({ safeDepositBoxLocation: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., 123 Main St, Columbus, OH"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Who Has Access/Keys?"
              value={formData.safeDepositBoxAccess}
              onChange={(e) => updateFormData({ safeDepositBoxAccess: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., Client and spouse, Attorney John Smith"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contents/What's Stored"
              value={formData.safeDepositBoxContents}
              onChange={(e) => updateFormData({ safeDepositBoxContents: e.target.value })}
              variant="outlined"
              size="small"
              multiline
              rows={2}
              placeholder="e.g., Original will, deed to home, jewelry, birth certificates"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </>
      )}
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

      {renderSafeDepositBox()}

      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default IncomeSection;
