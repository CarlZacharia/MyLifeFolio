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
import { DatePicker } from '@mui/x-date-pickers';
import { useFormContext } from '../lib/FormContext';

const MaritalInfoSection = () => {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  const handleRadioChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value === 'yes' });
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    updateFormData({ [field]: date });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        MARITAL INFORMATION
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Date Married"
            value={formData.dateMarried}
            onChange={handleDateChange('dateMarried')}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Place of Marriage"
            value={formData.placeOfMarriage}
            onChange={handleChange('placeOfMarriage')}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Prior Marriage?</FormLabel>
            <RadioGroup
              row
              value={formData.priorMarriage ? 'yes' : 'no'}
              onChange={handleRadioChange('priorMarriage')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Children from Prior Marriage?</FormLabel>
            <RadioGroup
              row
              value={formData.childrenFromPriorMarriage ? 'yes' : 'no'}
              onChange={handleRadioChange('childrenFromPriorMarriage')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaritalInfoSection;
