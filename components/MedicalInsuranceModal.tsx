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

export const INSURANCE_TYPES = [
  'Part B Medicare Advantage',
  'Medicare Supplement',
  'Private Insurance',
  'Employer',
  'Veterans',
  'Part D Drug',
  'Vision',
  'Other',
] as const;

export const PAID_BY_OPTIONS = [
  'Personally Paid',
  'Deducted from Income Source',
  'Paid by Group',
  'Paid by Employer',
  'Other',
] as const;

export interface MedicalInsurancePolicyData {
  person: 'client' | 'spouse';
  insuranceType: string;
  policyNo: string;
  provider: string;
  paidBy: string;
  monthlyCost: string;
  contactName: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
}

const emptyPolicy = (person: 'client' | 'spouse'): MedicalInsurancePolicyData => ({
  person,
  insuranceType: '',
  policyNo: '',
  provider: '',
  paidBy: '',
  monthlyCost: '',
  contactName: '',
  contactAddress: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
});

interface MedicalInsuranceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MedicalInsurancePolicyData) => void;
  onDelete?: () => void;
  initialData?: MedicalInsurancePolicyData;
  isEdit?: boolean;
  person: 'client' | 'spouse';
}

const MedicalInsuranceModal: React.FC<MedicalInsuranceModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  person,
}) => {
  const [data, setData] = useState<MedicalInsurancePolicyData>(initialData || emptyPolicy(person));
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const personLabel = person === 'spouse' ? 'Spouse' : 'Client';

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyPolicy(person));
      setTouched({});
    }
  }, [open, isEdit, initialData, person]);

  const handleChange = (updates: Partial<MedicalInsurancePolicyData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const typeError = touched.insuranceType && !data.insuranceType;
  const canSave = data.insuranceType.length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ insuranceType: true });
      return;
    }
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
        {isEdit ? `Edit ${personLabel} Insurance` : `Add ${personLabel} Medical Insurance`}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            label="Type"
            value={data.insuranceType}
            onChange={(e) => handleChange({ insuranceType: e.target.value })}
            onBlur={() => handleBlur('insuranceType')}
            error={!!typeError}
            helperText={typeError ? 'Type is required' : ''}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
          >
            {INSURANCE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Provider"
              value={data.provider}
              onChange={(e) => handleChange({ provider: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Policy No."
              value={data.policyNo}
              onChange={(e) => handleChange({ policyNo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Paid By"
              value={data.paidBy}
              onChange={(e) => handleChange({ paidBy: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            >
              {PAID_BY_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Monthly Cost"
              value={data.monthlyCost}
              onChange={(e) => handleChange({ monthlyCost: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="$0.00"
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Provider to Contact"
            value={data.contactName}
            onChange={(e) => handleChange({ contactName: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Contact Address"
            value={data.contactAddress}
            onChange={(e) => handleChange({ contactAddress: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Contact Telephone"
              value={data.contactPhone}
              onChange={(e) => handleChange({ contactPhone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Contact Email"
              value={data.contactEmail}
              onChange={(e) => handleChange({ contactEmail: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Notes and Comments"
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
          {isEdit ? 'Save Changes' : 'Add Insurance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalInsuranceModal;
