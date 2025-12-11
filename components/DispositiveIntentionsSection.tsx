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
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';

const DispositiveIntentionsSection = () => {
  const { formData, updateFormData } = useFormContext();

  const handleRadioChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value === 'yes' });
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  const addCharity = () => {
    const newCharities = [
      ...formData.charities,
      { name: '', address: '', amount: '' },
    ];
    updateFormData({ charities: newCharities });
  };

  const removeCharity = (index: number) => {
    const newCharities = formData.charities.filter((_, i) => i !== index);
    updateFormData({ charities: newCharities });
  };

  const updateCharity = (index: number, field: string, value: string) => {
    const newCharities = [...formData.charities];
    newCharities[index] = { ...newCharities[index], [field]: value };
    updateFormData({ charities: newCharities });
  };

  const addOtherBeneficiary = () => {
    const newBeneficiaries = [
      ...formData.otherBeneficiaries,
      { name: '', address: '', relationship: '', amount: '' },
    ];
    updateFormData({ otherBeneficiaries: newBeneficiaries });
  };

  const removeOtherBeneficiary = (index: number) => {
    const newBeneficiaries = formData.otherBeneficiaries.filter((_, i) => i !== index);
    updateFormData({ otherBeneficiaries: newBeneficiaries });
  };

  const updateOtherBeneficiary = (index: number, field: string, value: string) => {
    const newBeneficiaries = [...formData.otherBeneficiaries];
    newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
    updateFormData({ otherBeneficiaries: newBeneficiaries });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        DISPOSITIVE INTENTIONS
      </Typography>

      {/* Spouse and Children */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        1. Spouse and Children
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
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
            label="After your spouse's death, at what age do you want to distribute to your children?"
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

      {/* Grandchildren */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        2. Grandchildren
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Do you want to leave a specific amount of money or a percentage of your estate to your grandchildren?
            </FormLabel>
            <RadioGroup
              row
              value={formData.leaveToGrandchildren ? 'yes' : 'no'}
              onChange={handleRadioChange('leaveToGrandchildren')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.leaveToGrandchildren && (
          <>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Do you wish to treat all of your grandchildren equally?
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.treatAllGrandchildrenEqually ? 'yes' : 'no'}
                  onChange={handleRadioChange('treatAllGrandchildrenEqually')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {!formData.treatAllGrandchildrenEqually && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="If not, why not?"
                  value={formData.grandchildrenEqualityExplanation}
                  onChange={handleChange('grandchildrenEqualityExplanation')}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="What specific dollar amount/percentage do you want to leave your Grandchildren?"
                value={formData.grandchildrenAmount}
                onChange={handleChange('grandchildrenAmount')}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="At what age do you want distribution to your Grandchildren?"
                value={formData.grandchildrenDistributionAge}
                onChange={handleChange('grandchildrenDistributionAge')}
                variant="outlined"
                helperText="e.g., 1/3 at age 25, 1/3 at age 30 and 1/3 at age 35"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Charities */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        3. Charities
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Do you want to leave a specific amount of money or other assets to any charity?
            </FormLabel>
            <RadioGroup
              row
              value={formData.leaveToCharity ? 'yes' : 'no'}
              onChange={handleRadioChange('leaveToCharity')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.leaveToCharity && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Charities</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addCharity}
                size="small"
              >
                Add Charity
              </Button>
            </Box>

            {formData.charities.map((charity, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2">Charity #{index + 1}</Typography>
                  <IconButton size="small" onClick={() => removeCharity(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Name of Charity"
                      value={charity.name}
                      onChange={(e) => updateCharity(index, 'name', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Address (including zip code)"
                      value={charity.address}
                      onChange={(e) => updateCharity(index, 'address', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Dollar Amount"
                      value={charity.amount}
                      onChange={(e) => updateCharity(index, 'amount', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>
        )}
      </Grid>

      {/* Other Beneficiaries */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        4. Other Beneficiaries
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1">
              Do you want your Will to benefit anyone other than children, grandchildren or a charity?
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addOtherBeneficiary}
              size="small"
            >
              Add Beneficiary
            </Button>
          </Box>

          {formData.otherBeneficiaries.map((beneficiary, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">Beneficiary #{index + 1}</Typography>
                <IconButton size="small" onClick={() => removeOtherBeneficiary(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={beneficiary.name}
                    onChange={(e) => updateOtherBeneficiary(index, 'name', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Address (including zip code)"
                    value={beneficiary.address}
                    onChange={(e) => updateOtherBeneficiary(index, 'address', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={beneficiary.relationship}
                    onChange={(e) => updateOtherBeneficiary(index, 'relationship', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Dollar Amount"
                    value={beneficiary.amount}
                    onChange={(e) => updateOtherBeneficiary(index, 'amount', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DispositiveIntentionsSection;
