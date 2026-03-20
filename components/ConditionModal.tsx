'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';
import { useFormContext } from '../lib/FormContext';

export const CONDITION_STATUSES = [
  'Active',
  'In Remission',
  'Resolved',
] as const;

export interface ConditionData {
  conditionName: string;
  diagnosedDate: string;
  treatingPhysician: string;
  status: string;
  notes: string;
}

export const emptyCondition = (): ConditionData => ({
  conditionName: '',
  diagnosedDate: '',
  treatingPhysician: '',
  status: 'Active',
  notes: '',
});

interface ConditionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ConditionData) => void;
  onDelete?: () => void;
  initialData?: ConditionData;
  isEdit?: boolean;
}

const ConditionModal: React.FC<ConditionModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const { formData } = useFormContext();
  const [data, setData] = useState<ConditionData>(initialData || emptyCondition());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyCondition());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<ConditionData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.conditionName && !data.conditionName.trim();
  const canSave = data.conditionName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ conditionName: true });
      return;
    }
    onSave(data);
    onClose();
  };

  const physicianOptions = formData.medicalProviders
    .filter((p) => p.name)
    .map((p) => p.name);
  const uniquePhysicians = Array.from(new Set(physicianOptions));

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Condition' : 'Add Condition'}
      eyebrow="My Life Folio — Medical Conditions"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Condition'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Condition Name"
            value={data.conditionName}
            onChange={(e) => handleChange({ conditionName: e.target.value })}
            onBlur={() => handleBlur('conditionName')}
            error={!!nameError}
            helperText={nameError ? 'Condition name is required' : 'e.g. "Type 2 Diabetes", "Atrial Fibrillation", "COPD"'}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Date Diagnosed"
              value={data.diagnosedDate}
              onChange={(e) => handleChange({ diagnosedDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="month"
              helperText="Month/year is fine"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              select
              label="Status"
              value={data.status}
              onChange={(e) => handleChange({ status: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              {CONDITION_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Autocomplete
            freeSolo
            options={uniquePhysicians}
            value={data.treatingPhysician}
            onInputChange={(_, value) => handleChange({ treatingPhysician: value })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Treating Physician"
                InputLabelProps={{ shrink: true }}
                placeholder="Type to search physicians or enter name"
                sx={{ ...folioTextFieldSx }}
              />
            )}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Notes"
            value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
            placeholder='e.g. "Well controlled on medication", "Monitoring annually"'
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default ConditionModal;
