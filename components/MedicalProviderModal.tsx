'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const SPECIALIST_TYPES = [
  'Allergist/Immunologist',
  'Cardiologist',
  'Chiropractor',
  'Dentist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Geriatrician',
  'Gynecologist',
  'Hematologist',
  'Infectious Disease Specialist',
  'Mental Health Provider',
  'Nephrologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic Surgeon',
  'Otolaryngologist (ENT)',
  'Pain Management Specialist',
  'Physiatrist',
  'Podiatrist',
  'Pulmonologist',
  'Rheumatologist',
  'Sleep Medicine Specialist',
  'Urologist',
  'Other Specialist',
] as const;

export type SpecialistType = (typeof SPECIALIST_TYPES)[number] | '';

export interface MedicalProviderData {
  providerCategory: 'clientPCP' | 'clientSpecialist' | 'spousePCP' | 'spouseSpecialist';
  specialistType: string;
  name: string;
  firmName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const emptyProvider = (category: MedicalProviderData['providerCategory']): MedicalProviderData => ({
  providerCategory: category,
  specialistType: '',
  name: '',
  firmName: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
});

interface MedicalProviderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MedicalProviderData) => void;
  onDelete?: () => void;
  initialData?: MedicalProviderData;
  isEdit?: boolean;
  providerCategory: MedicalProviderData['providerCategory'];
}

const MedicalProviderModal: React.FC<MedicalProviderModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  providerCategory,
}) => {
  const [data, setData] = useState<MedicalProviderData>(initialData || emptyProvider(providerCategory));
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isSpecialist = providerCategory === 'clientSpecialist' || providerCategory === 'spouseSpecialist';
  const isSpouse = providerCategory === 'spousePCP' || providerCategory === 'spouseSpecialist';
  const personLabel = isSpouse ? 'Spouse' : 'Client';

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyProvider(providerCategory));
      setTouched({});
    }
  }, [open, isEdit, initialData, providerCategory]);

  const handleChange = (updates: Partial<MedicalProviderData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.name && !data.name.trim();
  const canSave = data.name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ name: true });
      return;
    }
    onSave(data);
    onClose();
  };

  const title = isEdit
    ? `Edit ${personLabel} ${isSpecialist ? 'Specialist' : 'PCP'}`
    : `Add ${personLabel} ${isSpecialist ? 'Specialist' : 'PCP'}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
        {title}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {isSpecialist && (
            <TextField
              select
              label="Advisor Type"
              value={data.specialistType}
              onChange={(e) => handleChange({ specialistType: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            >
              {SPECIALIST_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Physician's Name"
            value={data.name}
            onChange={(e) => handleChange({ name: e.target.value })}
            onBlur={() => handleBlur('name')}
            error={!!nameError}
            helperText={nameError ? 'Name is required' : ''}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Firm/Practice Name"
            value={data.firmName}
            onChange={(e) => handleChange({ firmName: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone"
              value={data.phone}
              onChange={(e) => handleChange({ phone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Email"
              value={data.email}
              onChange={(e) => handleChange({ email: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Address"
            value={data.address}
            onChange={(e) => handleChange({ address: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Notes"
            value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {isEdit && onDelete && (
          <Button onClick={onDelete} color="error" sx={{ mr: 'auto' }}>
            Delete
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSave}>
          {isEdit ? 'Save Changes' : isSpecialist ? 'Add Specialist' : 'Add PCP'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalProviderModal;
