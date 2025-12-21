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
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Beneficiary types
export interface BeneficiaryData {
  name: string;
  address: string;
  relationship: string;
  relationshipOther: string;
  age: string;
  distributionType: 'Per Stirpes' | 'Per Capita' | '';
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
  relationship: '',
  relationshipOther: '',
  age: '',
  distributionType: '',
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

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultBeneficiaryData());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof BeneficiaryData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    const value = event.target.value;
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Beneficiary' : 'Add Beneficiary'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
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
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Distribution Type
                </Typography>
                <RadioGroup
                  row
                  value={formData.distributionType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, distributionType: e.target.value as BeneficiaryData['distributionType'] }))}
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
                placeholder="Any additional comments or notes about this beneficiary"
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
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            {isEdit ? 'Save Changes' : 'Add Beneficiary'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Charity' : 'Add Charity'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
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
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            {isEdit ? 'Save Changes' : 'Add Charity'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default { BeneficiaryModal, CharityModal };
