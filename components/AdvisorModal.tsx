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
  'Clergy',
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
  const fieldsVisible = useFolioFieldAnimation(open);

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
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Advisor' : 'Add Advisor'}
      eyebrow="My Life Folio — People & Advisors"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Entry'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={0}>
          <TextField
            select
            label="Advisor Type"
            value={data.advisorType}
            onChange={(e) => handleChange({ advisorType: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            {ADVISOR_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={1}>
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
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={2}>
          <TextField
            label="Firm/Practice Name"
            value={data.firmName}
            onChange={(e) => handleChange({ firmName: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={3}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone"
              value={data.phone}
              onChange={(e) => handleChange({ phone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Email"
              value={data.email}
              onChange={(e) => handleChange({ email: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={4}>
          <TextField
            label="Address"
            value={data.address}
            onChange={(e) => handleChange({ address: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={5}>
          <TextField
            label="Notes"
            value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default AdvisorModal;
