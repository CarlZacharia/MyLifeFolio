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

export const EQUIPMENT_TYPES = [
  'Mobility Aid (walker/cane/wheelchair/scooter)',
  'Hearing Aid',
  'Vision Aid (glasses/contacts/magnifiers)',
  'Respiratory (CPAP/BiPAP/nebulizer/oxygen)',
  'Cardiac Device (pacemaker/defibrillator)',
  'Blood Glucose Monitor',
  'Blood Pressure Monitor',
  'Prosthetic/Orthotics',
  'Hospital Bed/Lift',
  'Other',
] as const;

export interface MedicalEquipmentData {
  equipmentName: string;
  equipmentType: string;
  makeModel: string;
  serialNumber: string;
  prescribingPhysician: string;
  supplierName: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierWebsite: string;
  dateObtained: string;
  warrantyExpiration: string;
  nextServiceDate: string;
  maintenanceNotes: string;
  batteryType: string;
  insuranceCovers: boolean;
  insuranceInfo: string;
  replacementCost: string;
  isActive: boolean;
  notes: string;
}

export const emptyEquipment = (): MedicalEquipmentData => ({
  equipmentName: '',
  equipmentType: '',
  makeModel: '',
  serialNumber: '',
  prescribingPhysician: '',
  supplierName: '',
  supplierPhone: '',
  supplierAddress: '',
  supplierWebsite: '',
  dateObtained: '',
  warrantyExpiration: '',
  nextServiceDate: '',
  maintenanceNotes: '',
  batteryType: '',
  insuranceCovers: false,
  insuranceInfo: '',
  replacementCost: '',
  isActive: true,
  notes: '',
});

interface MedicalEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MedicalEquipmentData) => void;
  onDelete?: () => void;
  initialData?: MedicalEquipmentData;
  isEdit?: boolean;
}

const MedicalEquipmentModal: React.FC<MedicalEquipmentModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const { formData } = useFormContext();
  const [data, setData] = useState<MedicalEquipmentData>(initialData || emptyEquipment());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyEquipment());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<MedicalEquipmentData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.equipmentName && !data.equipmentName.trim();
  const canSave = data.equipmentName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ equipmentName: true });
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

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Equipment' : 'Add Equipment'}
      eyebrow="My Life Folio — Medical Equipment"
      maxWidth="md"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Equipment'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Equipment Identity */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Equipment / Device Name"
            value={data.equipmentName}
            onChange={(e) => handleChange({ equipmentName: e.target.value })}
            onBlur={() => handleBlur('equipmentName')}
            error={!!nameError}
            helperText={nameError ? 'Equipment name is required' : 'e.g. "CPAP Machine", "Right Hearing Aid"'}
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
              label="Equipment Type"
              value={data.equipmentType}
              onChange={(e) => handleChange({ equipmentType: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              <MenuItem value=""><em>Select type</em></MenuItem>
              {EQUIPMENT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Make / Model"
              value={data.makeModel}
              onChange={(e) => handleChange({ makeModel: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="Manufacturer and model"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Serial Number"
              value={data.serialNumber}
              onChange={(e) => handleChange({ serialNumber: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Battery Type"
              value={data.batteryType}
              onChange={(e) => handleChange({ batteryType: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder='e.g. "Size 312", "USB-C rechargeable"'
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
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

        {/* Supplier */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Supplier / Vendor
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Supplier Name"
              value={data.supplierName}
              onChange={(e) => handleChange({ supplierName: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder='e.g. "Lincare", "Miracle-Ear"'
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Supplier Phone"
              value={data.supplierPhone}
              onChange={(e) => handleChange({ supplierPhone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Supplier Address"
            value={data.supplierAddress}
            onChange={(e) => handleChange({ supplierAddress: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Supplier Website"
            value={data.supplierWebsite}
            onChange={(e) => handleChange({ supplierWebsite: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        {/* Dates & Service */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Dates & Service
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Date Obtained"
              value={data.dateObtained}
              onChange={(e) => handleChange({ dateObtained: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Warranty Expiration"
              value={data.warrantyExpiration}
              onChange={(e) => handleChange({ warrantyExpiration: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Next Service Date"
              value={data.nextServiceDate}
              onChange={(e) => handleChange({ nextServiceDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Maintenance Notes"
            value={data.maintenanceNotes}
            onChange={(e) => handleChange({ maintenanceNotes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
            placeholder='e.g. "Replace filter monthly, tubing every 3 months"'
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        {/* Insurance & Cost */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Insurance & Cost
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControlLabel
              control={<Checkbox checked={data.insuranceCovers} onChange={(e) => handleChange({ insuranceCovers: e.target.checked })} />}
              label="Insurance Covers"
              sx={{ mt: 0.5 }}
            />
            <TextField
              label="Replacement Cost"
              value={data.replacementCost}
              onChange={(e) => handleChange({ replacementCost: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="$0.00"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        {data.insuranceCovers && (
          <FolioFieldFade visible={fieldsVisible} index={idx++}>
            <TextField
              label="Insurance Details"
              value={data.insuranceInfo}
              onChange={(e) => handleChange({ insuranceInfo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              multiline
              minRows={2}
              fullWidth
              placeholder="Policy number, auth code, coverage details"
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>
        )}

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <FormControlLabel
            control={<Checkbox checked={!data.isActive} onChange={(e) => handleChange({ isActive: !e.target.checked })} />}
            label="Retired / No Longer Used"
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
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default MedicalEquipmentModal;
