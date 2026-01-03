'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tabs,
  Tab,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormContext, MaritalStatus, Sex, IncomeSource, IncomeFrequency, MedicalInsurance, MedicareCoverageType } from '../lib/FormContext';
import PhoneInput from './PhoneInput';
import { SSNInput } from './SSNInput';
import { HelpIcon, VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const calculateAge = (birthDate: Date | null): string => {
  if (!birthDate) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age.toString() : '';
};

const MARITAL_STATUS_OPTIONS: MaritalStatus[] = [
  'Single',
  'Married',
  'Second Marriage',
  'Divorced',
  'Separated',
  'Domestic Partnership',
];

const SEX_OPTIONS: Sex[] = ['Male', 'Female', 'Other'];

const INCOME_FREQUENCY_OPTIONS: { value: IncomeFrequency; label: string }[] = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi-Annually', label: 'Semi-Annually' },
  { value: 'Annually', label: 'Annually' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Bi-Weekly', label: 'Bi-Weekly' },
];

// Calculate monthly amount from income source
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

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Calculate total monthly income from income sources array
const calculateTotalMonthlyIncome = (incomeSources: IncomeSource[]): number => {
  return incomeSources.reduce((total, source) => {
    return total + calculateMonthlyAmount(source.amount, source.frequency);
  }, 0);
};

// Parse currency string to number
const parseCurrency = (value: string): number => {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

// Calculate total monthly insurance cost
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

const PersonalDataSection = () => {
  const { formData, updateFormData } = useFormContext();
  const [clientAge, setClientAge] = useState<string>('');
  const [spouseAge, setSpouseAge] = useState<string>('');
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  // Calculate ages when birth dates change
  useEffect(() => {
    setClientAge(calculateAge(formData.birthDate));
  }, [formData.birthDate]);

  useEffect(() => {
    setSpouseAge(calculateAge(formData.spouseBirthDate));
  }, [formData.spouseBirthDate]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent) => {
    updateFormData({ [field]: event.target.value });
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    updateFormData({ [field]: date });
  };

  const handleBirthDateBlur = () => {
    setClientAge(calculateAge(formData.birthDate));
  };

  const handleSpouseBirthDateBlur = () => {
    setSpouseAge(calculateAge(formData.spouseBirthDate));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          PERSONAL DATA
        </Typography>
        <VideoHelpIcon helpId={100} onClick={() => openHelp(100)} size="medium" />
      </Box>

      {/* Tabs - only shown when married/partnered */}
      {showSpouseInfo && (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
            },
          }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Client"
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="Spouse/Partner"
          />
        </Tabs>
      )}

      {/* CLIENT TAB (Tab 0) or Single Person View */}
      {(!showSpouseInfo || activeTab === 0) && (
      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Client Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Full Legal Name
              </Typography>
              <HelpIcon helpId={1} onClick={() => openHelp(1)} />
            </Box>
            <TextField
              fullWidth
              value={formData.name}
              onChange={handleChange('name')}
              variant="outlined"
              placeholder="Enter your full legal name"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Also Known As (AKA)
              </Typography>
              <HelpIcon helpId={2} onClick={() => openHelp(2)} />
            </Box>
            <TextField
              fullWidth
              value={formData.aka}
              onChange={handleChange('aka')}
              variant="outlined"
              placeholder="Maiden name, nickname, etc."
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Mailing Address
              </Typography>
              <HelpIcon helpId={3} onClick={() => openHelp(3)} />
            </Box>
            <TextField
              fullWidth
              value={formData.mailingAddress}
              onChange={handleChange('mailingAddress')}
              variant="outlined"
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            />
          </Box>
        </Grid>

        {/* Domicile Fields */}
        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                State of Domicile
              </Typography>
              <HelpIcon helpId={29} onClick={() => openHelp(29)} />
            </Box>
            <TextField
              fullWidth
              value={formData.stateOfDomicile}
              onChange={handleChange('stateOfDomicile')}
              variant="outlined"
              size="small"
              placeholder="e.g., Ohio"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
              Are you looking to change domicile to another state?
            </FormLabel>
            <RadioGroup
              row
              value={formData.lookingToChangeDomicile ? 'yes' : 'no'}
              onChange={(e) => {
                const isYes = e.target.value === 'yes';
                updateFormData({
                  lookingToChangeDomicile: isYes,
                  newDomicileState: isYes ? formData.newDomicileState : ''
                });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.lookingToChangeDomicile && (
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                New State of Domicile
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.newDomicileState}
                  onChange={(e) => updateFormData({ newDomicileState: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select a state</MenuItem>
                  <MenuItem value="Florida">Florida</MenuItem>
                  <MenuItem value="Pennsylvania">Pennsylvania</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Cell Phone
              </Typography>
              <HelpIcon helpId={6} onClick={() => openHelp(6)} />
            </Box>
            <PhoneInput
              fullWidth
              value={formData.cellPhone}
              onChange={handleChange('cellPhone')}
              variant="outlined"
              size="small"
              name="cellPhone"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Home Phone
              </Typography>
              <HelpIcon helpId={7} onClick={() => openHelp(7)} />
            </Box>
            <PhoneInput
              fullWidth
              value={formData.homePhone}
              onChange={handleChange('homePhone')}
              variant="outlined"
              size="small"
              name="homePhone"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Work Phone
              </Typography>
              <HelpIcon helpId={8} onClick={() => openHelp(8)} />
            </Box>
            <PhoneInput
              fullWidth
              value={formData.workPhone}
              onChange={handleChange('workPhone')}
              variant="outlined"
              size="small"
              name="workPhone"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Sex
              </Typography>
              <HelpIcon helpId={9} onClick={() => openHelp(9)} />
            </Box>
            <FormControl
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            >
              <Select
                value={formData.sex}
                onChange={handleSelectChange('sex')}
              >
                {SEX_OPTIONS.map((sex) => (
                  <MenuItem key={sex} value={sex}>
                    {sex}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Email Address
              </Typography>
              <HelpIcon helpId={10} onClick={() => openHelp(10)} />
            </Box>
            <TextField
              fullWidth
              value={formData.email}
              onChange={handleChange('email')}
              variant="outlined"
              type="email"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Birth Date
              </Typography>
              <HelpIcon helpId={11} onClick={() => openHelp(11)} />
            </Box>
            <DatePicker
              value={formData.birthDate}
              onChange={handleDateChange('birthDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  onBlur: handleBirthDateBlur,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#d32f2f',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#d32f2f',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#d32f2f',
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Age
              </Typography>
            </Box>
            <TextField
              fullWidth
              value={clientAge}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <SSNInput
            label="Social Security Number"
            value={formData.socialSecurityNumber}
            onChange={(value) => updateFormData({ socialSecurityNumber: value })}
            fullWidth
            helpId={234}
            onHelpClick={openHelp}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Marital Status
              </Typography>
              <HelpIcon helpId={12} onClick={() => openHelp(12)} />
            </Box>
            <FormControl
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            >
              <Select
                value={formData.maritalStatus}
                onChange={handleSelectChange('maritalStatus')}
              >
                {MARITAL_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* No. of Children - always shown */}
        <Grid item xs={12} md={2}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                No. of Children
              </Typography>
              <HelpIcon helpId={13} onClick={() => openHelp(13)} />
            </Box>
            <TextField
              fullWidth
              value={formData.numberOfChildren}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                updateFormData({ numberOfChildren: isNaN(value) ? 0 : value });
              }}
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: 0, style: { textAlign: 'center' } }}
            />
          </Box>
        </Grid>

        {/* For married clients, show prior children question */}
        {showSpouseInfo && (
          <>
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                    Children from prior relationship?
                  </FormLabel>
                  <HelpIcon helpId={14} onClick={() => openHelp(14)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.clientHasChildrenFromPrior ? 'yes' : 'no'}
                  onChange={(e) => {
                    const hasPrior = e.target.value === 'yes';
                    updateFormData({
                      clientHasChildrenFromPrior: hasPrior,
                      clientChildrenFromPrior: hasPrior ? formData.clientChildrenFromPrior : 0
                    });
                  }}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {formData.clientHasChildrenFromPrior && (
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="No. from Prior"
                  value={formData.clientChildrenFromPrior}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    const maxAllowed = formData.numberOfChildren - formData.childrenTogether;
                    const clampedValue = isNaN(value) ? 0 : Math.min(Math.max(1, value), Math.max(1, maxAllowed));
                    updateFormData({ clientChildrenFromPrior: clampedValue });
                  }}
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 1, max: formData.numberOfChildren - formData.childrenTogether, style: { textAlign: 'center' } }}
                  error={formData.clientChildrenFromPrior > formData.numberOfChildren - formData.childrenTogether}
                  helperText={formData.numberOfChildren > 0 ? `Max: ${Math.max(1, formData.numberOfChildren - formData.childrenTogether)}` : ''}
                />
              </Grid>
            )}
          </>
        )}

        {/* Desire to Leave to Charity */}
        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Do you desire to leave anything to charity?
              </FormLabel>
              <HelpIcon helpId={103} onClick={() => openHelp(103)} />
            </Box>
            <RadioGroup
              row
              value={formData.leaveToCharity ? 'yes' : 'no'}
              onChange={(e) => updateFormData({ leaveToCharity: e.target.value === 'yes' })}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Client's Income Sources */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Income Sources
            </Typography>
            <HelpIcon helpId={230} onClick={() => openHelp(230)} />
          </Box>
        </Grid>

        {formData.clientIncomeSources.map((incomeSource, index) => (
          <React.Fragment key={`client-income-${index}`}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  {index === 0 ? 'Income Source' : `Income Source ${index + 1}`}
                </Typography>
                <TextField
                  fullWidth
                  value={incomeSource.description}
                  onChange={(e) => {
                    const newSources = [...formData.clientIncomeSources];
                    newSources[index] = { ...newSources[index], description: e.target.value };
                    updateFormData({ clientIncomeSources: newSources });
                  }}
                  variant="outlined"
                  size="small"
                  placeholder={index === 0 ? 'Social Security' : 'e.g., Pension, Part-time work'}
                />
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  Amount
                </Typography>
                <TextField
                  fullWidth
                  value={incomeSource.amount}
                  onChange={(e) => {
                    const newSources = [...formData.clientIncomeSources];
                    newSources[index] = { ...newSources[index], amount: e.target.value };
                    updateFormData({ clientIncomeSources: newSources });
                  }}
                  variant="outlined"
                  size="small"
                  placeholder="$0.00"
                />
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  Frequency
                </Typography>
                <FormControl fullWidth variant="outlined" size="small">
                  <Select
                    value={incomeSource.frequency}
                    onChange={(e) => {
                      const newSources = [...formData.clientIncomeSources];
                      newSources[index] = { ...newSources[index], frequency: e.target.value as IncomeFrequency };
                      updateFormData({ clientIncomeSources: newSources });
                    }}
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
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  Monthly Amount
                </Typography>
                <TextField
                  fullWidth
                  value={incomeSource.amount && incomeSource.frequency
                    ? formatCurrency(calculateMonthlyAmount(incomeSource.amount, incomeSource.frequency))
                    : ''}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: 'action.hover' }}
                  placeholder="Calculated"
                />
              </Box>
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
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Medicare Part B Monthly Deduction
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
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
                placeholder="Name of plan"
                sx={{ minWidth: 150 }}
              />
            </Box>
          </FormControl>
        </Grid>

        {formData.clientMedicalInsurance.medicareCoverageType && (
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                {formData.clientMedicalInsurance.medicareCoverageType} Monthly Cost
              </Typography>
              <TextField
                fullWidth
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
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Private Insurance (if any)
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Private Insurance Monthly Cost
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Other Insurance (if any)
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Other Insurance Monthly Cost
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
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

        {/* Client's Military Service */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Military Service
            </Typography>
            <HelpIcon helpId={40} onClick={() => openHelp(40)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Did you serve in the Armed Forces?
              </FormLabel>
              <HelpIcon helpId={42} onClick={() => openHelp(42)} />
            </Box>
            <RadioGroup
              row
              value={formData.clientServedMilitary ? 'yes' : 'no'}
              onChange={(e) => {
                const served = e.target.value === 'yes';
                updateFormData({
                  clientServedMilitary: served,
                  clientMilitaryBranch: served ? formData.clientMilitaryBranch : '',
                  clientMilitaryStartDate: served ? formData.clientMilitaryStartDate : '',
                  clientMilitaryEndDate: served ? formData.clientMilitaryEndDate : '',
                });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.clientServedMilitary && (
          <>
            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Branch of Service
                  </Typography>
                </Box>
                <FormControl fullWidth variant="outlined" size="small">
                  <Select
                    value={formData.clientMilitaryBranch}
                    onChange={handleSelectChange('clientMilitaryBranch')}
                  >
                    <MenuItem value="Army">Army</MenuItem>
                    <MenuItem value="Navy">Navy</MenuItem>
                    <MenuItem value="Air Force">Air Force</MenuItem>
                    <MenuItem value="Marine Corps">Marine Corps</MenuItem>
                    <MenuItem value="Coast Guard">Coast Guard</MenuItem>
                    <MenuItem value="Space Force">Space Force</MenuItem>
                    <MenuItem value="National Guard">National Guard</MenuItem>
                    <MenuItem value="Reserves">Reserves</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Start Date
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="month"
                  value={formData.clientMilitaryStartDate}
                  onChange={handleChange('clientMilitaryStartDate')}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    End Date
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="month"
                  value={formData.clientMilitaryEndDate}
                  onChange={handleChange('clientMilitaryEndDate')}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>
          </>
        )}

        {/* Client's Funeral Preferences */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Funeral Preferences
            </Typography>
            <HelpIcon helpId={41} onClick={() => openHelp(41)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Do you have a prepaid funeral policy?
              </FormLabel>
              <HelpIcon helpId={43} onClick={() => openHelp(43)} />
            </Box>
            <RadioGroup
              row
              value={formData.clientHasPrepaidFuneral ? 'yes' : 'no'}
              onChange={(e) => {
                const hasPrepaid = e.target.value === 'yes';
                updateFormData({
                  clientHasPrepaidFuneral: hasPrepaid,
                  clientPrepaidFuneralDetails: hasPrepaid ? formData.clientPrepaidFuneralDetails : '',
                });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.clientHasPrepaidFuneral && (
          <Grid item xs={12} md={4}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Prepaid Funeral Details
                </Typography>
              </Box>
              <TextField
                fullWidth
                value={formData.clientPrepaidFuneralDetails}
                onChange={handleChange('clientPrepaidFuneralDetails')}
                variant="outlined"
                size="small"
                placeholder="Policy number, funeral home, etc."
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Burial or Cremation Preference
              </Typography>
              <HelpIcon helpId={44} onClick={() => openHelp(44)} />
            </Box>
            <FormControl fullWidth variant="outlined" size="small">
              <Select
                value={formData.clientBurialOrCremation}
                onChange={handleSelectChange('clientBurialOrCremation')}
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="Burial">Burial</MenuItem>
                <MenuItem value="Cremation">Cremation</MenuItem>
                <MenuItem value="Undecided">Undecided</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Preferred Funeral Home
              </Typography>
              <HelpIcon helpId={45} onClick={() => openHelp(45)} />
            </Box>
            <TextField
              fullWidth
              value={formData.clientPreferredFuneralHome}
              onChange={handleChange('clientPreferredFuneralHome')}
              variant="outlined"
              size="small"
              placeholder="Name and location"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Preferred Church for Service
              </Typography>
              <HelpIcon helpId={46} onClick={() => openHelp(46)} />
            </Box>
            <TextField
              fullWidth
              value={formData.clientPreferredChurch}
              onChange={handleChange('clientPreferredChurch')}
              variant="outlined"
              size="small"
              placeholder="Name and location"
            />
          </Box>
        </Grid>

        {/* Client's Existing Trusts */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Existing Trusts
            </Typography>
            <VideoHelpIcon helpId={50} onClick={() => openHelp(50)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  Do you have an existing Living Trust?
                </FormLabel>
                <HelpIcon helpId={4} onClick={() => openHelp(4)} />
              </Box>
              <RadioGroup
                row
                value={formData.clientHasLivingTrust ? 'yes' : 'no'}
                onChange={(e) => {
                  const hasLivingTrust = e.target.value === 'yes';
                  updateFormData({
                    clientHasLivingTrust: hasLivingTrust,
                    clientLivingTrustName: hasLivingTrust ? formData.clientLivingTrustName : '',
                    clientLivingTrustDate: hasLivingTrust ? formData.clientLivingTrustDate : null,
                  });
                }}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
              </RadioGroup>
            </FormControl>
            {formData.clientHasLivingTrust && (
              <>
                <TextField
                  fullWidth
                  label="Living Trust Name"
                  value={formData.clientLivingTrustName}
                  onChange={handleChange('clientLivingTrustName')}
                  variant="outlined"
                  placeholder="e.g., The John Smith Revocable Living Trust"
                />
                <DatePicker
                  label="Living Trust Date"
                  value={formData.clientLivingTrustDate}
                  onChange={handleDateChange('clientLivingTrustDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                />
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  Do you have an existing Irrevocable Trust?
                </FormLabel>
                <HelpIcon helpId={5} onClick={() => openHelp(5)} />
              </Box>
              <RadioGroup
                row
                value={formData.clientHasIrrevocableTrust ? 'yes' : 'no'}
                onChange={(e) => {
                  const hasIrrevocableTrust = e.target.value === 'yes';
                  updateFormData({
                    clientHasIrrevocableTrust: hasIrrevocableTrust,
                    clientIrrevocableTrustName: hasIrrevocableTrust ? formData.clientIrrevocableTrustName : '',
                    clientIrrevocableTrustDate: hasIrrevocableTrust ? formData.clientIrrevocableTrustDate : null,
                  });
                }}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
              </RadioGroup>
            </FormControl>
            {formData.clientHasIrrevocableTrust && (
              <>
                <TextField
                  fullWidth
                  label="Irrevocable Trust Name"
                  value={formData.clientIrrevocableTrustName}
                  onChange={handleChange('clientIrrevocableTrustName')}
                  variant="outlined"
                  placeholder="e.g., The Smith Irrevocable Trust"
                />
                <DatePicker
                  label="Irrevocable Trust Date"
                  value={formData.clientIrrevocableTrustDate}
                  onChange={handleDateChange('clientIrrevocableTrustDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                />
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Are you interested in creating or updating a trust?
              </FormLabel>
              <HelpIcon helpId={54} onClick={() => openHelp(54)} />
            </Box>
            <RadioGroup
              row
              value={formData.clientConsideringTrust ? 'yes' : 'no'}
              onChange={(e) => {
                updateFormData({ clientConsideringTrust: e.target.value === 'yes' });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Safe Deposit Box */}
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
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Bank/Institution
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={formData.safeDepositBoxBank}
                  onChange={handleChange('safeDepositBoxBank')}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Chase Bank, First National Bank"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Box Number
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={formData.safeDepositBoxNumber}
                  onChange={handleChange('safeDepositBoxNumber')}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Box #1234"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Branch Location/Address
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={formData.safeDepositBoxLocation}
                  onChange={handleChange('safeDepositBoxLocation')}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 123 Main St, Columbus, OH"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Who Has Access/Keys?
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={formData.safeDepositBoxAccess}
                  onChange={handleChange('safeDepositBoxAccess')}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Client and spouse, Attorney John Smith"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Contents/What&apos;s Stored
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={formData.safeDepositBoxContents}
                  onChange={handleChange('safeDepositBoxContents')}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  placeholder="e.g., Original will, deed to home, jewelry, birth certificates"
                />
              </Box>
            </Grid>
          </>
        )}
      </Grid>
      )}

      {/* SPOUSE TAB (Tab 1) - Only shown when married/partnered and on spouse tab */}
      {showSpouseInfo && activeTab === 1 && (
      <Grid container spacing={3}>
        {/* Spouse Information Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Spouse/Partner Information
            </Typography>
            <VideoHelpIcon helpId={51} onClick={() => openHelp(51)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Full Legal Name
              </Typography>
              <HelpIcon helpId={17} onClick={() => openHelp(17)} />
            </Box>
            <TextField
              fullWidth
              value={formData.spouseName}
              onChange={handleChange('spouseName')}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Also Known As (AKA)
              </Typography>
              <HelpIcon helpId={18} onClick={() => openHelp(18)} />
            </Box>
            <TextField
              fullWidth
              value={formData.spouseAka}
              onChange={handleChange('spouseAka')}
              variant="outlined"
              placeholder="Maiden name, nickname, etc."
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Mailing Address
              </Typography>
              <HelpIcon helpId={19} onClick={() => openHelp(19)} />
            </Box>
            <TextField
              fullWidth
              value={formData.spouseMailingAddress}
              onChange={handleChange('spouseMailingAddress')}
              variant="outlined"
              multiline
              rows={2}
              helperText="Leave blank if same as client"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Cell Phone
              </Typography>
              <HelpIcon helpId={20} onClick={() => openHelp(20)} />
            </Box>
            <PhoneInput
              fullWidth
              value={formData.spouseCellPhone}
              onChange={handleChange('spouseCellPhone')}
              variant="outlined"
              size="small"
              name="spouseCellPhone"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Home Phone
              </Typography>
              <HelpIcon helpId={21} onClick={() => openHelp(21)} />
            </Box>
            <PhoneInput
              fullWidth
              value={formData.spouseHomePhone}
              onChange={handleChange('spouseHomePhone')}
              variant="outlined"
              size="small"
              name="spouseHomePhone"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Work Phone
              </Typography>
              <HelpIcon helpId={22} onClick={() => openHelp(22)} />
            </Box>
            <PhoneInput
              fullWidth
              value={formData.spouseWorkPhone}
              onChange={handleChange('spouseWorkPhone')}
              variant="outlined"
              size="small"
              name="spouseWorkPhone"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Sex
              </Typography>
              <HelpIcon helpId={23} onClick={() => openHelp(23)} />
            </Box>
            <FormControl
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            >
              <Select
                value={formData.spouseSex}
                onChange={handleSelectChange('spouseSex')}
              >
                {SEX_OPTIONS.map((sex) => (
                  <MenuItem key={sex} value={sex}>
                    {sex}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Email Address
              </Typography>
              <HelpIcon helpId={24} onClick={() => openHelp(24)} />
            </Box>
            <TextField
              fullWidth
              value={formData.spouseEmail}
              onChange={handleChange('spouseEmail')}
              variant="outlined"
              type="email"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d32f2f',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#d32f2f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d32f2f',
                  },
                },
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Spouse Birth Date
              </Typography>
              <HelpIcon helpId={25} onClick={() => openHelp(25)} />
            </Box>
            <DatePicker
              value={formData.spouseBirthDate}
              onChange={handleDateChange('spouseBirthDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  onBlur: handleSpouseBirthDateBlur,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#d32f2f',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#d32f2f',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#d32f2f',
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Age
              </Typography>
            </Box>
            <TextField
              fullWidth
              value={spouseAge}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <SSNInput
            label="Spouse Social Security Number"
            value={formData.spouseSocialSecurityNumber}
            onChange={(value) => updateFormData({ spouseSocialSecurityNumber: value })}
            fullWidth
            helpId={234}
            onHelpClick={openHelp}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Prior Marriage?
              </FormLabel>
              <HelpIcon helpId={16} onClick={() => openHelp(16)} />
            </Box>
            <RadioGroup
              row
              value={formData.priorMarriage ? 'yes' : 'no'}
              onChange={(e) => {
                updateFormData({ priorMarriage: e.target.value === 'yes' });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Children Together
              </Typography>
              <HelpIcon helpId={15} onClick={() => openHelp(15)} />
            </Box>
            <TextField
              fullWidth
              value={formData.childrenTogether}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                const maxAllowed = formData.numberOfChildren - formData.clientChildrenFromPrior;
                const clampedValue = isNaN(value) ? 0 : Math.min(Math.max(0, value), Math.max(0, maxAllowed));
                updateFormData({ childrenTogether: clampedValue });
              }}
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: 0, max: formData.numberOfChildren - formData.clientChildrenFromPrior, style: { textAlign: 'center' } }}
              error={formData.childrenTogether > formData.numberOfChildren - formData.clientChildrenFromPrior}
              helperText={formData.numberOfChildren > 0 ? `Max: ${Math.max(0, formData.numberOfChildren - formData.clientChildrenFromPrior)}` : ''}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Spouse has children from prior?
              </FormLabel>
              <HelpIcon helpId={26} onClick={() => openHelp(26)} />
            </Box>
            <RadioGroup
              row
              value={formData.spouseHasChildrenFromPrior ? 'yes' : 'no'}
              onChange={(e) => {
                const hasPrior = e.target.value === 'yes';
                updateFormData({
                  spouseHasChildrenFromPrior: hasPrior,
                  spouseChildrenFromPrior: hasPrior ? formData.spouseChildrenFromPrior : 0
                });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        {formData.spouseHasChildrenFromPrior && (
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="No. from Prior"
              value={formData.spouseChildrenFromPrior}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                updateFormData({ spouseChildrenFromPrior: isNaN(value) ? 0 : value });
              }}
              variant="outlined"
              type="number"
              inputProps={{ min: 1, style: { textAlign: 'center' } }}
            />
          </Grid>
        )}

        {/* Spouse's Income Sources */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Spouse&apos;s Income Sources
            </Typography>
            <HelpIcon helpId={232} onClick={() => openHelp(232)} />
          </Box>
        </Grid>

        {formData.spouseIncomeSources.map((incomeSource, index) => (
          <React.Fragment key={`spouse-income-${index}`}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  {index === 0 ? 'Income Source' : `Income Source ${index + 1}`}
                </Typography>
                <TextField
                  fullWidth
                  value={incomeSource.description}
                  onChange={(e) => {
                    const newSources = [...formData.spouseIncomeSources];
                    newSources[index] = { ...newSources[index], description: e.target.value };
                    updateFormData({ spouseIncomeSources: newSources });
                  }}
                  variant="outlined"
                  size="small"
                  placeholder={index === 0 ? 'Social Security' : 'e.g., Pension, Part-time work'}
                />
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  Amount
                </Typography>
                <TextField
                  fullWidth
                  value={incomeSource.amount}
                  onChange={(e) => {
                    const newSources = [...formData.spouseIncomeSources];
                    newSources[index] = { ...newSources[index], amount: e.target.value };
                    updateFormData({ spouseIncomeSources: newSources });
                  }}
                  variant="outlined"
                  size="small"
                  placeholder="$0.00"
                />
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  Frequency
                </Typography>
                <FormControl fullWidth variant="outlined" size="small">
                  <Select
                    value={incomeSource.frequency}
                    onChange={(e) => {
                      const newSources = [...formData.spouseIncomeSources];
                      newSources[index] = { ...newSources[index], frequency: e.target.value as IncomeFrequency };
                      updateFormData({ spouseIncomeSources: newSources });
                    }}
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
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                  Monthly Amount
                </Typography>
                <TextField
                  fullWidth
                  value={incomeSource.amount && incomeSource.frequency
                    ? formatCurrency(calculateMonthlyAmount(incomeSource.amount, incomeSource.frequency))
                    : ''}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: 'action.hover' }}
                  placeholder="Calculated"
                />
              </Box>
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
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Medicare Part B Monthly Deduction
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
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
                placeholder="Name of plan"
                sx={{ minWidth: 150 }}
              />
            </Box>
          </FormControl>
        </Grid>

        {formData.spouseMedicalInsurance.medicareCoverageType && (
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                {formData.spouseMedicalInsurance.medicareCoverageType} Monthly Cost
              </Typography>
              <TextField
                fullWidth
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
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Private Insurance (if any)
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Private Insurance Monthly Cost
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Other Insurance (if any)
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              Other Insurance Monthly Cost
            </Typography>
            <TextField
              fullWidth
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
            />
          </Box>
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

        {/* Spouse's Military Service */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Spouse&apos;s Military Service
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Did your spouse serve in the Armed Forces?
              </FormLabel>
              <HelpIcon helpId={47} onClick={() => openHelp(47)} />
            </Box>
            <RadioGroup
              row
              value={formData.spouseServedMilitary ? 'yes' : 'no'}
              onChange={(e) => {
                const served = e.target.value === 'yes';
                updateFormData({
                  spouseServedMilitary: served,
                  spouseMilitaryBranch: served ? formData.spouseMilitaryBranch : '',
                  spouseMilitaryStartDate: served ? formData.spouseMilitaryStartDate : '',
                  spouseMilitaryEndDate: served ? formData.spouseMilitaryEndDate : '',
                });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.spouseServedMilitary && (
          <>
            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Branch of Service
                  </Typography>
                </Box>
                <FormControl fullWidth variant="outlined" size="small">
                  <Select
                    value={formData.spouseMilitaryBranch}
                    onChange={handleSelectChange('spouseMilitaryBranch')}
                  >
                    <MenuItem value="Army">Army</MenuItem>
                    <MenuItem value="Navy">Navy</MenuItem>
                    <MenuItem value="Air Force">Air Force</MenuItem>
                    <MenuItem value="Marine Corps">Marine Corps</MenuItem>
                    <MenuItem value="Coast Guard">Coast Guard</MenuItem>
                    <MenuItem value="Space Force">Space Force</MenuItem>
                    <MenuItem value="National Guard">National Guard</MenuItem>
                    <MenuItem value="Reserves">Reserves</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Start Date
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="month"
                  value={formData.spouseMilitaryStartDate}
                  onChange={handleChange('spouseMilitaryStartDate')}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    End Date
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="month"
                  value={formData.spouseMilitaryEndDate}
                  onChange={handleChange('spouseMilitaryEndDate')}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>
          </>
        )}

        {/* Spouse's Funeral Preferences */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Spouse&apos;s Funeral Preferences
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Does your spouse have a prepaid funeral policy?
              </FormLabel>
              <HelpIcon helpId={48} onClick={() => openHelp(48)} />
            </Box>
            <RadioGroup
              row
              value={formData.spouseHasPrepaidFuneral ? 'yes' : 'no'}
              onChange={(e) => {
                const hasPrepaid = e.target.value === 'yes';
                updateFormData({
                  spouseHasPrepaidFuneral: hasPrepaid,
                  spousePrepaidFuneralDetails: hasPrepaid ? formData.spousePrepaidFuneralDetails : '',
                });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.spouseHasPrepaidFuneral && (
          <Grid item xs={12} md={4}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Prepaid Funeral Details
                </Typography>
              </Box>
              <TextField
                fullWidth
                value={formData.spousePrepaidFuneralDetails}
                onChange={handleChange('spousePrepaidFuneralDetails')}
                variant="outlined"
                size="small"
                placeholder="Policy number, funeral home, etc."
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Burial or Cremation Preference
              </Typography>
              <HelpIcon helpId={49} onClick={() => openHelp(49)} />
            </Box>
            <FormControl fullWidth variant="outlined" size="small">
              <Select
                value={formData.spouseBurialOrCremation}
                onChange={handleSelectChange('spouseBurialOrCremation')}
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="Burial">Burial</MenuItem>
                <MenuItem value="Cremation">Cremation</MenuItem>
                <MenuItem value="Undecided">Undecided</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Preferred Funeral Home
              </Typography>
              <HelpIcon helpId={52} onClick={() => openHelp(52)} />
            </Box>
            <TextField
              fullWidth
              value={formData.spousePreferredFuneralHome}
              onChange={handleChange('spousePreferredFuneralHome')}
              variant="outlined"
              size="small"
              placeholder="Name and location"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Preferred Church for Service
              </Typography>
              <HelpIcon helpId={53} onClick={() => openHelp(53)} />
            </Box>
            <TextField
              fullWidth
              value={formData.spousePreferredChurch}
              onChange={handleChange('spousePreferredChurch')}
              variant="outlined"
              size="small"
              placeholder="Name and location"
            />
          </Box>
        </Grid>

        {/* Spouse's Existing Trusts */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Spouse&apos;s Existing Trusts
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  Does your spouse have an existing Living Trust?
                </FormLabel>
                <HelpIcon helpId={27} onClick={() => openHelp(27)} />
              </Box>
              <RadioGroup
                row
                value={formData.spouseHasLivingTrust ? 'yes' : 'no'}
                onChange={(e) => {
                  const hasLivingTrust = e.target.value === 'yes';
                  updateFormData({
                    spouseHasLivingTrust: hasLivingTrust,
                    spouseLivingTrustName: hasLivingTrust ? formData.spouseLivingTrustName : '',
                    spouseLivingTrustDate: hasLivingTrust ? formData.spouseLivingTrustDate : null,
                  });
                }}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
              </RadioGroup>
            </FormControl>
            {formData.spouseHasLivingTrust && (
              <>
                <TextField
                  fullWidth
                  label="Spouse Living Trust Name"
                  value={formData.spouseLivingTrustName}
                  onChange={handleChange('spouseLivingTrustName')}
                  variant="outlined"
                  placeholder="e.g., The Jane Smith Revocable Living Trust"
                />
                <DatePicker
                  label="Spouse Living Trust Date"
                  value={formData.spouseLivingTrustDate}
                  onChange={handleDateChange('spouseLivingTrustDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                />
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  Does your spouse have an existing Irrevocable Trust?
                </FormLabel>
                <HelpIcon helpId={28} onClick={() => openHelp(28)} />
              </Box>
              <RadioGroup
                row
                value={formData.spouseHasIrrevocableTrust ? 'yes' : 'no'}
                onChange={(e) => {
                  const hasIrrevocableTrust = e.target.value === 'yes';
                  updateFormData({
                    spouseHasIrrevocableTrust: hasIrrevocableTrust,
                    spouseIrrevocableTrustName: hasIrrevocableTrust ? formData.spouseIrrevocableTrustName : '',
                    spouseIrrevocableTrustDate: hasIrrevocableTrust ? formData.spouseIrrevocableTrustDate : null,
                  });
                }}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
              </RadioGroup>
            </FormControl>
            {formData.spouseHasIrrevocableTrust && (
              <>
                <TextField
                  fullWidth
                  label="Spouse Irrevocable Trust Name"
                  value={formData.spouseIrrevocableTrustName}
                  onChange={handleChange('spouseIrrevocableTrustName')}
                  variant="outlined"
                  placeholder="e.g., The Smith Irrevocable Trust"
                />
                <DatePicker
                  label="Spouse Irrevocable Trust Date"
                  value={formData.spouseIrrevocableTrustDate}
                  onChange={handleDateChange('spouseIrrevocableTrustDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                />
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                Is your spouse interested in creating or updating a trust?
              </FormLabel>
              <HelpIcon helpId={55} onClick={() => openHelp(55)} />
            </Box>
            <RadioGroup
              row
              value={formData.spouseConsideringTrust ? 'yes' : 'no'}
              onChange={(e) => {
                updateFormData({ spouseConsideringTrust: e.target.value === 'yes' });
              }}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      )}

      {/* Help Modal */}
      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default PersonalDataSection;
