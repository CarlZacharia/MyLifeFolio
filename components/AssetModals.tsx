'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Box,
  Autocomplete,
  Typography,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { RealEstateOwner, OwnershipForm } from '../lib/FormContext';

// Constants
const ALL_OWNER_OPTIONS: RealEstateOwner[] = [
  'Client',
  'Spouse',
  'Client and Spouse',
  'Client and Other',
  'Spouse and Other',
  'Client, Spouse and Other',
];

const CLIENT_ONLY_OWNER_OPTIONS: RealEstateOwner[] = [
  'Client',
  'Client and Other',
];

const OWNERS_WITH_OTHER: RealEstateOwner[] = [
  'Client and Other',
  'Spouse and Other',
  'Client, Spouse and Other',
];

const ALL_INDIVIDUAL_OWNER_OPTIONS = ['Client', 'Spouse'] as const;
const CLIENT_ONLY_INDIVIDUAL_OPTIONS = ['Client'] as const;

// Helper to get owner options based on showSpouse
const getOwnerOptions = (showSpouse: boolean): RealEstateOwner[] =>
  showSpouse ? ALL_OWNER_OPTIONS : CLIENT_ONLY_OWNER_OPTIONS;

const getIndividualOwnerOptions = (showSpouse: boolean) =>
  showSpouse ? ALL_INDIVIDUAL_OWNER_OPTIONS : CLIENT_ONLY_INDIVIDUAL_OPTIONS;

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

export interface BeneficiaryOption {
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
  showBeneficiaries: boolean;
  showOther: boolean;
  jointOwnerBeneficiaries: string[];
  jointOwnerOther: string;
  beneficiaryOptions: BeneficiaryOption[];
  onChange: (updates: {
    showBeneficiaries?: boolean;
    showOther?: boolean;
    jointOwnerBeneficiaries?: string[];
    jointOwnerOther?: string;
  }) => void;
}

const JointOwnerSelector: React.FC<JointOwnerSelectorProps> = ({
  showBeneficiaries,
  showOther,
  jointOwnerBeneficiaries,
  jointOwnerOther,
  beneficiaryOptions,
  onChange,
}) => {
  const handleBeneficiaryTypeChange = (checked: boolean) => {
    onChange({ showBeneficiaries: checked });
    if (!checked) {
      onChange({ showBeneficiaries: false, jointOwnerBeneficiaries: [] });
    }
  };

  const handleOtherTypeChange = (checked: boolean) => {
    onChange({ showOther: checked });
    if (!checked) {
      onChange({ showOther: false, jointOwnerOther: '' });
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
              checked={showBeneficiaries}
              onChange={(e) => handleBeneficiaryTypeChange(e.target.checked)}
            />
          }
          label="Current Beneficiaries"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showOther}
              onChange={(e) => handleOtherTypeChange(e.target.checked)}
            />
          }
          label="Non-Beneficiary"
        />
      </FormGroup>

      {showBeneficiaries && (
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

      {showOther && (
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

// Real Estate Types
export interface RealEstateData {
  owner: RealEstateOwner;
  ownershipForm: OwnershipForm;
  showBeneficiaries: boolean;
  showOther: boolean;
  jointOwnerBeneficiaries: string[];
  jointOwnerOther: string;
  hasBeneficiaries: boolean;
  street: string;
  city: string;
  state: string;
  zip: string;
  value: string;
  mortgageBalance: string;
  costBasis: string;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyRealEstate: RealEstateData = {
  owner: '' as RealEstateOwner,
  ownershipForm: '' as OwnershipForm,
  showBeneficiaries: false,
  showOther: false,
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
  notes: '',
};

interface RealEstateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RealEstateData) => void;
  onDelete?: () => void;
  initialData?: RealEstateData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const RealEstateModal: React.FC<RealEstateModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<RealEstateData>(initialData || emptyRealEstate);

  useEffect(() => {
    if (open) {
      setData(initialData || emptyRealEstate);
    }
  }, [open, initialData]);

  const handleChange = (updates: Partial<RealEstateData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleOwnerChange = (newOwner: RealEstateOwner) => {
    const updates: Partial<RealEstateData> = {
      owner: newOwner,
      ownershipForm: '' as OwnershipForm,
    };
    if (!OWNERS_WITH_OTHER.includes(newOwner)) {
      updates.showBeneficiaries = false;
      updates.showOther = false;
      updates.jointOwnerBeneficiaries = [];
      updates.jointOwnerOther = '';
    }
    handleChange(updates);
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Property' : 'Add Property'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Owner</InputLabel>
              <Select
                value={data.owner}
                label="Owner"
                onChange={(e) => handleOwnerChange(e.target.value as RealEstateOwner)}
              >
                {ownerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" disabled={!data.owner}>
              <InputLabel>Ownership Form</InputLabel>
              <Select
                value={data.ownershipForm}
                label="Ownership Form"
                onChange={(e) => handleChange({ ownershipForm: e.target.value as OwnershipForm })}
              >
                {getOwnershipFormOptions(data.owner).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {OWNERS_WITH_OTHER.includes(data.owner) && (
            <Grid item xs={12}>
              <JointOwnerSelector
                showBeneficiaries={data.showBeneficiaries}
                showOther={data.showOther}
                jointOwnerBeneficiaries={data.jointOwnerBeneficiaries}
                jointOwnerOther={data.jointOwnerOther}
                beneficiaryOptions={beneficiaryOptions}
                onChange={(updates) => handleChange(updates as Partial<RealEstateData>)}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              value={data.street}
              onChange={(e) => handleChange({ street: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="City"
              value={data.city}
              onChange={(e) => handleChange({ city: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="State"
              value={data.state}
              onChange={(e) => handleChange({ state: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Zip Code"
              value={data.zip}
              onChange={(e) => handleChange({ zip: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Estimated Value"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Mortgage Balance"
              value={data.mortgageBalance}
              onChange={(e) => handleChange({ mortgageBalance: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cost Basis"
              value={data.costBasis}
              onChange={(e) => handleChange({ costBasis: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) => handleChange({ hasBeneficiaries: e.target.checked })}
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>

          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12} md={6}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ primaryBeneficiaries: selected })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ secondaryBeneficiaries: selected })}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this property..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? 'Save Changes' : 'Add Property'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Bank Account Types
export interface BankAccountData {
  owner: string;
  institution: string;
  amount: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyBankAccount: BankAccountData = {
  owner: '',
  institution: '',
  amount: '',
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
  notes: '',
};

interface BankAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BankAccountData) => void;
  onDelete?: () => void;
  initialData?: BankAccountData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const BankAccountModal: React.FC<BankAccountModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<BankAccountData>(initialData || emptyBankAccount);

  useEffect(() => {
    if (open) {
      setData(initialData || emptyBankAccount);
    }
  }, [open, initialData]);

  const handleChange = (updates: Partial<BankAccountData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Owner</InputLabel>
              <Select
                value={data.owner}
                label="Owner"
                onChange={(e) => handleChange({ owner: e.target.value })}
              >
                {ownerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name of Financial Institution"
              value={data.institution}
              onChange={(e) => handleChange({ institution: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount"
              value={data.amount}
              onChange={(e) => handleChange({ amount: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) => handleChange({ hasBeneficiaries: e.target.checked })}
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ primaryBeneficiaries: selected })}
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ secondaryBeneficiaries: selected })}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this account..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? 'Save Changes' : 'Add Account'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Non-Qualified Investment Types
export interface NonQualifiedInvestmentData {
  owner: string;
  institution: string;
  description: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyNonQualifiedInvestment: NonQualifiedInvestmentData = {
  owner: '',
  institution: '',
  description: '',
  value: '',
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
  notes: '',
};

interface NonQualifiedInvestmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NonQualifiedInvestmentData) => void;
  onDelete?: () => void;
  initialData?: NonQualifiedInvestmentData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const NonQualifiedInvestmentModal: React.FC<NonQualifiedInvestmentModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<NonQualifiedInvestmentData>(initialData || emptyNonQualifiedInvestment);

  useEffect(() => {
    if (open) {
      setData(initialData || emptyNonQualifiedInvestment);
    }
  }, [open, initialData]);

  const handleChange = (updates: Partial<NonQualifiedInvestmentData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Investment Account' : 'Add Investment Account'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Owner</InputLabel>
              <Select
                value={data.owner}
                label="Owner"
                onChange={(e) => handleChange({ owner: e.target.value })}
              >
                {ownerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Institution"
              value={data.institution}
              onChange={(e) => handleChange({ institution: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={data.description}
              onChange={(e) => handleChange({ description: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., Brokerage, Stocks, Bonds, Mutual Funds"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) => handleChange({ hasBeneficiaries: e.target.checked })}
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ primaryBeneficiaries: selected })}
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ secondaryBeneficiaries: selected })}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this investment..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? 'Save Changes' : 'Add Account'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Retirement Account Types
export interface RetirementAccountData {
  owner: string;
  institution: string;
  accountType: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyRetirementAccount: RetirementAccountData = {
  owner: '',
  institution: '',
  accountType: '',
  value: '',
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
  notes: '',
};

interface RetirementAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RetirementAccountData) => void;
  onDelete?: () => void;
  initialData?: RetirementAccountData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const RetirementAccountModal: React.FC<RetirementAccountModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
  const [data, setData] = useState<RetirementAccountData>(initialData || emptyRetirementAccount);

  useEffect(() => {
    if (open) {
      setData(initialData || emptyRetirementAccount);
    }
  }, [open, initialData]);

  const handleChange = (updates: Partial<RetirementAccountData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Retirement Account' : 'Add Retirement Account'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Owner</InputLabel>
              <Select
                value={data.owner}
                label="Owner"
                onChange={(e) => handleChange({ owner: e.target.value })}
              >
                {individualOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Institution"
              value={data.institution}
              onChange={(e) => handleChange({ institution: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Type"
              value={data.accountType}
              onChange={(e) => handleChange({ accountType: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., IRA, 401k, Pension"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) => handleChange({ hasBeneficiaries: e.target.checked })}
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ primaryBeneficiaries: selected })}
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ secondaryBeneficiaries: selected })}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this account..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? 'Save Changes' : 'Add Account'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Life Insurance Types
export interface LifeInsuranceData {
  owner: string;
  company: string;
  faceAmount: string;
  cashValue: string;
  insured: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyLifeInsurance: LifeInsuranceData = {
  owner: '',
  company: '',
  faceAmount: '',
  cashValue: '',
  insured: '',
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
  notes: '',
};

interface LifeInsuranceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LifeInsuranceData) => void;
  onDelete?: () => void;
  initialData?: LifeInsuranceData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const LifeInsuranceModal: React.FC<LifeInsuranceModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
  const [data, setData] = useState<LifeInsuranceData>(initialData || emptyLifeInsurance);

  useEffect(() => {
    if (open) {
      setData(initialData || emptyLifeInsurance);
    }
  }, [open, initialData]);

  const handleChange = (updates: Partial<LifeInsuranceData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Life Insurance Policy' : 'Add Life Insurance Policy'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Owner</InputLabel>
              <Select
                value={data.owner}
                label="Owner"
                onChange={(e) => handleChange({ owner: e.target.value })}
              >
                {individualOwnerOptions.map((option) => (
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
              label="Insured"
              value={data.insured}
              onChange={(e) => handleChange({ insured: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company"
              value={data.company}
              onChange={(e) => handleChange({ company: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Face Amount"
              value={data.faceAmount}
              onChange={(e) => handleChange({ faceAmount: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cash Value"
              value={data.cashValue}
              onChange={(e) => handleChange({ cashValue: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) => handleChange({ hasBeneficiaries: e.target.checked })}
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ primaryBeneficiaries: selected })}
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ secondaryBeneficiaries: selected })}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this policy..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? 'Save Changes' : 'Add Policy'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Vehicle Types
export interface VehicleData {
  owner: string;
  yearMakeModel: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyVehicle: VehicleData = {
  owner: '',
  yearMakeModel: '',
  value: '',
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
  notes: '',
};

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: VehicleData) => void;
  onDelete?: () => void;
  initialData?: VehicleData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<VehicleData>(initialData || emptyVehicle);

  useEffect(() => {
    if (open) {
      setData(initialData || emptyVehicle);
    }
  }, [open, initialData]);

  const handleChange = (updates: Partial<VehicleData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Owner</InputLabel>
              <Select
                value={data.owner}
                label="Owner"
                onChange={(e) => handleChange({ owner: e.target.value })}
              >
                {ownerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Year, Make, Model"
              value={data.yearMakeModel}
              onChange={(e) => handleChange({ yearMakeModel: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., 2020 Toyota Camry"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) => handleChange({ hasBeneficiaries: e.target.checked })}
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ primaryBeneficiaries: selected })}
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ secondaryBeneficiaries: selected })}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this vehicle..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? 'Save Changes' : 'Add Vehicle'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Other Asset Types
export interface OtherAssetData {
  owner: string;
  description: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyOtherAsset: OtherAssetData = {
  owner: '',
  description: '',
  value: '',
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
  notes: '',
};

interface OtherAssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: OtherAssetData) => void;
  onDelete?: () => void;
  initialData?: OtherAssetData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const OtherAssetModal: React.FC<OtherAssetModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<OtherAssetData>(initialData || emptyOtherAsset);

  useEffect(() => {
    if (open) {
      setData(initialData || emptyOtherAsset);
    }
  }, [open, initialData]);

  const handleChange = (updates: Partial<OtherAssetData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Owner</InputLabel>
              <Select
                value={data.owner}
                label="Owner"
                onChange={(e) => handleChange({ owner: e.target.value })}
              >
                {ownerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={data.description}
              onChange={(e) => handleChange({ description: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., Business interest, collectibles, jewelry"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) => handleChange({ hasBeneficiaries: e.target.checked })}
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ primaryBeneficiaries: selected })}
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) => handleChange({ secondaryBeneficiaries: selected })}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this asset..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? 'Save Changes' : 'Add Asset'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
