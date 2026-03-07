'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Box,
} from '@mui/material';
import { SpecificGiftItem } from '../lib/FormContext';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

interface SpecificGiftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SpecificGiftItem) => void;
  onDelete?: () => void;
  initialData?: SpecificGiftItem;
  isEdit: boolean;
}

const getDefaultSpecificGiftData = (): SpecificGiftItem => ({
  recipientName: '',
  relationship: '',
  description: '',
  notes: '',
});

export const SpecificGiftModal: React.FC<SpecificGiftModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState<SpecificGiftItem>(getDefaultSpecificGiftData());

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultSpecificGiftData());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof SpecificGiftItem) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isValid = formData.recipientName.trim() !== '' && formData.description.trim() !== '';
  const fieldsVisible = useFolioFieldAnimation(open);

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Specific Gift' : 'Add Specific Gift'}
      eyebrow="My Life Folio — Gifts & Bequests"
      maxWidth="md"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? 'Save Changes' : 'Add Gift'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FolioFieldFade visible={fieldsVisible} index={0}>
            <TextField
              fullWidth
              label="Recipient Name"
              value={formData.recipientName}
              onChange={handleChange('recipientName')}
              variant="outlined"
              size="small"
              required
              placeholder="e.g., John Smith"
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>
        </Grid>
        <Grid item xs={12} md={6}>
          <FolioFieldFade visible={fieldsVisible} index={1}>
            <TextField
              fullWidth
              label="Relationship"
              value={formData.relationship}
              onChange={handleChange('relationship')}
              variant="outlined"
              size="small"
              placeholder="e.g., Nephew, Friend, Caregiver"
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>
        </Grid>
        <Grid item xs={12}>
          <FolioFieldFade visible={fieldsVisible} index={2}>
            <TextField
              fullWidth
              label="Item/Description"
              value={formData.description}
              onChange={handleChange('description')}
              variant="outlined"
              size="small"
              required
              multiline
              rows={2}
              placeholder="e.g., My grandmother's diamond ring, the antique grandfather clock in the living room"
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>
        </Grid>
        <Grid item xs={12}>
          <FolioFieldFade visible={fieldsVisible} index={3}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={handleChange('notes')}
              variant="outlined"
              size="small"
              multiline
              rows={2}
              placeholder="Any additional notes about this gift..."
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>
        </Grid>
      </Grid>
    </FolioModal>
  );
};

export default SpecificGiftModal;
