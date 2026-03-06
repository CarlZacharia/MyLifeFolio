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

export const ADVISOR_TYPES = [
  'CPA',
  'Insurance Agent',
  'Financial Advisor',
  'Lawyer',
  'Plumber',
  'Electrician',
  'HVAC',
  'Repairs',
  'Landscaping',
  'Handyman',
] as const;

export type AdvisorType = (typeof ADVISOR_TYPES)[number] | '';

export interface AdvisorData {
  advisorType: string;
  name: string;
  firmName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const emptyAdvisor: AdvisorData = {
  advisorType: '',
  name: '',
  firmName: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

interface AdvisorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AdvisorData) => void;
  onDelete?: () => void;
  initialData?: AdvisorData;
  isEdit?: boolean;
  defaultType?: string;
}

const AdvisorModal: React.FC<AdvisorModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  defaultType = '',
}) => {
  const [data, setData] = useState<AdvisorData>(initialData || { ...emptyAdvisor, advisorType: defaultType });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : { ...emptyAdvisor, advisorType: defaultType });
      setTouched({});
    }
  }, [open, isEdit, initialData, defaultType]);

  const handleChange = (updates: Partial<AdvisorData>) => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
        {isEdit ? 'Edit Advisor' : 'Add Advisor'}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            label="Advisor Type"
            value={data.advisorType}
            onChange={(e) => handleChange({ advisorType: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          >
            {ADVISOR_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Advisor Name"
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
          {isEdit ? 'Save Changes' : 'Add Advisor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvisorModal;
