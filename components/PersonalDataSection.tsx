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
  InputLabel,
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
import { folioColors } from './FolioModal';

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
        <Typography variant="h5" sx={{ fontWeight: 600, color: folioColors.ink }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Full Legal Name"
              value={formData.name}
              onChange={handleChange('name')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
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
            <HelpIcon helpId={1} onClick={() => openHelp(1)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Also Known As (AKA)"
              value={formData.aka}
              onChange={handleChange('aka')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={2} onClick={() => openHelp(2)} />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Mailing Address"
              value={formData.mailingAddress}
              onChange={handleChange('mailingAddress')}
              variant="outlined"
              multiline
              rows={2}
              InputLabelProps={{ shrink: true }}
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
            <HelpIcon helpId={3} onClick={() => openHelp(3)} />
          </Box>
        </Grid>

        {/* Domicile Fields */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="State of Domicile"
              value={formData.stateOfDomicile}
              onChange={handleChange('stateOfDomicile')}
              variant="outlined"
              size="small"
              placeholder="e.g., Ohio"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={29} onClick={() => openHelp(29)} />
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
            <FormControl fullWidth size="small">
              <InputLabel shrink>New State of Domicile</InputLabel>
              <Select
                label="New State of Domicile"
                value={formData.newDomicileState}
                onChange={(e) => updateFormData({ newDomicileState: e.target.value })}
                notched
                displayEmpty
              >
                <MenuItem value="" disabled>Select a state</MenuItem>
                <MenuItem value="Florida">Florida</MenuItem>
                <MenuItem value="Pennsylvania">Pennsylvania</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                label="Sex"
                value={formData.sex}
                onChange={handleSelectChange('sex')}
                notched
                displayEmpty
              >
                {SEX_OPTIONS.map((sex) => (
                  <MenuItem key={sex} value={sex}>
                    {sex}
                  </MenuItem>
                ))}
              </Select>
              <InputLabel shrink>Sex</InputLabel>
            </FormControl>
            <HelpIcon helpId={9} onClick={() => openHelp(9)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneInput
              fullWidth
              label="Home Phone"
              value={formData.homePhone}
              onChange={handleChange('homePhone')}
              variant="outlined"
              size="small"
              name="homePhone"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={7} onClick={() => openHelp(7)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneInput
              fullWidth
              label="Work Phone"
              value={formData.workPhone}
              onChange={handleChange('workPhone')}
              variant="outlined"
              size="small"
              name="workPhone"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={8} onClick={() => openHelp(8)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneInput
              fullWidth
              label="Cell Phone"
              value={formData.cellPhone}
              onChange={handleChange('cellPhone')}
              variant="outlined"
              size="small"
              name="cellPhone"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={6} onClick={() => openHelp(6)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Email Address"
              value={formData.email}
              onChange={handleChange('email')}
              variant="outlined"
              type="email"
              size="small"
              InputLabelProps={{ shrink: true }}
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
            <HelpIcon helpId={10} onClick={() => openHelp(10)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DatePicker
              label="Birth Date"
              value={formData.birthDate}
              onChange={handleDateChange('birthDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  onBlur: handleBirthDateBlur,
                  InputLabelProps: { shrink: true },
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
            <HelpIcon helpId={11} onClick={() => openHelp(11)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Age"
            value={clientAge}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: true,
            }}
            sx={{ backgroundColor: '#f5f5f5' }}
          />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
              <InputLabel shrink>Marital Status</InputLabel>
              <Select
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={handleSelectChange('maritalStatus')}
                notched
              >
                {MARITAL_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <HelpIcon helpId={12} onClick={() => openHelp(12)} />
          </Box>
        </Grid>

        {/* No. of Children - always shown */}
        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="No. of Children"
              value={formData.numberOfChildren}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                updateFormData({ numberOfChildren: isNaN(value) ? 0 : value });
              }}
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: 0, style: { textAlign: 'center' } }}
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={13} onClick={() => openHelp(13)} />
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
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel shrink>Branch of Service</InputLabel>
                <Select
                  label="Branch of Service"
                  value={formData.clientMilitaryBranch}
                  onChange={handleSelectChange('clientMilitaryBranch')}
                  notched
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
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="month"
                value={formData.clientMilitaryStartDate}
                onChange={handleChange('clientMilitaryStartDate')}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="month"
                value={formData.clientMilitaryEndDate}
                onChange={handleChange('clientMilitaryEndDate')}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        )}

        {/* Client's Safe Deposit Box */}
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
            <TextField
              fullWidth
              label="Prepaid Funeral Details"
              value={formData.clientPrepaidFuneralDetails}
              onChange={handleChange('clientPrepaidFuneralDetails')}
              variant="outlined"
              size="small"
              placeholder="Policy number, funeral home, etc."
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Burial or Cremation Preference</InputLabel>
              <Select
                label="Burial or Cremation Preference"
                value={formData.clientBurialOrCremation}
                onChange={handleSelectChange('clientBurialOrCremation')}
                notched
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="Burial">Burial</MenuItem>
                <MenuItem value="Cremation">Cremation</MenuItem>
                <MenuItem value="Undecided">Undecided</MenuItem>
              </Select>
            </FormControl>
            <HelpIcon helpId={44} onClick={() => openHelp(44)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Preferred Funeral Home"
              value={formData.clientPreferredFuneralHome}
              onChange={handleChange('clientPreferredFuneralHome')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={45} onClick={() => openHelp(45)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Preferred Church for Service"
              value={formData.clientPreferredChurch}
              onChange={handleChange('clientPreferredChurch')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={46} onClick={() => openHelp(46)} />
          </Box>
        </Grid>


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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Spouse Full Legal Name"
              value={formData.spouseName}
              onChange={handleChange('spouseName')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
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
            <HelpIcon helpId={17} onClick={() => openHelp(17)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Spouse Also Known As (AKA)"
              value={formData.spouseAka}
              onChange={handleChange('spouseAka')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={18} onClick={() => openHelp(18)} />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Spouse Mailing Address"
              value={formData.spouseMailingAddress}
              onChange={handleChange('spouseMailingAddress')}
              variant="outlined"
              multiline
              rows={2}
              helperText="Leave blank if same as client"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={19} onClick={() => openHelp(19)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneInput
              fullWidth
              label="Spouse Cell Phone"
              value={formData.spouseCellPhone}
              onChange={handleChange('spouseCellPhone')}
              variant="outlined"
              size="small"
              name="spouseCellPhone"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={20} onClick={() => openHelp(20)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneInput
              fullWidth
              label="Spouse Home Phone"
              value={formData.spouseHomePhone}
              onChange={handleChange('spouseHomePhone')}
              variant="outlined"
              size="small"
              name="spouseHomePhone"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={21} onClick={() => openHelp(21)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneInput
              fullWidth
              label="Spouse Work Phone"
              value={formData.spouseWorkPhone}
              onChange={handleChange('spouseWorkPhone')}
              variant="outlined"
              size="small"
              name="spouseWorkPhone"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={22} onClick={() => openHelp(22)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
              <InputLabel shrink>Sex</InputLabel>
              <Select
                label="Sex"
                value={formData.spouseSex}
                onChange={handleSelectChange('spouseSex')}
                notched
              >
                {SEX_OPTIONS.map((sex) => (
                  <MenuItem key={sex} value={sex}>
                    {sex}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <HelpIcon helpId={23} onClick={() => openHelp(23)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Spouse Email Address"
              value={formData.spouseEmail}
              onChange={handleChange('spouseEmail')}
              variant="outlined"
              type="email"
              size="small"
              InputLabelProps={{ shrink: true }}
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
            <HelpIcon helpId={24} onClick={() => openHelp(24)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DatePicker
              label="Spouse Birth Date"
              value={formData.spouseBirthDate}
              onChange={handleDateChange('spouseBirthDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  onBlur: handleSpouseBirthDateBlur,
                  InputLabelProps: { shrink: true },
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
            <HelpIcon helpId={25} onClick={() => openHelp(25)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Age"
            value={spouseAge}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: true,
            }}
            sx={{ backgroundColor: '#f5f5f5' }}
          />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Children Together"
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
              InputLabelProps={{ shrink: true }}
              error={formData.childrenTogether > formData.numberOfChildren - formData.clientChildrenFromPrior}
              helperText={formData.numberOfChildren > 0 ? `Max: ${Math.max(0, formData.numberOfChildren - formData.clientChildrenFromPrior)}` : ''}
            />
            <HelpIcon helpId={15} onClick={() => openHelp(15)} />
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
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel shrink>Branch of Service</InputLabel>
                <Select
                  label="Branch of Service"
                  value={formData.spouseMilitaryBranch}
                  onChange={handleSelectChange('spouseMilitaryBranch')}
                  notched
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
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="month"
                value={formData.spouseMilitaryStartDate}
                onChange={handleChange('spouseMilitaryStartDate')}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="month"
                value={formData.spouseMilitaryEndDate}
                onChange={handleChange('spouseMilitaryEndDate')}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
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
            <TextField
              fullWidth
              label="Prepaid Funeral Details"
              value={formData.spousePrepaidFuneralDetails}
              onChange={handleChange('spousePrepaidFuneralDetails')}
              variant="outlined"
              size="small"
              placeholder="Policy number, funeral home, etc."
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Burial or Cremation Preference</InputLabel>
              <Select
                label="Burial or Cremation Preference"
                value={formData.spouseBurialOrCremation}
                onChange={handleSelectChange('spouseBurialOrCremation')}
                notched
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="Burial">Burial</MenuItem>
                <MenuItem value="Cremation">Cremation</MenuItem>
                <MenuItem value="Undecided">Undecided</MenuItem>
              </Select>
            </FormControl>
            <HelpIcon helpId={49} onClick={() => openHelp(49)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Preferred Funeral Home"
              value={formData.spousePreferredFuneralHome}
              onChange={handleChange('spousePreferredFuneralHome')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={52} onClick={() => openHelp(52)} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Preferred Church for Service"
              value={formData.spousePreferredChurch}
              onChange={handleChange('spousePreferredChurch')}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <HelpIcon helpId={53} onClick={() => openHelp(53)} />
          </Box>
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
