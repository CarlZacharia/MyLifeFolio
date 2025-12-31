'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormContext, BeneficiaryDistributionMethod } from '../lib/FormContext';

export type ChildMaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | '';

export interface ChildData {
  name: string;
  address: string;
  birthDate: string;
  age: string;
  relationship: string;
  maritalStatus: ChildMaritalStatus;
  hasChildren: boolean;
  numberOfChildren: number;
  hasMinorChildren: boolean;
  distributionType: 'Per Stirpes' | 'Per Capita' | '';
  distributionMethod: BeneficiaryDistributionMethod;
  disinherit: boolean;
  isDeceased: boolean;
  comments: string;
}

const CHILD_MARITAL_STATUS_OPTIONS: ChildMaritalStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];

const DISTRIBUTION_METHOD_OPTIONS: { value: BeneficiaryDistributionMethod; label: string }[] = [
  { value: 'Outright', label: 'Outright distribution' },
  { value: 'Trust for Term of Years', label: 'Distribution in trust for a term of years' },
  { value: 'Trust for Life', label: 'Distribution in trust for life' },
  { value: 'Unsure', label: 'Unsure' },
];

const RELATIONSHIP_OPTIONS = [
  'Son of Both',
  'Daughter of Both',
  'Son of Client',
  'Daughter of Client',
  'Son of Spouse',
  'Daughter of Spouse',
];

interface ChildModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ChildData) => void;
  onDelete?: () => void;
  initialData?: ChildData;
  isEdit: boolean;
  showSpouse: boolean;
}

const getDefaultChildData = (): ChildData => ({
  name: '',
  address: '',
  birthDate: '',
  age: '',
  relationship: '',
  maritalStatus: '',
  hasChildren: false,
  numberOfChildren: 0,
  hasMinorChildren: false,
  distributionType: '',
  distributionMethod: '',
  disinherit: false,
  isDeceased: false,
  comments: '',
});

// Calculate age from birth date
const calculateAge = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  const date = typeof dateString === 'string' ? dateString : String(dateString);
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return '';

  const birthDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? String(age) : '';
};

export const ChildModal: React.FC<ChildModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
  showSpouse,
}) => {
  const [formData, setFormData] = useState<ChildData>(getDefaultChildData());
  const { formData: contextFormData } = useFormContext();

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultChildData());
    }
  }, [open, initialData]);

  // Update age whenever birthDate changes
  useEffect(() => {
    if (formData.birthDate) {
      const calculatedAge = calculateAge(formData.birthDate);
      if (calculatedAge !== formData.age) {
        setFormData((prev) => ({ ...prev, age: calculatedAge }));
      }
    }
  }, [formData.birthDate, formData.age]);

  const handleChange = (field: keyof ChildData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCheckboxChange = (field: keyof ChildData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleSave = () => {
    // Calculate age from birthDate before saving
    const dataWithAge = {
      ...formData,
      age: calculateAge(formData.birthDate),
    };
    onSave(dataWithAge);
    onClose();
  };

  // Dynamically filter relationship options based on prior children and children together
  const relationshipOptions = useMemo(() => {
    // If no spouse, only show Client options
    if (!showSpouse) {
      return RELATIONSHIP_OPTIONS.filter(opt => opt.includes('Client') && !opt.includes('Spouse') && !opt.includes('Both'));
    }

    const clientHasPriorChildren = contextFormData.clientHasChildrenFromPrior;
    const spouseHasPriorChildren = contextFormData.spouseHasChildrenFromPrior;
    const hasChildrenTogether = contextFormData.childrenTogether > 0;

    const options: string[] = [];

    // Add "of Both" options if there are children together OR if neither has prior children
    // (When neither has prior children, "of Both" are the only options available)
    if (hasChildrenTogether || (!clientHasPriorChildren && !spouseHasPriorChildren)) {
      options.push('Son of Both', 'Daughter of Both');
    }

    // Add Client options if client has children from prior relationship
    if (clientHasPriorChildren) {
      options.push('Son of Client', 'Daughter of Client');
    }

    // Add Spouse options if spouse has children from prior relationship
    if (spouseHasPriorChildren) {
      options.push('Son of Spouse', 'Daughter of Spouse');
    }

    return options;
  }, [showSpouse, contextFormData.clientHasChildrenFromPrior, contextFormData.spouseHasChildrenFromPrior, contextFormData.childrenTogether]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Child' : 'Add Child'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            {/* Row 1: Name, Relationship, Marital Status */}
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Legal Name"
                value={formData.name}
                onChange={handleChange('name')}
                variant="outlined"
                size="small"
                required
                helperText="Enter full legal name, not nickname (e.g., James P. Jones, not Jimmy)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.relationship}
                  label="Relationship"
                  onChange={(e) => setFormData((prev) => ({ ...prev, relationship: e.target.value }))}
                >
                  {relationshipOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.maritalStatus}
                  label="Marital Status"
                  onChange={(e) => setFormData((prev) => ({ ...prev, maritalStatus: e.target.value as ChildMaritalStatus }))}
                >
                  {CHILD_MARITAL_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Row 2: Address, Date of Birth */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date of Birth"
                value={formData.birthDate}
                onChange={handleChange('birthDate')}
                variant="outlined"
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              {formData.birthDate && calculateAge(formData.birthDate) && (
                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  Age: {calculateAge(formData.birthDate)} years old
                </Typography>
              )}
            </Grid>
            {/* Row 3: Has Children, Disinherit, Is Deceased */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Has Children?
                </Typography>
                <RadioGroup
                  row
                  value={formData.hasChildren ? 'yes' : 'no'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hasChildren: e.target.value === 'yes' }))}
                  sx={{ flexWrap: 'nowrap' }}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" sx={{ mr: 1 }} />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.disinherit || false}
                    onChange={handleCheckboxChange('disinherit')}
                    sx={{ color: 'error.main', '&.Mui-checked': { color: 'error.main' } }}
                  />
                }
                label="Disinherit this child"
                sx={{ color: 'error.main' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isDeceased || false}
                    onChange={handleCheckboxChange('isDeceased')}
                    sx={{ color: 'error.main', '&.Mui-checked': { color: 'error.main' } }}
                  />
                }
                label="Is Deceased?"
                sx={{ color: 'error.main' }}
              />
            </Grid>
            {formData.hasChildren && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="No. Children"
                    type="number"
                    value={formData.numberOfChildren || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, numberOfChildren: parseInt(e.target.value) || 0 }))}
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Are any minors?
                    </Typography>
                    <RadioGroup
                      row
                      value={formData.hasMinorChildren ? 'yes' : 'no'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hasMinorChildren: e.target.value === 'yes' }))}
                      sx={{ flexWrap: 'nowrap' }}
                    >
                      <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" sx={{ mr: 1 }} />
                      <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                    </RadioGroup>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Distribution Type
                    </Typography>
                    <RadioGroup
                      row
                      value={formData.distributionType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, distributionType: e.target.value as ChildData['distributionType'] }))}
                      sx={{ flexWrap: 'nowrap' }}
                    >
                      <FormControlLabel value="Per Stirpes" control={<Radio size="small" />} label="Per Stirpes" sx={{ mr: 1 }} />
                      <FormControlLabel value="Per Capita" control={<Radio size="small" />} label="Per Capita" />
                    </RadioGroup>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Per Stirpes: Share passes to descendants. Per Capita: Share divided among survivors only.
                  </Typography>
                </Grid>
              </>
            )}
            {/* Distribution Method */}
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                  What type of distribution do you foresee for this beneficiary?
                </FormLabel>
                <RadioGroup
                  value={formData.distributionMethod || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, distributionMethod: e.target.value as BeneficiaryDistributionMethod }))}
                >
                  {DISTRIBUTION_METHOD_OPTIONS.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio size="small" />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                value={formData.comments || ''}
                onChange={handleChange('comments')}
                variant="outlined"
                size="small"
                multiline
                rows={3}
                placeholder="Any additional notes about this child"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name || !formData.relationship}>
            {isEdit ? 'Save Changes' : 'Add Child'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChildModal;
