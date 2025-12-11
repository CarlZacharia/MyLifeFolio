'use client';

import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import { useFormContext } from '../lib/FormContext';

const FiduciariesSection = () => {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        FIDUCIARIES
      </Typography>

      {/* Executor */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        5. Executor
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Whom do you want to serve as your Executor? List at least two names.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="First Choice"
            value={formData.executorFirst}
            onChange={handleChange('executorFirst')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Alternate"
            value={formData.executorAlternate}
            onChange={handleChange('executorAlternate')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Second Alternate (Optional)"
            value={formData.executorSecondAlternate}
            onChange={handleChange('executorSecondAlternate')}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="First Choice"
            value={formData.spouseExecutorFirst}
            onChange={handleChange('spouseExecutorFirst')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Alternate"
            value={formData.spouseExecutorAlternate}
            onChange={handleChange('spouseExecutorAlternate')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Second Alternate (Optional)"
            value={formData.spouseExecutorSecondAlternate}
            onChange={handleChange('spouseExecutorSecondAlternate')}
            variant="outlined"
          />
        </Grid>
      </Grid>

      {/* Trustee */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        6. Trustee
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Whom do you want to serve as your Trustee for any Trust created under your will?
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="First Choice"
            value={formData.trusteeFirst}
            onChange={handleChange('trusteeFirst')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Alternate"
            value={formData.trusteeAlternate}
            onChange={handleChange('trusteeAlternate')}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="First Choice"
            value={formData.spouseTrusteeFirst}
            onChange={handleChange('spouseTrusteeFirst')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Alternate"
            value={formData.spouseTrusteeAlternate}
            onChange={handleChange('spouseTrusteeAlternate')}
            variant="outlined"
          />
        </Grid>
      </Grid>

      {/* Guardian */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        7. Guardian
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        If you have minor or disabled child/children, whom do you want to act as Guardian?
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="First Choice"
            value={formData.guardianFirst}
            onChange={handleChange('guardianFirst')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Alternate"
            value={formData.guardianAlternate}
            onChange={handleChange('guardianAlternate')}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="First Choice"
            value={formData.spouseGuardianFirst}
            onChange={handleChange('spouseGuardianFirst')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Alternate"
            value={formData.spouseGuardianAlternate}
            onChange={handleChange('spouseGuardianAlternate')}
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FiduciariesSection;
