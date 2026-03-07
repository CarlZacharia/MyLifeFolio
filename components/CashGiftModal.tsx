'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Box,
} from '@mui/material';
import { CashGift } from '../lib/FormContext';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

interface CashGiftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CashGift) => void;
  onDelete?: () => void;
  initialData?: CashGift;
  isEdit: boolean;
}

const getDefaultCashGiftData = (): CashGift => ({
  recipientName: '',
  relationship: '',
  amount: '',
  notes: '',
});

export const CashGiftModal: React.FC<CashGiftModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState<CashGift>(getDefaultCashGiftData());

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultCashGiftData());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof CashGift) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isValid = formData.recipientName.trim() !== '' && formData.amount.trim() !== '';
  const fieldsVisible = useFolioFieldAnimation(open);

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Cash Gift' : 'Add Cash Gift'}
      eyebrow="My Life Folio — Gifts & Bequests"
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
              placeholder="e.g., Friend, Niece, Caregiver"
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>
        </Grid>
        <Grid item xs={12}>
          <FolioFieldFade visible={fieldsVisible} index={2}>
            <TextField
              fullWidth
              label="Amount"
              value={formData.amount}
              onChange={handleChange('amount')}
              variant="outlined"
              size="small"
              required
              helperText="e.g., $10,000 or 'My diamond ring'"
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

export default CashGiftModal;
