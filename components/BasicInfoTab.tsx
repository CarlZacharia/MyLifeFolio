'use client';

import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';

const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown',
] as const;

const folioTextFieldSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: folioColors.accentWarm },
    '&.Mui-focused fieldset': { borderColor: folioColors.accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: folioColors.accent },
};

const BasicInfoTab = () => {
  const { formData, updateFormData } = useFormContext();
  const vitals = formData.basicVitals;

  const handleChange = (field: string, value: string) => {
    updateFormData({
      basicVitals: { ...vitals, [field]: value },
    });
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <FavoriteIcon sx={{ color: folioColors.accent, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Blood Type & Basic Vitals
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Reference information only — not a medical log. Approximate values are fine.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            select
            label="Blood Type"
            value={vitals.bloodType}
            onChange={(e) => handleChange('bloodType', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={folioTextFieldSx}
          >
            <MenuItem value=""><em>Select blood type</em></MenuItem>
            {BLOOD_TYPES.map((bt) => (
              <MenuItem key={bt} value={bt}>{bt}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Height"
              value={vitals.height}
              onChange={(e) => handleChange('height', e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder={'e.g. 5\'11"'}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Weight"
              value={vitals.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. 185 lbs"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>

          <TextField
            label="As of Date"
            value={vitals.asOfDate}
            onChange={(e) => handleChange('asOfDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            type="date"
            helperText="When this info was last verified"
            sx={folioTextFieldSx}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default BasicInfoTab;
