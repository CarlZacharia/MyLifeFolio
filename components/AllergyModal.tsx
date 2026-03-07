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

export const ALLERGY_TYPES = [
  'Medication',
  'Food',
  'Environmental',
  'Material/Contact',
  'Other',
] as const;

export const ALLERGY_SEVERITIES = [
  'Mild',
  'Moderate',
  'Severe / Anaphylactic',
] as const;

export interface AllergyData {
  allergen: string;
  allergyType: string;
  reaction: string;
  severity: string;
}

export const emptyAllergy = (): AllergyData => ({
  allergen: '',
  allergyType: '',
  reaction: '',
  severity: '',
});

interface AllergyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AllergyData) => void;
  onDelete?: () => void;
  initialData?: AllergyData;
  isEdit?: boolean;
}

const AllergyModal: React.FC<AllergyModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<AllergyData>(initialData || emptyAllergy());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyAllergy());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<AllergyData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.allergen && !data.allergen.trim();
  const canSave = data.allergen.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ allergen: true });
      return;
    }
    onSave(data);
    onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Allergy' : 'Add Allergy'}
      eyebrow="My Life Folio — Allergies"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Allergy'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Allergen"
            value={data.allergen}
            onChange={(e) => handleChange({ allergen: e.target.value })}
            onBlur={() => handleBlur('allergen')}
            error={!!nameError}
            helperText={nameError ? 'Allergen is required' : 'e.g. "Penicillin", "Shellfish", "Latex"'}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            select
            label="Allergy Type"
            value={data.allergyType}
            onChange={(e) => handleChange({ allergyType: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            <MenuItem value=""><em>Select type</em></MenuItem>
            {ALLERGY_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Reaction"
            value={data.reaction}
            onChange={(e) => handleChange({ reaction: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder='e.g. "Hives", "Anaphylaxis", "GI distress"'
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            select
            label="Severity"
            value={data.severity}
            onChange={(e) => handleChange({ severity: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            <MenuItem value=""><em>Select severity</em></MenuItem>
            {ALLERGY_SEVERITIES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default AllergyModal;
