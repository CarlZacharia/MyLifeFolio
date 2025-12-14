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
import { useFormContext, RealEstateOwner, OwnershipForm } from '../lib/FormContext';

const OWNER_OPTIONS: RealEstateOwner[] = [
  'Client',
  'Spouse',
  'Client and Spouse',
  'Client and Other',
  'Spouse and Other',
  'Client, Spouse and Other',
];

const getOwnershipFormOptions = (owner: RealEstateOwner): OwnershipForm[] => {
  const baseOptions: OwnershipForm[] = ['Life Estate', 'Lady Bird Deed', 'Trust', 'Other'];

  switch (owner) {
    case 'Client':
    case 'Spouse':
      return ['Sole', ...baseOptions];
    case 'Client and Spouse':
      return ['Tenants by Entirety', 'JTWROS', 'Tenants in Common', ...baseOptions];
    case 'Client and Other':
    case 'Spouse and Other':
    case 'Client, Spouse and Other':
      return ['JTWROS', 'Tenants in Common', ...baseOptions];
    default:
      return baseOptions;
  }
};

const AssetsSection = () => {
  const { formData, updateFormData } = useFormContext();

  // Real Estate handlers
  const addRealEstate = () => {
    const newRealEstate = [
      ...formData.realEstate,
      { owner: '' as RealEstateOwner, ownershipForm: '' as OwnershipForm, street: '', city: '', state: '', zip: '', value: '', mortgageBalance: '', costBasis: '' },
    ];
    updateFormData({ realEstate: newRealEstate });
  };

  const removeRealEstate = (index: number) => {
    const newRealEstate = formData.realEstate.filter((_, i) => i !== index);
    updateFormData({ realEstate: newRealEstate });
  };

  const updateRealEstate = (index: number, field: string, value: string, additionalUpdates?: Record<string, string>) => {
    const newRealEstate = [...formData.realEstate];
    newRealEstate[index] = { ...newRealEstate[index], [field]: value, ...additionalUpdates };
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

  // Non-Qualified Investment Accounts handlers
  const addNonQualifiedInvestment = () => {
    const newInvestments = [
      ...formData.nonQualifiedInvestments,
      { owner: '', institution: '', description: '', value: '' },
    ];
    updateFormData({ nonQualifiedInvestments: newInvestments });
  };

  const removeNonQualifiedInvestment = (index: number) => {
    const newInvestments = formData.nonQualifiedInvestments.filter((_, i) => i !== index);
    updateFormData({ nonQualifiedInvestments: newInvestments });
  };

  const updateNonQualifiedInvestment = (index: number, field: string, value: string) => {
    const newInvestments = [...formData.nonQualifiedInvestments];
    newInvestments[index] = { ...newInvestments[index], [field]: value };
    updateFormData({ nonQualifiedInvestments: newInvestments });
  };

  // IRAs and Retirement Accounts handlers
  const addRetirementAccount = () => {
    const newAccounts = [
      ...formData.retirementAccounts,
      { owner: '', institution: '', accountType: '', beneficiary: '', value: '' },
    ];
    updateFormData({ retirementAccounts: newAccounts });
  };

  const removeRetirementAccount = (index: number) => {
    const newAccounts = formData.retirementAccounts.filter((_, i) => i !== index);
    updateFormData({ retirementAccounts: newAccounts });
  };

  const updateRetirementAccount = (index: number, field: string, value: string) => {
    const newAccounts = [...formData.retirementAccounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    updateFormData({ retirementAccounts: newAccounts });
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

  // Vehicles handlers
  const addVehicle = () => {
    const newVehicles = [
      ...formData.vehicles,
      { owner: '', yearMakeModel: '', value: '' },
    ];
    updateFormData({ vehicles: newVehicles });
  };

  const removeVehicle = (index: number) => {
    const newVehicles = formData.vehicles.filter((_, i) => i !== index);
    updateFormData({ vehicles: newVehicles });
  };

  const updateVehicle = (index: number, field: string, value: string) => {
    const newVehicles = [...formData.vehicles];
    newVehicles[index] = { ...newVehicles[index], [field]: value };
    updateFormData({ vehicles: newVehicles });
  };

  // Other Assets handlers
  const addOtherAsset = () => {
    const newAssets = [
      ...formData.otherAssets,
      { owner: '', description: '', value: '' },
    ];
    updateFormData({ otherAssets: newAssets });
  };

  const removeOtherAsset = (index: number) => {
    const newAssets = formData.otherAssets.filter((_, i) => i !== index);
    updateFormData({ otherAssets: newAssets });
  };

  const updateOtherAsset = (index: number, field: string, value: string) => {
    const newAssets = [...formData.otherAssets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    updateFormData({ otherAssets: newAssets });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        ASSETS
      </Typography>

      {/* 1. Real Estate */}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={property.owner}
                    label="Owner"
                    onChange={(e) => {
                      updateRealEstate(index, 'owner', e.target.value, { ownershipForm: '' });
                    }}
                  >
                    {OWNER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" disabled={!property.owner}>
                  <InputLabel>Ownership Form</InputLabel>
                  <Select
                    value={property.ownershipForm}
                    label="Ownership Form"
                    onChange={(e) => updateRealEstate(index, 'ownershipForm', e.target.value)}
                  >
                    {getOwnershipFormOptions(property.owner).map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
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

      {/* 2. Bank Accounts */}
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

      {/* 3. Non-Qualified Investment Accounts */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            3. Non-Qualified Investment Accounts
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addNonQualifiedInvestment}>
            Add Account
          </Button>
        </Box>

        {formData.nonQualifiedInvestments.map((investment, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Account #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeNonQualifiedInvestment(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={investment.owner}
                  onChange={(e) => updateNonQualifiedInvestment(index, 'owner', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={investment.institution}
                  onChange={(e) => updateNonQualifiedInvestment(index, 'institution', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Description"
                  value={investment.description}
                  onChange={(e) => updateNonQualifiedInvestment(index, 'description', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Brokerage, Stocks, Bonds, Mutual Funds"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Value"
                  value={investment.value}
                  onChange={(e) => updateNonQualifiedInvestment(index, 'value', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* 4. IRAs and Retirement Accounts */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            4. IRAs and Retirement Accounts
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addRetirementAccount}>
            Add Account
          </Button>
        </Box>

        {formData.retirementAccounts.map((account, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Account #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeRetirementAccount(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={account.owner}
                  onChange={(e) => updateRetirementAccount(index, 'owner', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={account.institution}
                  onChange={(e) => updateRetirementAccount(index, 'institution', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Account Type"
                  value={account.accountType}
                  onChange={(e) => updateRetirementAccount(index, 'accountType', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., IRA, 401k, Pension"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Beneficiary"
                  value={account.beneficiary}
                  onChange={(e) => updateRetirementAccount(index, 'beneficiary', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Value"
                  value={account.value}
                  onChange={(e) => updateRetirementAccount(index, 'value', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* 5. Life Insurance */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            5. Life Insurance
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

      {/* 6. Vehicles */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            6. Vehicles
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addVehicle}>
            Add Vehicle
          </Button>
        </Box>

        {formData.vehicles.map((vehicle, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Vehicle #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeVehicle(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={vehicle.owner}
                  onChange={(e) => updateVehicle(index, 'owner', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year, Make, Model"
                  value={vehicle.yearMakeModel}
                  onChange={(e) => updateVehicle(index, 'yearMakeModel', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 2020 Toyota Camry"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Value"
                  value={vehicle.value}
                  onChange={(e) => updateVehicle(index, 'value', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* 7. Other Assets */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            7. Other Assets
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addOtherAsset}>
            Add Asset
          </Button>
        </Box>

        {formData.otherAssets.map((asset, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Asset #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeOtherAsset(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={asset.owner}
                  onChange={(e) => updateOtherAsset(index, 'owner', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={asset.description}
                  onChange={(e) => updateOtherAsset(index, 'description', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Business interest, collectibles, jewelry"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Value"
                  value={asset.value}
                  onChange={(e) => updateOtherAsset(index, 'value', e.target.value)}
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
