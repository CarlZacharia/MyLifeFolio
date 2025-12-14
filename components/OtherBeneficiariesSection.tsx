'use client';

import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Button,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';

const RELATIONSHIP_OPTIONS = ['Parent', 'Sibling', 'Other'] as const;

const OtherBeneficiariesSection = () => {
  const { formData, updateFormData } = useFormContext();

  // Other Beneficiaries handlers
  const addBeneficiary = () => {
    const newBeneficiaries = [
      ...formData.otherBeneficiaries,
      { name: '', address: '', relationship: '', relationshipOther: '', amount: '', notes: '' },
    ];
    updateFormData({ otherBeneficiaries: newBeneficiaries });
  };

  const removeBeneficiary = (index: number) => {
    const newBeneficiaries = formData.otherBeneficiaries.filter((_, i) => i !== index);
    updateFormData({ otherBeneficiaries: newBeneficiaries });
  };

  const updateBeneficiary = (index: number, field: string, value: string) => {
    const newBeneficiaries = [...formData.otherBeneficiaries];
    newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
    updateFormData({ otherBeneficiaries: newBeneficiaries });
  };

  // Charities handlers
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        OTHER BENEFICIARIES & CHARITIES
      </Typography>

      {/* Other Beneficiaries */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Other Beneficiaries
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addBeneficiary}>
            Add Beneficiary
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include cousins, friends, or any other individuals you wish to name as beneficiaries.
        </Typography>

        {formData.otherBeneficiaries.map((beneficiary, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Beneficiary #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeBeneficiary(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Name"
                  value={beneficiary.name}
                  onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Relationship</InputLabel>
                  <Select
                    value={beneficiary.relationship}
                    label="Relationship"
                    onChange={(e) => {
                      updateBeneficiary(index, 'relationship', e.target.value);
                      // Clear relationshipOther if not "Other"
                      if (e.target.value !== 'Other') {
                        updateBeneficiary(index, 'relationshipOther', '');
                      }
                    }}
                  >
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Amount/Percentage"
                  value={beneficiary.amount}
                  onChange={(e) => updateBeneficiary(index, 'amount', e.target.value)}
                  variant="outlined"
                  size="small"
                  helperText="e.g., $10,000 or 10%"
                />
              </Grid>
              {beneficiary.relationship === 'Other' && (
                <Grid item xs={12} md={4} sx={{ marginLeft: { md: '33.33%' } }}>
                  <TextField
                    fullWidth
                    label="Describe Relationship"
                    value={beneficiary.relationshipOther}
                    onChange={(e) => updateBeneficiary(index, 'relationshipOther', e.target.value)}
                    variant="outlined"
                    size="small"
                    helperText="e.g., cousin, friend, neighbor"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={beneficiary.address}
                  onChange={(e) => updateBeneficiary(index, 'address', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={beneficiary.notes}
                  onChange={(e) => updateBeneficiary(index, 'notes', e.target.value)}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Any additional comments or notes about this beneficiary"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Charities */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Charities
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addCharity}>
            Add Charity
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include any charitable organizations you wish to name as beneficiaries.
        </Typography>

        {formData.charities.map((charity, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Charity #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeCharity(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Charity Name"
                  value={charity.name}
                  onChange={(e) => updateCharity(index, 'name', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount/Percentage"
                  value={charity.amount}
                  onChange={(e) => updateCharity(index, 'amount', e.target.value)}
                  variant="outlined"
                  size="small"
                  helperText="e.g., $10,000 or 10%"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={charity.address}
                  onChange={(e) => updateCharity(index, 'address', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default OtherBeneficiariesSection;
