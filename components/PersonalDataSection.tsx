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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormContext, MaritalStatus, Sex } from '../lib/FormContext';
import PhoneInput from './PhoneInput';
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

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const PersonalDataSection = () => {
  const { formData, updateFormData } = useFormContext();
  const [clientAge, setClientAge] = useState<string>('');
  const [spouseAge, setSpouseAge] = useState<string>('');
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

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
                <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
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
                <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
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
            />
          </Box>
        </Grid>

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
                <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
              </Typography>
              <HelpIcon helpId={9} onClick={() => openHelp(9)} />
            </Box>
            <FormControl fullWidth variant="outlined" size="small">
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
                <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
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
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Birth Date
                <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
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
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Marital Status
                <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
              </Typography>
              <HelpIcon helpId={12} onClick={() => openHelp(12)} />
            </Box>
            <FormControl fullWidth variant="outlined" size="small">
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

        {/* Spouse Information - Only shown for Married, Second Marriage, or Domestic Partnership */}
        {showSpouseInfo && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
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
            <FormControl fullWidth variant="outlined" size="small">
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
          </>
        )}
      </Grid>

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
