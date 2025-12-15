'use client';

import React, { useMemo } from 'react';
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
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Autocomplete,
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

const OWNERS_WITH_OTHER: RealEstateOwner[] = [
  'Client and Other',
  'Spouse and Other',
  'Client, Spouse and Other',
];

const INDIVIDUAL_OWNER_OPTIONS = ['Client', 'Spouse'] as const;

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

interface BeneficiaryOption {
  value: string;
  label: string;
}

interface BeneficiarySelectorProps {
  label: string;
  selectedBeneficiaries: string[];
  options: BeneficiaryOption[];
  onChange: (selected: string[]) => void;
}

const BeneficiarySelector: React.FC<BeneficiarySelectorProps> = ({
  label,
  selectedBeneficiaries,
  options,
  onChange,
}) => {
  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      getOptionLabel={(option) => option.label}
      value={options.filter((opt) => selectedBeneficiaries.includes(opt.value))}
      onChange={(_, newValue) => {
        onChange(newValue.map((v) => v.value));
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
  );
};

interface JointOwnerSelectorProps {
  jointOwnerType: 'beneficiary' | 'other' | '';
  jointOwnerBeneficiaries: string[];
  jointOwnerOther: string;
  beneficiaryOptions: BeneficiaryOption[];
  onChange: (updates: {
    jointOwnerType?: 'beneficiary' | 'other' | '';
    jointOwnerBeneficiaries?: string[];
    jointOwnerOther?: string;
  }) => void;
}

const JointOwnerSelector: React.FC<JointOwnerSelectorProps> = ({
  jointOwnerType,
  jointOwnerBeneficiaries,
  jointOwnerOther,
  beneficiaryOptions,
  onChange,
}) => {
  const handleBeneficiaryTypeChange = (checked: boolean) => {
    if (checked) {
      onChange({ jointOwnerType: 'beneficiary', jointOwnerOther: '' });
    } else if (jointOwnerType === 'beneficiary') {
      onChange({ jointOwnerType: '', jointOwnerBeneficiaries: [] });
    }
  };

  const handleOtherTypeChange = (checked: boolean) => {
    if (checked) {
      onChange({ jointOwnerType: 'other', jointOwnerBeneficiaries: [] });
    } else if (jointOwnerType === 'other') {
      onChange({ jointOwnerType: '', jointOwnerOther: '' });
    }
  };

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
        Who is the &quot;Other&quot; owner?
      </FormLabel>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={jointOwnerType === 'beneficiary'}
              onChange={(e) => handleBeneficiaryTypeChange(e.target.checked)}
            />
          }
          label="Current Beneficiaries"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={jointOwnerType === 'other'}
              onChange={(e) => handleOtherTypeChange(e.target.checked)}
            />
          }
          label="Non-Beneficiary"
        />
      </FormGroup>

      {jointOwnerType === 'beneficiary' && (
        <Box sx={{ mt: 2 }}>
          <FormGroup>
            {beneficiaryOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={jointOwnerBeneficiaries.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange({ jointOwnerBeneficiaries: [...jointOwnerBeneficiaries, option.value] });
                      } else {
                        onChange({
                          jointOwnerBeneficiaries: jointOwnerBeneficiaries.filter((b) => b !== option.value)
                        });
                      }
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      {jointOwnerType === 'other' && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Name of Other Owner(s)"
            value={jointOwnerOther}
            onChange={(e) => onChange({ jointOwnerOther: e.target.value })}
            variant="outlined"
            placeholder="Enter name(s) of other owner(s)"
          />
        </Box>
      )}
    </Box>
  );
};

const AssetsSection = () => {
  const { formData, updateFormData } = useFormContext();

  // Build beneficiary options from all sources
  const beneficiaryOptions = useMemo((): BeneficiaryOption[] => {
    const options: BeneficiaryOption[] = [];

    // Add spouse if available
    if (formData.spouseName) {
      options.push({ value: `spouse:${formData.spouseName}`, label: `${formData.spouseName} (Spouse)` });
    }

    // Add client if available
    if (formData.name) {
      options.push({ value: `client:${formData.name}`, label: `${formData.name} (Client)` });
    }

    // Add all children
    formData.children.forEach((child, index) => {
      if (child.name) {
        options.push({ value: `child:${index}:${child.name}`, label: `${child.name} (Child)` });
      }
    });

    // Add all grandchildren
    formData.grandchildren.forEach((grandchild, index) => {
      if (grandchild.name) {
        options.push({ value: `grandchild:${index}:${grandchild.name}`, label: `${grandchild.name} (Grandchild)` });
      }
    });

    // Add other beneficiaries
    formData.otherBeneficiaries.forEach((beneficiary, index) => {
      if (beneficiary.name) {
        options.push({ value: `beneficiary:${index}:${beneficiary.name}`, label: `${beneficiary.name} (Other)` });
      }
    });

    return options;
  }, [formData.spouseName, formData.name, formData.children, formData.grandchildren, formData.otherBeneficiaries]);

  // Real Estate handlers
  const addRealEstate = () => {
    const newRealEstate = [
      ...formData.realEstate,
      {
        owner: '' as RealEstateOwner,
        ownershipForm: '' as OwnershipForm,
        jointOwnerType: '' as const,
        jointOwnerBeneficiaries: [],
        jointOwnerOther: '',
        hasBeneficiaries: false,
        street: '',
        city: '',
        state: '',
        zip: '',
        value: '',
        mortgageBalance: '',
        costBasis: '',
        primaryBeneficiaries: [],
        secondaryBeneficiaries: [],
      },
    ];
    updateFormData({ realEstate: newRealEstate });
  };

  const removeRealEstate = (index: number) => {
    const newRealEstate = formData.realEstate.filter((_, i) => i !== index);
    updateFormData({ realEstate: newRealEstate });
  };

  const updateRealEstate = (index: number, updates: Record<string, unknown>) => {
    const newRealEstate = [...formData.realEstate];
    newRealEstate[index] = { ...newRealEstate[index], ...updates };
    updateFormData({ realEstate: newRealEstate });
  };

  // Bank Accounts handlers
  const addBankAccount = () => {
    const newBankAccounts = [
      ...formData.bankAccounts,
      { owner: '', institution: '', amount: '', hasBeneficiaries: false, primaryBeneficiaries: [], secondaryBeneficiaries: [] },
    ];
    updateFormData({ bankAccounts: newBankAccounts });
  };

  const removeBankAccount = (index: number) => {
    const newBankAccounts = formData.bankAccounts.filter((_, i) => i !== index);
    updateFormData({ bankAccounts: newBankAccounts });
  };

  const updateBankAccount = (index: number, updates: Record<string, unknown>) => {
    const newBankAccounts = [...formData.bankAccounts];
    newBankAccounts[index] = { ...newBankAccounts[index], ...updates };
    updateFormData({ bankAccounts: newBankAccounts });
  };

  // Non-Qualified Investment Accounts handlers
  const addNonQualifiedInvestment = () => {
    const newInvestments = [
      ...formData.nonQualifiedInvestments,
      { owner: '', institution: '', description: '', value: '', hasBeneficiaries: false, primaryBeneficiaries: [], secondaryBeneficiaries: [] },
    ];
    updateFormData({ nonQualifiedInvestments: newInvestments });
  };

  const removeNonQualifiedInvestment = (index: number) => {
    const newInvestments = formData.nonQualifiedInvestments.filter((_, i) => i !== index);
    updateFormData({ nonQualifiedInvestments: newInvestments });
  };

  const updateNonQualifiedInvestment = (index: number, updates: Record<string, unknown>) => {
    const newInvestments = [...formData.nonQualifiedInvestments];
    newInvestments[index] = { ...newInvestments[index], ...updates };
    updateFormData({ nonQualifiedInvestments: newInvestments });
  };

  // IRAs and Retirement Accounts handlers
  const addRetirementAccount = () => {
    const newAccounts = [
      ...formData.retirementAccounts,
      { owner: '', institution: '', accountType: '', value: '', hasBeneficiaries: false, primaryBeneficiaries: [], secondaryBeneficiaries: [] },
    ];
    updateFormData({ retirementAccounts: newAccounts });
  };

  const removeRetirementAccount = (index: number) => {
    const newAccounts = formData.retirementAccounts.filter((_, i) => i !== index);
    updateFormData({ retirementAccounts: newAccounts });
  };

  const updateRetirementAccount = (index: number, updates: Record<string, unknown>) => {
    const newAccounts = [...formData.retirementAccounts];
    newAccounts[index] = { ...newAccounts[index], ...updates };
    updateFormData({ retirementAccounts: newAccounts });
  };

  // Life Insurance handlers
  const addLifeInsurance = () => {
    const newLifeInsurance = [
      ...formData.lifeInsurance,
      { owner: '', company: '', faceAmount: '', cashValue: '', insured: '', hasBeneficiaries: false, primaryBeneficiaries: [], secondaryBeneficiaries: [] },
    ];
    updateFormData({ lifeInsurance: newLifeInsurance });
  };

  const removeLifeInsurance = (index: number) => {
    const newLifeInsurance = formData.lifeInsurance.filter((_, i) => i !== index);
    updateFormData({ lifeInsurance: newLifeInsurance });
  };

  const updateLifeInsurance = (index: number, updates: Record<string, unknown>) => {
    const newLifeInsurance = [...formData.lifeInsurance];
    newLifeInsurance[index] = { ...newLifeInsurance[index], ...updates };
    updateFormData({ lifeInsurance: newLifeInsurance });
  };

  // Vehicles handlers
  const addVehicle = () => {
    const newVehicles = [
      ...formData.vehicles,
      { owner: '', yearMakeModel: '', value: '', hasBeneficiaries: false, primaryBeneficiaries: [], secondaryBeneficiaries: [] },
    ];
    updateFormData({ vehicles: newVehicles });
  };

  const removeVehicle = (index: number) => {
    const newVehicles = formData.vehicles.filter((_, i) => i !== index);
    updateFormData({ vehicles: newVehicles });
  };

  const updateVehicle = (index: number, updates: Record<string, unknown>) => {
    const newVehicles = [...formData.vehicles];
    newVehicles[index] = { ...newVehicles[index], ...updates };
    updateFormData({ vehicles: newVehicles });
  };

  // Other Assets handlers
  const addOtherAsset = () => {
    const newAssets = [
      ...formData.otherAssets,
      { owner: '', description: '', value: '', hasBeneficiaries: false, primaryBeneficiaries: [], secondaryBeneficiaries: [] },
    ];
    updateFormData({ otherAssets: newAssets });
  };

  const removeOtherAsset = (index: number) => {
    const newAssets = formData.otherAssets.filter((_, i) => i !== index);
    updateFormData({ otherAssets: newAssets });
  };

  const updateOtherAsset = (index: number, updates: Record<string, unknown>) => {
    const newAssets = [...formData.otherAssets];
    newAssets[index] = { ...newAssets[index], ...updates };
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
                      const newOwner = e.target.value as RealEstateOwner;
                      const updates: Record<string, unknown> = {
                        owner: newOwner,
                        ownershipForm: '',
                      };
                      // Reset joint owner fields if not an "Other" type
                      if (!OWNERS_WITH_OTHER.includes(newOwner)) {
                        updates.jointOwnerType = '';
                        updates.jointOwnerBeneficiaries = [];
                        updates.jointOwnerOther = '';
                      }
                      updateRealEstate(index, updates);
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
                    onChange={(e) => updateRealEstate(index, { ownershipForm: e.target.value })}
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={property.hasBeneficiaries || false}
                      onChange={(e) => updateRealEstate(index, { hasBeneficiaries: e.target.checked })}
                    />
                  }
                  label="Has Beneficiaries?"
                />
              </Grid>

              {/* Joint Owner Selection - shows when owner includes "Other" */}
              {OWNERS_WITH_OTHER.includes(property.owner) && (
                <Grid item xs={12}>
                  <JointOwnerSelector
                    jointOwnerType={property.jointOwnerType}
                    jointOwnerBeneficiaries={property.jointOwnerBeneficiaries}
                    jointOwnerOther={property.jointOwnerOther}
                    beneficiaryOptions={beneficiaryOptions}
                    onChange={(updates) => updateRealEstate(index, updates)}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={property.street}
                  onChange={(e) => updateRealEstate(index, { street: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="City"
                  value={property.city}
                  onChange={(e) => updateRealEstate(index, { city: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={property.state}
                  onChange={(e) => updateRealEstate(index, { state: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  value={property.zip}
                  onChange={(e) => updateRealEstate(index, { zip: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Estimated Value"
                  value={property.value}
                  onChange={(e) => updateRealEstate(index, { value: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mortgage Balance"
                  value={property.mortgageBalance}
                  onChange={(e) => updateRealEstate(index, { mortgageBalance: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cost Basis"
                  value={property.costBasis}
                  onChange={(e) => updateRealEstate(index, { costBasis: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              {property.hasBeneficiaries && (
                <>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Primary Beneficiaries"
                      selectedBeneficiaries={property.primaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateRealEstate(index, { primaryBeneficiaries: selected })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Secondary Beneficiaries"
                      selectedBeneficiaries={property.secondaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateRealEstate(index, { secondaryBeneficiaries: selected })}
                    />
                  </Grid>
                </>
              )}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={account.owner}
                    label="Owner"
                    onChange={(e) => updateBankAccount(index, { owner: e.target.value })}
                  >
                    {OWNER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Name of Financial Institution"
                  value={account.institution}
                  onChange={(e) => updateBankAccount(index, { institution: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={account.amount}
                  onChange={(e) => updateBankAccount(index, { amount: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={account.hasBeneficiaries || false}
                      onChange={(e) => updateBankAccount(index, { hasBeneficiaries: e.target.checked })}
                    />
                  }
                  label="Has Beneficiaries?"
                />
              </Grid>
              {account.hasBeneficiaries && (
                <>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Primary Beneficiaries"
                      selectedBeneficiaries={account.primaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateBankAccount(index, { primaryBeneficiaries: selected })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Secondary Beneficiaries"
                      selectedBeneficiaries={account.secondaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateBankAccount(index, { secondaryBeneficiaries: selected })}
                    />
                  </Grid>
                </>
              )}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={investment.owner}
                    label="Owner"
                    onChange={(e) => updateNonQualifiedInvestment(index, { owner: e.target.value })}
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
                <TextField
                  fullWidth
                  label="Institution"
                  value={investment.institution}
                  onChange={(e) => updateNonQualifiedInvestment(index, { institution: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Description"
                  value={investment.description}
                  onChange={(e) => updateNonQualifiedInvestment(index, { description: e.target.value })}
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
                  onChange={(e) => updateNonQualifiedInvestment(index, { value: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={investment.hasBeneficiaries || false}
                      onChange={(e) => updateNonQualifiedInvestment(index, { hasBeneficiaries: e.target.checked })}
                    />
                  }
                  label="Has Beneficiaries?"
                />
              </Grid>
              {investment.hasBeneficiaries && (
                <>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Primary Beneficiaries"
                      selectedBeneficiaries={investment.primaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateNonQualifiedInvestment(index, { primaryBeneficiaries: selected })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Secondary Beneficiaries"
                      selectedBeneficiaries={investment.secondaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateNonQualifiedInvestment(index, { secondaryBeneficiaries: selected })}
                    />
                  </Grid>
                </>
              )}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={account.owner}
                    label="Owner"
                    onChange={(e) => updateRetirementAccount(index, { owner: e.target.value })}
                  >
                    {INDIVIDUAL_OWNER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={account.institution}
                  onChange={(e) => updateRetirementAccount(index, { institution: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Account Type"
                  value={account.accountType}
                  onChange={(e) => updateRetirementAccount(index, { accountType: e.target.value })}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., IRA, 401k, Pension"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Value"
                  value={account.value}
                  onChange={(e) => updateRetirementAccount(index, { value: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={account.hasBeneficiaries || false}
                      onChange={(e) => updateRetirementAccount(index, { hasBeneficiaries: e.target.checked })}
                    />
                  }
                  label="Has Beneficiaries?"
                />
              </Grid>
              {account.hasBeneficiaries && (
                <>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Primary Beneficiaries"
                      selectedBeneficiaries={account.primaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateRetirementAccount(index, { primaryBeneficiaries: selected })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Secondary Beneficiaries"
                      selectedBeneficiaries={account.secondaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateRetirementAccount(index, { secondaryBeneficiaries: selected })}
                    />
                  </Grid>
                </>
              )}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={policy.owner}
                    label="Owner"
                    onChange={(e) => updateLifeInsurance(index, { owner: e.target.value })}
                  >
                    {INDIVIDUAL_OWNER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Company"
                  value={policy.company}
                  onChange={(e) => updateLifeInsurance(index, { company: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Face Amount"
                  value={policy.faceAmount}
                  onChange={(e) => updateLifeInsurance(index, { faceAmount: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Cash Value"
                  value={policy.cashValue}
                  onChange={(e) => updateLifeInsurance(index, { cashValue: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Insured"
                  value={policy.insured}
                  onChange={(e) => updateLifeInsurance(index, { insured: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={policy.hasBeneficiaries || false}
                      onChange={(e) => updateLifeInsurance(index, { hasBeneficiaries: e.target.checked })}
                    />
                  }
                  label="Has Beneficiaries?"
                />
              </Grid>
              {policy.hasBeneficiaries && (
                <>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Primary Beneficiaries"
                      selectedBeneficiaries={policy.primaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateLifeInsurance(index, { primaryBeneficiaries: selected })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Secondary Beneficiaries"
                      selectedBeneficiaries={policy.secondaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateLifeInsurance(index, { secondaryBeneficiaries: selected })}
                    />
                  </Grid>
                </>
              )}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={vehicle.owner}
                    label="Owner"
                    onChange={(e) => updateVehicle(index, { owner: e.target.value })}
                  >
                    {OWNER_OPTIONS.map((option) => (
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
                  label="Year, Make, Model"
                  value={vehicle.yearMakeModel}
                  onChange={(e) => updateVehicle(index, { yearMakeModel: e.target.value })}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 2020 Toyota Camry"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Value"
                  value={vehicle.value}
                  onChange={(e) => updateVehicle(index, { value: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={vehicle.hasBeneficiaries || false}
                      onChange={(e) => updateVehicle(index, { hasBeneficiaries: e.target.checked })}
                    />
                  }
                  label="Has Beneficiaries?"
                />
              </Grid>
              {vehicle.hasBeneficiaries && (
                <>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Primary Beneficiaries"
                      selectedBeneficiaries={vehicle.primaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateVehicle(index, { primaryBeneficiaries: selected })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Secondary Beneficiaries"
                      selectedBeneficiaries={vehicle.secondaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateVehicle(index, { secondaryBeneficiaries: selected })}
                    />
                  </Grid>
                </>
              )}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={asset.owner}
                    label="Owner"
                    onChange={(e) => updateOtherAsset(index, { owner: e.target.value })}
                  >
                    {OWNER_OPTIONS.map((option) => (
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
                  label="Description"
                  value={asset.description}
                  onChange={(e) => updateOtherAsset(index, { description: e.target.value })}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Business interest, collectibles, jewelry"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Value"
                  value={asset.value}
                  onChange={(e) => updateOtherAsset(index, { value: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={asset.hasBeneficiaries || false}
                      onChange={(e) => updateOtherAsset(index, { hasBeneficiaries: e.target.checked })}
                    />
                  }
                  label="Has Beneficiaries?"
                />
              </Grid>
              {asset.hasBeneficiaries && (
                <>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Primary Beneficiaries"
                      selectedBeneficiaries={asset.primaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateOtherAsset(index, { primaryBeneficiaries: selected })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <BeneficiarySelector
                      label="Secondary Beneficiaries"
                      selectedBeneficiaries={asset.secondaryBeneficiaries}
                      options={beneficiaryOptions}
                      onChange={(selected) => updateOtherAsset(index, { secondaryBeneficiaries: selected })}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default AssetsSection;
