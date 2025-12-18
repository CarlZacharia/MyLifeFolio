'use client';

import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useFormContext, MaritalStatus } from '../lib/FormContext';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const DispositiveIntentionsSection = () => {
  const { formData, updateFormData } = useFormContext();

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const handleRadioChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value === 'yes' });
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        DISPOSITIVE INTENTIONS
      </Typography>

      {/* 1. Children (or Spouse and Children) */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        1. {showSpouseInfo ? 'Spouse and Children' : 'Children'}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {showSpouseInfo && (
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                Do you wish to provide primarily for your spouse and secondarily for your children?
              </FormLabel>
              <RadioGroup
                row
                value={formData.provideForSpouseThenChildren ? 'yes' : 'no'}
                onChange={handleRadioChange('provideForSpouseThenChildren')}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Do you wish to treat all of your children equally?
            </FormLabel>
            <RadioGroup
              row
              value={formData.treatAllChildrenEqually ? 'yes' : 'no'}
              onChange={handleRadioChange('treatAllChildrenEqually')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {!formData.treatAllChildrenEqually && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="If not, why not?"
              value={formData.childrenEqualityExplanation}
              onChange={handleChange('childrenEqualityExplanation')}
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={showSpouseInfo
              ? "After your spouse's death, at what age do you want to distribute to your children?"
              : "At what age do you want to distribute to your children?"}
            value={formData.distributionAge}
            onChange={handleChange('distributionAge')}
            variant="outlined"
            helperText="e.g., 1/3 at age 25, 1/3 at age 30 and 1/3 at age 35 or immediate"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              If one of your children should predecease you, would you want the share of your deceased child(ren) to pass to their surviving children?
            </FormLabel>
            <RadioGroup
              row
              value={formData.childrenPredeceasedBeneficiaries ? 'yes' : 'no'}
              onChange={handleRadioChange('childrenPredeceasedBeneficiaries')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      {/* 2. Specific Devises */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        2. Specific Devises
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Do you wish to make any specific devise of real property?
            </FormLabel>
            <RadioGroup
              row
              value={formData.hasSpecificDevises ? 'yes' : 'no'}
              onChange={handleRadioChange('hasSpecificDevises')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.hasSpecificDevises && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.specificDevisesDescription}
              onChange={handleChange('specificDevisesDescription')}
              variant="outlined"
              multiline
              rows={3}
              placeholder="Describe the specific devises of real property"
            />
          </Grid>
        )}
      </Grid>

      {/* 3. General Bequests */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        3. General Bequests
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Do you wish to make any general bequests of cash to any person?
            </FormLabel>
            <RadioGroup
              row
              value={formData.hasGeneralBequests ? 'yes' : 'no'}
              onChange={handleRadioChange('hasGeneralBequests')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.hasGeneralBequests && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.generalBequestsDescription}
              onChange={handleChange('generalBequestsDescription')}
              variant="outlined"
              multiline
              rows={3}
              placeholder="Describe the general bequests of cash"
            />
          </Grid>
        )}
      </Grid>

      {/* 4. Comments */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        4. Comments
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.dispositiveIntentionsComments}
            onChange={handleChange('dispositiveIntentionsComments')}
            variant="outlined"
            multiline
            rows={4}
            placeholder="Any additional comments regarding dispositive intentions"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DispositiveIntentionsSection;
