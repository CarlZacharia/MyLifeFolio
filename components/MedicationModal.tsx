'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
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

export const MEDICATION_FORMS = [
  'Tablet',
  'Capsule',
  'Liquid',
  'Patch',
  'Injection/Shot',
  'Inhaler',
  'Topical/Cream',
  'Suppository',
  'Other',
] as const;

export const MEDICATION_FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every ___ hours',
  'Weekly',
  'Monthly',
  'As needed (PRN)',
  'Other',
] as const;

export interface MedicationData {
  medicationName: string;
  dosage: string;
  form: string;
  frequency: string;
  frequencyNotes: string;
  prescribingPhysician: string;
  conditionTreated: string;
  pharmacyIndex: number | null;
  rxNumber: string;
  refillsRemaining: string;
  lastFilledDate: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  ndcNumber: string;
  requiresRefrigeration: boolean;
  controlledSubstance: boolean;
  notes: string;
}

export const emptyMedication = (): MedicationData => ({
  medicationName: '',
  dosage: '',
  form: '',
  frequency: '',
  frequencyNotes: '',
  prescribingPhysician: '',
  conditionTreated: '',
  pharmacyIndex: null,
  rxNumber: '',
  refillsRemaining: '',
  lastFilledDate: '',
  startDate: '',
  endDate: '',
  isActive: true,
  ndcNumber: '',
  requiresRefrigeration: false,
  controlledSubstance: false,
  notes: '',
});

interface MedicationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MedicationData) => void;
  onDelete?: () => void;
  initialData?: MedicationData;
  isEdit?: boolean;
}

const MedicationModal: React.FC<MedicationModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const { formData } = useFormContext();
  const [data, setData] = useState<MedicationData>(initialData || emptyMedication());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyMedication());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<MedicationData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.medicationName && !data.medicationName.trim();
  const canSave = data.medicationName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ medicationName: true });
      return;
    }
    onSave(data);
    onClose();
  };

  // Build physician options from existing medical providers
  const physicianOptions = formData.medicalProviders
    .filter((p) => p.name)
    .map((p) => p.name);
  const uniquePhysicians = Array.from(new Set(physicianOptions));

  // Build pharmacy options from saved pharmacies
  const pharmacyOptions = (formData.pharmacies || []).map((p, i) => ({
    label: p.pharmacyName + (p.pharmacyChain ? ` (${p.pharmacyChain})` : ''),
    index: i,
  }));

  const selectedPharmacy = data.pharmacyIndex !== null
    ? pharmacyOptions.find((p) => p.index === data.pharmacyIndex) || null
    : null;

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Medication' : 'Add Medication'}
      eyebrow="My Life Folio — Medications"
      maxWidth="md"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Medication'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Medication Identity */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Medication Name"
            value={data.medicationName}
            onChange={(e) => handleChange({ medicationName: e.target.value })}
            onBlur={() => handleBlur('medicationName')}
            error={!!nameError}
            helperText={nameError ? 'Medication name is required' : 'Brand name + generic, e.g. "Eliquis (apixaban)"'}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Dosage"
              value={data.dosage}
              onChange={(e) => handleChange({ dosage: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder='e.g. "5mg", "10mg/5mL"'
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              select
              label="Form"
              value={data.form}
              onChange={(e) => handleChange({ form: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              <MenuItem value=""><em>Select form</em></MenuItem>
              {MEDICATION_FORMS.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Frequency"
              value={data.frequency}
              onChange={(e) => handleChange({ frequency: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              <MenuItem value=""><em>Select frequency</em></MenuItem>
              {MEDICATION_FREQUENCIES.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Frequency Notes"
              value={data.frequencyNotes}
              onChange={(e) => handleChange({ frequencyNotes: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder='e.g. "with morning meal"'
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Condition Treated"
            value={data.conditionTreated}
            onChange={(e) => handleChange({ conditionTreated: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder='e.g. "Atrial fibrillation", "Type 2 diabetes"'
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        {/* Prescriber & Pharmacy */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Prescriber & Pharmacy
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Autocomplete
            freeSolo
            options={uniquePhysicians}
            value={data.prescribingPhysician}
            onInputChange={(_, value) => handleChange({ prescribingPhysician: value })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Prescribing Physician"
                InputLabelProps={{ shrink: true }}
                placeholder="Type to search physicians or enter name"
                sx={{ ...folioTextFieldSx }}
              />
            )}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete
              options={pharmacyOptions}
              value={selectedPharmacy}
              onChange={(_, value) => handleChange({ pharmacyIndex: value ? value.index : null })}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.index === value.index}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pharmacy"
                  InputLabelProps={{ shrink: true }}
                  placeholder="Select a saved pharmacy"
                  sx={{ ...folioTextFieldSx }}
                />
              )}
              sx={{ flex: 1 }}
              noOptionsText="No pharmacies saved — add one in the Pharmacies tab"
            />
            <TextField
              label="Rx Number"
              value={data.rxNumber}
              onChange={(e) => handleChange({ rxNumber: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 0.7, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Refills Remaining"
              value={data.refillsRemaining}
              onChange={(e) => handleChange({ refillsRemaining: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="number"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Last Filled Date"
              value={data.lastFilledDate}
              onChange={(e) => handleChange({ lastFilledDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        {/* Dates & Status */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Dates & Status
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date"
              value={data.startDate}
              onChange={(e) => handleChange({ startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="End Date"
              value={data.endDate}
              onChange={(e) => handleChange({ endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              helperText="Fill in when discontinued"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="NDC Number"
            value={data.ndcNumber}
            onChange={(e) => handleChange({ ndcNumber: e.target.value })}
            InputLabelProps={{ shrink: true }}
            helperText="National Drug Code — important for emergency responders"
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Checkbox checked={data.requiresRefrigeration} onChange={(e) => handleChange({ requiresRefrigeration: e.target.checked })} />}
              label="Requires Refrigeration"
            />
            <FormControlLabel
              control={<Checkbox checked={data.controlledSubstance} onChange={(e) => handleChange({ controlledSubstance: e.target.checked })} />}
              label="Controlled Substance"
            />
            <FormControlLabel
              control={<Checkbox checked={!data.isActive} onChange={(e) => handleChange({ isActive: !e.target.checked })} />}
              label="Discontinued (Inactive)"
            />
          </Box>
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
            placeholder="Special instructions, known side effects, interactions to watch for"
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default MedicationModal;
