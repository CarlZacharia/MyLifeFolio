'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

export interface PharmacyData {
  pharmacyName: string;
  pharmacyChain: string;
  phone: string;
  fax: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  pharmacistName: string;
  accountNumber: string;
  specialty: boolean;
  mailOrder: boolean;
  notes: string;
  isPrimary: boolean;
  isActive: boolean;
}

export const emptyPharmacy = (): PharmacyData => ({
  pharmacyName: '',
  pharmacyChain: '',
  phone: '',
  fax: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  hours: '',
  pharmacistName: '',
  accountNumber: '',
  specialty: false,
  mailOrder: false,
  notes: '',
  isPrimary: false,
  isActive: true,
});

interface PharmacyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PharmacyData) => void;
  onDelete?: () => void;
  initialData?: PharmacyData;
  isEdit?: boolean;
}

const PharmacyModal: React.FC<PharmacyModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<PharmacyData>(initialData || emptyPharmacy());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyPharmacy());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<PharmacyData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.pharmacyName && !data.pharmacyName.trim();
  const canSave = data.pharmacyName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ pharmacyName: true });
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
      title={isEdit ? 'Edit Pharmacy' : 'Add Pharmacy'}
      eyebrow="My Life Folio — Pharmacies"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Pharmacy'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Pharmacy Name"
              value={data.pharmacyName}
              onChange={(e) => handleChange({ pharmacyName: e.target.value })}
              onBlur={() => handleBlur('pharmacyName')}
              error={!!nameError}
              helperText={nameError ? 'Pharmacy name is required' : ''}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 2, ...folioTextFieldSx }}
            />
            <TextField
              label="Chain"
              value={data.pharmacyChain}
              onChange={(e) => handleChange({ pharmacyChain: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="CVS, Walgreens, etc."
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone"
              value={data.phone}
              onChange={(e) => handleChange({ phone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Fax"
              value={data.fax}
              onChange={(e) => handleChange({ fax: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Address
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Street Address"
            value={data.address}
            onChange={(e) => handleChange({ address: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={data.city}
              onChange={(e) => handleChange({ city: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 2, ...folioTextFieldSx }}
            />
            <TextField
              label="State"
              value={data.state}
              onChange={(e) => handleChange({ state: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ maxLength: 2 }}
              placeholder="FL"
              sx={{ flex: 0.7, ...folioTextFieldSx }}
            />
            <TextField
              label="ZIP"
              value={data.zip}
              onChange={(e) => handleChange({ zip: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Details
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Hours"
              value={data.hours}
              onChange={(e) => handleChange({ hours: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="Mon-Fri 9am-6pm, Sat 9am-1pm"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Pharmacist Name"
              value={data.pharmacistName}
              onChange={(e) => handleChange({ pharmacistName: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Account / Patient Number"
            value={data.accountNumber}
            onChange={(e) => handleChange({ accountNumber: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Checkbox checked={data.isPrimary} onChange={(e) => handleChange({ isPrimary: e.target.checked })} />}
              label="Primary Pharmacy"
            />
            <FormControlLabel
              control={<Checkbox checked={data.specialty} onChange={(e) => handleChange({ specialty: e.target.checked })} />}
              label="Specialty Pharmacy"
            />
            <FormControlLabel
              control={<Checkbox checked={data.mailOrder} onChange={(e) => handleChange({ mailOrder: e.target.checked })} />}
              label="Mail Order"
            />
            <FormControlLabel
              control={<Checkbox checked={!data.isActive} onChange={(e) => handleChange({ isActive: !e.target.checked })} />}
              label="Inactive"
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
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default PharmacyModal;
