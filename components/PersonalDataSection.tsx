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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormContext, MaritalStatus, Sex } from '../lib/FormContext';
import PhoneInput from './PhoneInput';

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

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

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
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        PERSONAL DATA
      </Typography>

      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Client Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Legal Name"
            value={formData.name}
            onChange={handleChange('name')}
            variant="outlined"
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Also Known As (AKA)"
            value={formData.aka}
            onChange={handleChange('aka')}
            variant="outlined"
            helperText="Maiden name, nickname, etc."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mailing Address"
            value={formData.mailingAddress}
            onChange={handleChange('mailingAddress')}
            variant="outlined"
            required
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <PhoneInput
            fullWidth
            label="Cell Phone"
            value={formData.cellPhone}
            onChange={handleChange('cellPhone')}
            variant="outlined"
            name="cellPhone"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <PhoneInput
            fullWidth
            label="Home Phone"
            value={formData.homePhone}
            onChange={handleChange('homePhone')}
            variant="outlined"
            name="homePhone"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <PhoneInput
            fullWidth
            label="Work Phone"
            value={formData.workPhone}
            onChange={handleChange('workPhone')}
            variant="outlined"
            name="workPhone"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel id="sex-label">Sex</InputLabel>
            <Select
              labelId="sex-label"
              value={formData.sex}
              onChange={handleSelectChange('sex')}
              label="Sex"
            >
              {SEX_OPTIONS.map((sex) => (
                <MenuItem key={sex} value={sex}>
                  {sex}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email Address"
            value={formData.email}
            onChange={handleChange('email')}
            variant="outlined"
            type="email"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <DatePicker
            label="Birth Date"
            value={formData.birthDate}
            onChange={handleDateChange('birthDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
                required: true,
                onBlur: handleBirthDateBlur,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Age"
            value={clientAge}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
            sx={{ backgroundColor: '#f5f5f5' }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel id="marital-status-label">Marital Status</InputLabel>
            <Select
              labelId="marital-status-label"
              value={formData.maritalStatus}
              onChange={handleSelectChange('maritalStatus')}
              label="Marital Status"
            >
              {MARITAL_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* No. of Children - always shown */}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="No. of Children"
            value={formData.numberOfChildren}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              updateFormData({ numberOfChildren: isNaN(value) ? 0 : value });
            }}
            variant="outlined"
            type="number"
            inputProps={{ min: 0, style: { textAlign: 'center' } }}
          />
        </Grid>

        {/* For married clients, show prior children question */}
        {showSpouseInfo && (
          <>
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
                  Children from prior relationship?
                </FormLabel>
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

        {/* Client's Existing Trusts */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 500 }}>
            Existing Trusts
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
              Do you have an existing Living Trust?
            </FormLabel>
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
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
              Do you have an existing Irrevocable Trust?
            </FormLabel>
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
        </Grid>

        {formData.clientHasLivingTrust && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Living Trust Name"
                value={formData.clientLivingTrustName}
                onChange={handleChange('clientLivingTrustName')}
                variant="outlined"
                placeholder="e.g., The John Smith Revocable Living Trust"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </>
        )}

        {formData.clientHasIrrevocableTrust && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Irrevocable Trust Name"
                value={formData.clientIrrevocableTrustName}
                onChange={handleChange('clientIrrevocableTrustName')}
                variant="outlined"
                placeholder="e.g., The Smith Irrevocable Trust"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </>
        )}

        {/* Spouse Information - Only shown for Married, Second Marriage, or Domestic Partnership */}
        {showSpouseInfo && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 500 }}>
                Spouse/Partner Information
              </Typography>
            </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Spouse Full Legal Name"
            value={formData.spouseName}
            onChange={handleChange('spouseName')}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Spouse Also Known As (AKA)"
            value={formData.spouseAka}
            onChange={handleChange('spouseAka')}
            variant="outlined"
            helperText="Maiden name, nickname, etc."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Spouse Mailing Address"
            value={formData.spouseMailingAddress}
            onChange={handleChange('spouseMailingAddress')}
            variant="outlined"
            multiline
            rows={2}
            helperText="Leave blank if same as client"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <PhoneInput
            fullWidth
            label="Spouse Cell Phone"
            value={formData.spouseCellPhone}
            onChange={handleChange('spouseCellPhone')}
            variant="outlined"
            name="spouseCellPhone"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <PhoneInput
            fullWidth
            label="Spouse Home Phone"
            value={formData.spouseHomePhone}
            onChange={handleChange('spouseHomePhone')}
            variant="outlined"
            name="spouseHomePhone"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <PhoneInput
            fullWidth
            label="Spouse Work Phone"
            value={formData.spouseWorkPhone}
            onChange={handleChange('spouseWorkPhone')}
            variant="outlined"
            name="spouseWorkPhone"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="spouse-sex-label">Sex</InputLabel>
            <Select
              labelId="spouse-sex-label"
              value={formData.spouseSex}
              onChange={handleSelectChange('spouseSex')}
              label="Sex"
            >
              {SEX_OPTIONS.map((sex) => (
                <MenuItem key={sex} value={sex}>
                  {sex}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Spouse Email Address"
            value={formData.spouseEmail}
            onChange={handleChange('spouseEmail')}
            variant="outlined"
            type="email"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <DatePicker
            label="Spouse Birth Date"
            value={formData.spouseBirthDate}
            onChange={handleDateChange('spouseBirthDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
                onBlur: handleSpouseBirthDateBlur,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Age"
            value={spouseAge}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
            sx={{ backgroundColor: '#f5f5f5' }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
              Prior Marriage?
            </FormLabel>
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
            type="number"
            inputProps={{ min: 0, max: formData.numberOfChildren - formData.clientChildrenFromPrior, style: { textAlign: 'center' } }}
            error={formData.childrenTogether > formData.numberOfChildren - formData.clientChildrenFromPrior}
            helperText={formData.numberOfChildren > 0 ? `Max: ${Math.max(0, formData.numberOfChildren - formData.clientChildrenFromPrior)}` : ''}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
              Spouse has children from prior?
            </FormLabel>
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

        {/* Spouse's Existing Trusts */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Spouse&apos;s Existing Trusts
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
              Does your spouse have an existing Living Trust?
            </FormLabel>
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
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
              Does your spouse have an existing Irrevocable Trust?
            </FormLabel>
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
        </Grid>

        {formData.spouseHasLivingTrust && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Spouse Living Trust Name"
                value={formData.spouseLivingTrustName}
                onChange={handleChange('spouseLivingTrustName')}
                variant="outlined"
                placeholder="e.g., The Jane Smith Revocable Living Trust"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </>
        )}

        {formData.spouseHasIrrevocableTrust && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Spouse Irrevocable Trust Name"
                value={formData.spouseIrrevocableTrustName}
                onChange={handleChange('spouseIrrevocableTrustName')}
                variant="outlined"
                placeholder="e.g., The Smith Irrevocable Trust"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </>
        )}
          </>
        )}
      </Grid>
    </Box>
  );
};

export default PersonalDataSection;
