'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  folioColors,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

// Beneficiary types
export interface BeneficiaryData {
  name: string;
  address: string;
  telephone: string;
  email: string;
  relationship: string;
  relationshipOther: string;
  age: string;
  notes: string;
}

export interface CharityData {
  name: string;
  address: string;
  amount: string;
}

const RELATIONSHIP_OPTIONS = ['Grandchild', 'Parent', 'Sibling', 'Friend', 'Other'] as const;

// Beneficiary Modal
interface BeneficiaryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BeneficiaryData) => void;
  onDelete?: () => void;
  initialData?: BeneficiaryData;
  isEdit: boolean;
}

const getDefaultBeneficiaryData = (): BeneficiaryData => ({
  name: '',
  address: '',
  telephone: '',
  email: '',
  relationship: '',
  relationshipOther: '',
  age: '',
  notes: '',
});

export const BeneficiaryModal: React.FC<BeneficiaryModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState<BeneficiaryData>(getDefaultBeneficiaryData());
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultBeneficiaryData());
    }
  }, [open, initialData]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (field: keyof BeneficiaryData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    const value = field === 'telephone' ? formatPhoneNumber(event.target.value) : event.target.value;
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Clear relationshipOther if relationship is not "Other"
      if (field === 'relationship' && value !== 'Other') {
        updated.relationshipOther = '';
      }
      // Clear age if relationship is not "Grandchild"
      if (field === 'relationship' && value !== 'Grandchild') {
        updated.age = '';
      }
      return updated;
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Other Family Member' : 'Add Other Family Member'}
      eyebrow="My Life Folio — Other Family Members"
      maxWidth="md"
      footer={
        <>
          <Box>
            {isEdit && onDelete && (
              <FolioDeleteButton onClick={onDelete} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!formData.name}>
              {isEdit ? 'Save Changes' : 'Save'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Legal Name"
              value={formData.name}
              onChange={handleChange('name')}
              variant="outlined"
              size="small"
              required
              helperText="Enter full legal name, not nickname (e.g., James P. Jones, not Jimmy)"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" sx={{ ...folioTextFieldSx }}>
              <InputLabel>Relationship</InputLabel>
              <Select
                value={formData.relationship}
                label="Relationship"
                onChange={(e) => setFormData((prev) => {
                  const updated = { ...prev, relationship: e.target.value };
                  if (e.target.value !== 'Other') {
                    updated.relationshipOther = '';
                  }
                  return updated;
                })}
              >
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {formData.relationship === 'Other' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Describe Relationship"
                value={formData.relationshipOther}
                onChange={handleChange('relationshipOther')}
                variant="outlined"
                size="small"
                helperText="e.g., cousin, neighbor"
                sx={{ ...folioTextFieldSx }}
              />
            </Grid>
          )}
          {formData.relationship === 'Grandchild' && (
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Age"
                value={formData.age}
                onChange={handleChange('age')}
                variant="outlined"
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                sx={{ ...folioTextFieldSx }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={handleChange('address')}
              variant="outlined"
              size="small"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telephone"
              value={formData.telephone}
              onChange={handleChange('telephone')}
              variant="outlined"
              size="small"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={handleChange('email')}
              variant="outlined"
              size="small"
              type="email"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes || ''}
              onChange={handleChange('notes')}
              variant="outlined"
              size="small"
              multiline
              rows={3}
              placeholder="Any additional comments or notes about this family member"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Charity Modal
interface CharityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CharityData) => void;
  onDelete?: () => void;
  initialData?: CharityData;
  isEdit: boolean;
}

const getDefaultCharityData = (): CharityData => ({
  name: '',
  address: '',
  amount: '',
});

export const CharityModal: React.FC<CharityModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState<CharityData>(getDefaultCharityData());
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultCharityData());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof CharityData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Charity' : 'Add Charity'}
      eyebrow="My Life Folio — Charities"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && (
              <FolioDeleteButton onClick={onDelete} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!formData.name}>
              {isEdit ? 'Save Changes' : 'Add Charity'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Charity Name"
              value={formData.name}
              onChange={handleChange('name')}
              variant="outlined"
              size="small"
              required
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount/Percentage"
              value={formData.amount}
              onChange={handleChange('amount')}
              variant="outlined"
              size="small"
              helperText="e.g., $10,000 or 10%"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={handleChange('address')}
              variant="outlined"
              size="small"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

export default { BeneficiaryModal, CharityModal };
