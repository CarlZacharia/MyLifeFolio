'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  MenuItem,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

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
  const fieldsVisible = useFolioFieldAnimation(open);

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

  const footer = (
    <>
      <Box>
        {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <FolioCancelButton onClick={onClose} />
        <FolioSaveButton onClick={handleSave} disabled={!canSave}>
          {isEdit ? 'Save Changes' : 'Add Insurance'}
        </FolioSaveButton>
      </Box>
    </>
  );

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${personLabel} Insurance` : `Add ${personLabel} Medical Insurance`}
      eyebrow="My Life Folio — Medical Insurance"
      maxWidth="sm"
      footer={footer}
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
            sx={{ ...folioTextFieldSx }}
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
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
            <TextField
              label="Policy No."
              value={data.policyNo}
              onChange={(e) => handleChange({ policyNo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Paid By"
              value={data.paidBy}
              onChange={(e) => handleChange({ paidBy: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
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
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
          </Box>

          <TextField
            label="Provider to Contact"
            value={data.contactName}
            onChange={(e) => handleChange({ contactName: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />

          <TextField
            label="Contact Address"
            value={data.contactAddress}
            onChange={(e) => handleChange({ contactAddress: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Contact Telephone"
              value={data.contactPhone}
              onChange={(e) => handleChange({ contactPhone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
            <TextField
              label="Contact Email"
              value={data.contactEmail}
              onChange={(e) => handleChange({ contactEmail: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
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
            sx={{ ...folioTextFieldSx }}
          />
        </Box>
      </FolioFieldFade>
    </FolioModal>
  );
};

export default MedicalInsuranceModal;
