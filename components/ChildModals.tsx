'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
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
import { useFormContext, BeneficiaryDistributionMethod } from '../lib/FormContext';
import FolioModal, {
  folioTextFieldSx,
  folioColors,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

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
  const fieldsVisible = useFolioFieldAnimation(open);

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

  const footer = (
    <>
      <Box>
        {isEdit && onDelete && (
          <FolioDeleteButton onClick={onDelete} />
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <FolioCancelButton onClick={onClose} />
        <FolioSaveButton onClick={handleSave} disabled={!formData.name || !formData.relationship}>
          {isEdit ? 'Save Changes' : 'Add Child'}
        </FolioSaveButton>
      </Box>
    </>
  );

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Child' : 'Add Child'}
      eyebrow="My Life Folio — Family & Dependents"
      maxWidth="md"
      footer={footer}
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
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
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" required sx={{ ...folioTextFieldSx }}>
              <InputLabel shrink>Relationship</InputLabel>
              <Select
                value={formData.relationship}
                label="Relationship"
                notched
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
            <FormControl fullWidth size="small" sx={{ ...folioTextFieldSx }}>
              <InputLabel shrink>Marital Status</InputLabel>
              <Select
                value={formData.maritalStatus}
                label="Marital Status"
                notched
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
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx }}
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
              sx={{ ...folioTextFieldSx }}
            />
            {formData.birthDate && calculateAge(formData.birthDate) && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: folioColors.inkLight,
                  fontFamily: '"Jost", sans-serif',
                  fontSize: '13px',
                }}
              >
                Age: {calculateAge(formData.birthDate)} years old
              </Typography>
            )}
          </Grid>
          {/* Row 3: Has Children, Disinherit, Is Deceased */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
              <Typography
                variant="body2"
                sx={{
                  mr: 2,
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 500,
                  fontSize: '13px',
                  letterSpacing: '0.05em',
                  color: folioColors.inkLight,
                }}
              >
                Has Children?
              </Typography>
              <RadioGroup
                row
                value={formData.hasChildren ? 'yes' : 'no'}
                onChange={(e) => setFormData((prev) => ({ ...prev, hasChildren: e.target.value === 'yes' }))}
                sx={{ flexWrap: 'nowrap' }}
              >
                <FormControlLabel value="yes" control={<Radio size="small" sx={{ color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } }} />} label="Yes" sx={{ mr: 1, '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } }} />
                <FormControlLabel value="no" control={<Radio size="small" sx={{ color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } }} />} label="No" sx={{ '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } }} />
              </RadioGroup>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.disinherit || false}
                  onChange={handleCheckboxChange('disinherit')}
                  sx={{ color: '#c62828', '&.Mui-checked': { color: '#c62828' } }}
                />
              }
              label="Disinherit this child"
              sx={{ color: '#c62828', '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px' } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDeceased || false}
                  onChange={handleCheckboxChange('isDeceased')}
                  sx={{ color: '#c62828', '&.Mui-checked': { color: '#c62828' } }}
                />
              }
              label="Is Deceased?"
              sx={{ color: '#c62828', '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px' } }}
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
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mr: 2,
                      fontFamily: '"Jost", sans-serif',
                      fontWeight: 500,
                      fontSize: '13px',
                      letterSpacing: '0.05em',
                      color: folioColors.inkLight,
                    }}
                  >
                    Are any minors?
                  </Typography>
                  <RadioGroup
                    row
                    value={formData.hasMinorChildren ? 'yes' : 'no'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasMinorChildren: e.target.value === 'yes' }))}
                    sx={{ flexWrap: 'nowrap' }}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" sx={{ color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } }} />} label="Yes" sx={{ mr: 1, '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } }} />
                    <FormControlLabel value="no" control={<Radio size="small" sx={{ color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } }} />} label="No" sx={{ '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } }} />
                  </RadioGroup>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mr: 2,
                      fontFamily: '"Jost", sans-serif',
                      fontWeight: 500,
                      fontSize: '13px',
                      letterSpacing: '0.05em',
                      color: folioColors.inkLight,
                    }}
                  >
                    Distribution Type
                  </Typography>
                  <RadioGroup
                    row
                    value={formData.distributionType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, distributionType: e.target.value as ChildData['distributionType'] }))}
                    sx={{ flexWrap: 'nowrap' }}
                  >
                    <FormControlLabel value="Per Stirpes" control={<Radio size="small" sx={{ color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } }} />} label="Per Stirpes" sx={{ mr: 1, '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } }} />
                    <FormControlLabel value="Per Capita" control={<Radio size="small" sx={{ color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } }} />} label="Per Capita" sx={{ '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } }} />
                  </RadioGroup>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: folioColors.inkFaint,
                    fontFamily: '"Jost", sans-serif',
                    fontSize: '12px',
                  }}
                >
                  Per Stirpes: Share passes to descendants. Per Capita: Share divided among survivors only.
                </Typography>
              </Grid>
            </>
          )}
          {/* Distribution Method */}
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel
                component="legend"
                sx={{
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 500,
                  fontSize: '13px',
                  letterSpacing: '0.05em',
                  color: folioColors.inkLight,
                  mb: 1,
                  '&.Mui-focused': { color: folioColors.accent },
                }}
              >
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
                    control={<Radio size="small" sx={{ color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } }} />}
                    label={option.label}
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } }}
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
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

export default ChildModal;
