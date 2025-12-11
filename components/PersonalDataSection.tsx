'use client';

import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormContext } from '../lib/FormContext';

const PersonalDataSection = () => {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    updateFormData({ [field]: date });
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

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Cell Phone"
            value={formData.cellPhone}
            onChange={handleChange('cellPhone')}
            variant="outlined"
            type="tel"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Home Phone"
            value={formData.homePhone}
            onChange={handleChange('homePhone')}
            variant="outlined"
            type="tel"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Work Phone"
            value={formData.workPhone}
            onChange={handleChange('workPhone')}
            variant="outlined"
            type="tel"
          />
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

        <Grid item xs={12} md={6}>
          <DatePicker
            label="Birth Date"
            value={formData.birthDate}
            onChange={handleDateChange('birthDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
                required: true,
              },
            }}
          />
        </Grid>

        {/* Spouse Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 500 }}>
            Spouse Information
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

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Spouse Cell Phone"
            value={formData.spouseCellPhone}
            onChange={handleChange('spouseCellPhone')}
            variant="outlined"
            type="tel"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Spouse Home Phone"
            value={formData.spouseHomePhone}
            onChange={handleChange('spouseHomePhone')}
            variant="outlined"
            type="tel"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Spouse Work Phone"
            value={formData.spouseWorkPhone}
            onChange={handleChange('spouseWorkPhone')}
            variant="outlined"
            type="tel"
          />
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

        <Grid item xs={12} md={6}>
          <DatePicker
            label="Spouse Birth Date"
            value={formData.spouseBirthDate}
            onChange={handleDateChange('spouseBirthDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalDataSection;
