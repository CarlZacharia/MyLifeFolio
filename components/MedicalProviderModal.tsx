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
  providerCategory: 'clientPCP' | 'clientSpecialist' | 'spousePCP' | 'spouseSpecialist'
    | 'clientHospital' | 'spouseHospital'
    | 'clientUrgentCare' | 'spouseUrgentCare'
    | 'clientHomeHealth' | 'spouseHomeHealth'
    | 'clientRehab' | 'spouseRehab'
    | 'clientPhysicalTherapy' | 'spousePhysicalTherapy';
  specialistType: string;
  name: string;
  firmName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export type FacilityCategory =
  | 'clientHospital' | 'spouseHospital'
  | 'clientUrgentCare' | 'spouseUrgentCare'
  | 'clientHomeHealth' | 'spouseHomeHealth'
  | 'clientRehab' | 'spouseRehab'
  | 'clientPhysicalTherapy' | 'spousePhysicalTherapy';

const FACILITY_CATEGORIES: FacilityCategory[] = [
  'clientHospital', 'spouseHospital',
  'clientUrgentCare', 'spouseUrgentCare',
  'clientHomeHealth', 'spouseHomeHealth',
  'clientRehab', 'spouseRehab',
  'clientPhysicalTherapy', 'spousePhysicalTherapy',
];

const FACILITY_LABELS: Record<string, string> = {
  clientHospital: 'Preferred Hospital',
  spouseHospital: 'Preferred Hospital',
  clientUrgentCare: 'Preferred Urgent Care / ER',
  spouseUrgentCare: 'Preferred Urgent Care / ER',
  clientHomeHealth: 'Preferred Home Health Agency',
  spouseHomeHealth: 'Preferred Home Health Agency',
  clientRehab: 'Preferred Rehabilitation Facility',
  spouseRehab: 'Preferred Rehabilitation Facility',
  clientPhysicalTherapy: 'Preferred Physical Therapy',
  spousePhysicalTherapy: 'Preferred Physical Therapy',
};

export const isFacilityCategory = (cat: MedicalProviderData['providerCategory']): boolean =>
  FACILITY_CATEGORIES.includes(cat as FacilityCategory);

export const getFacilityLabel = (cat: MedicalProviderData['providerCategory']): string =>
  FACILITY_LABELS[cat] || '';

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
  const isFacility = isFacilityCategory(providerCategory);
  const isSpouse = providerCategory.startsWith('spouse');
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

  const facilityLabel = getFacilityLabel(providerCategory);
  const typeLabel = isFacility ? facilityLabel : isSpecialist ? 'Specialist' : 'PCP';
  const title = isEdit
    ? `Edit ${personLabel} ${typeLabel}`
    : `Add ${personLabel} ${typeLabel}`;

  const fieldsVisible = useFolioFieldAnimation(open);

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={title}
      eyebrow="My Life Folio — Medical Providers"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : `Add ${typeLabel}`}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {isSpecialist && (
          <FolioFieldFade visible={fieldsVisible} index={0}>
            <TextField
              select
              label="Advisor Type"
              value={data.specialistType}
              onChange={(e) => handleChange({ specialistType: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ ...folioTextFieldSx }}
            >
              {SPECIALIST_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </FolioFieldFade>
        )}

        <FolioFieldFade visible={fieldsVisible} index={isSpecialist ? 1 : 0}>
          <TextField
            label={isFacility ? 'Facility Name' : "Physician's Name"}
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

        <FolioFieldFade visible={fieldsVisible} index={isSpecialist ? 2 : 1}>
          <TextField
            label={isFacility ? 'Organization / Network' : 'Firm/Practice Name'}
            value={data.firmName}
            onChange={(e) => handleChange({ firmName: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={isSpecialist ? 3 : 2}>
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

        <FolioFieldFade visible={fieldsVisible} index={isSpecialist ? 4 : 3}>
          <TextField
            label="Address"
            value={data.address}
            onChange={(e) => handleChange({ address: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={isSpecialist ? 5 : 4}>
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

export default MedicalProviderModal;
