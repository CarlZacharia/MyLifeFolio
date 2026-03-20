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

export const PROCEDURE_TYPES = [
  'Surgery',
  'Hospitalization',
  'Procedure/Outpatient',
  'Other',
] as const;

export interface SurgeryData {
  procedureName: string;
  procedureType: string;
  procedureDate: string;
  facility: string;
  surgeonPhysician: string;
  notes: string;
}

export const emptySurgery = (): SurgeryData => ({
  procedureName: '',
  procedureType: '',
  procedureDate: '',
  facility: '',
  surgeonPhysician: '',
  notes: '',
});

interface SurgeryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SurgeryData) => void;
  onDelete?: () => void;
  initialData?: SurgeryData;
  isEdit?: boolean;
}

const SurgeryModal: React.FC<SurgeryModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<SurgeryData>(initialData || emptySurgery());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptySurgery());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<SurgeryData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.procedureName && !data.procedureName.trim();
  const canSave = data.procedureName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ procedureName: true });
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
      title={isEdit ? 'Edit Procedure' : 'Add Procedure'}
      eyebrow="My Life Folio — Surgeries & Hospitalizations"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Procedure'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Procedure / Event Name"
            value={data.procedureName}
            onChange={(e) => handleChange({ procedureName: e.target.value })}
            onBlur={() => handleBlur('procedureName')}
            error={!!nameError}
            helperText={nameError ? 'Procedure name is required' : 'e.g. "Right knee replacement", "Appendectomy", "CABG"'}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Type"
              value={data.procedureType}
              onChange={(e) => handleChange({ procedureType: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              <MenuItem value=""><em>Select type</em></MenuItem>
              {PROCEDURE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date"
              value={data.procedureDate}
              onChange={(e) => handleChange({ procedureDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="month"
              helperText="Month/year is fine"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Facility"
            value={data.facility}
            onChange={(e) => handleChange({ facility: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="Hospital or surgery center name"
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Surgeon / Physician"
            value={data.surgeonPhysician}
            onChange={(e) => handleChange({ surgeonPhysician: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="Free text — likely historical"
            fullWidth
            sx={{ ...folioTextFieldSx }}
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
            placeholder='e.g. "No complications", "Followed by 6 weeks PT"'
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default SurgeryModal;
