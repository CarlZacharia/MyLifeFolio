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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';

const AssetsSection = () => {
  const { formData, updateFormData } = useFormContext();

  // Real Estate handlers
  const addRealEstate = () => {
    const newRealEstate = [
      ...formData.realEstate,
      { owner: '', street: '', city: '', state: '', zip: '', value: '', mortgageBalance: '', costBasis: '' },
    ];
    updateFormData({ realEstate: newRealEstate });
  };

  const removeRealEstate = (index: number) => {
    const newRealEstate = formData.realEstate.filter((_, i) => i !== index);
    updateFormData({ realEstate: newRealEstate });
  };

  const updateRealEstate = (index: number, field: string, value: string) => {
    const newRealEstate = [...formData.realEstate];
    newRealEstate[index] = { ...newRealEstate[index], [field]: value };
    updateFormData({ realEstate: newRealEstate });
  };

  // Bank Accounts handlers
  const addBankAccount = () => {
    const newBankAccounts = [...formData.bankAccounts, { owner: '', institution: '', amount: '' }];
    updateFormData({ bankAccounts: newBankAccounts });
  };

  const removeBankAccount = (index: number) => {
    const newBankAccounts = formData.bankAccounts.filter((_, i) => i !== index);
    updateFormData({ bankAccounts: newBankAccounts });
  };

  const updateBankAccount = (index: number, field: string, value: string) => {
    const newBankAccounts = [...formData.bankAccounts];
    newBankAccounts[index] = { ...newBankAccounts[index], [field]: value };
    updateFormData({ bankAccounts: newBankAccounts });
  };

  // Life Insurance handlers
  const addLifeInsurance = () => {
    const newLifeInsurance = [
      ...formData.lifeInsurance,
      { owner: '', company: '', faceAmount: '', cashValue: '', insured: '', beneficiary: '' },
    ];
    updateFormData({ lifeInsurance: newLifeInsurance });
  };

  const removeLifeInsurance = (index: number) => {
    const newLifeInsurance = formData.lifeInsurance.filter((_, i) => i !== index);
    updateFormData({ lifeInsurance: newLifeInsurance });
  };

  const updateLifeInsurance = (index: number, field: string, value: string) => {
    const newLifeInsurance = [...formData.lifeInsurance];
    newLifeInsurance[index] = { ...newLifeInsurance[index], [field]: value };
    updateFormData({ lifeInsurance: newLifeInsurance });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        ASSETS
      </Typography>

      {/* Real Estate */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            1. Real Estate
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addRealEstate}>
            Add Property
          </Button>
        </Box>

        {formData.realEstate.map((property, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Property #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeRealEstate(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={property.owner}
                  onChange={(e) => updateRealEstate(index, 'owner', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={property.street}
                  onChange={(e) => updateRealEstate(index, 'street', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="City"
                  value={property.city}
                  onChange={(e) => updateRealEstate(index, 'city', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={property.state}
                  onChange={(e) => updateRealEstate(index, 'state', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  value={property.zip}
                  onChange={(e) => updateRealEstate(index, 'zip', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Estimated Value"
                  value={property.value}
                  onChange={(e) => updateRealEstate(index, 'value', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mortgage Balance"
                  value={property.mortgageBalance}
                  onChange={(e) => updateRealEstate(index, 'mortgageBalance', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cost Basis"
                  value={property.costBasis}
                  onChange={(e) => updateRealEstate(index, 'costBasis', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Bank Accounts */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            2. Cash, Bank Accounts and Certificates of Deposit
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addBankAccount}>
            Add Account
          </Button>
        </Box>

        {formData.bankAccounts.map((account, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Account #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeBankAccount(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={account.owner}
                  onChange={(e) => updateBankAccount(index, 'owner', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Name of Financial Institution"
                  value={account.institution}
                  onChange={(e) => updateBankAccount(index, 'institution', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={account.amount}
                  onChange={(e) => updateBankAccount(index, 'amount', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Life Insurance */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            4. Life Insurance
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addLifeInsurance}>
            Add Policy
          </Button>
        </Box>

        {formData.lifeInsurance.map((policy, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Policy #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeLifeInsurance(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={policy.owner}
                  onChange={(e) => updateLifeInsurance(index, 'owner', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Company"
                  value={policy.company}
                  onChange={(e) => updateLifeInsurance(index, 'company', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Face Amount"
                  value={policy.faceAmount}
                  onChange={(e) => updateLifeInsurance(index, 'faceAmount', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Cash Value"
                  value={policy.cashValue}
                  onChange={(e) => updateLifeInsurance(index, 'cashValue', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insured"
                  value={policy.insured}
                  onChange={(e) => updateLifeInsurance(index, 'insured', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Beneficiary"
                  value={policy.beneficiary}
                  onChange={(e) => updateLifeInsurance(index, 'beneficiary', e.target.value)}
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

export default AssetsSection;
