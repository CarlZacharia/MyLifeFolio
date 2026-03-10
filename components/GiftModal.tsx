'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';
import CurrencyInput from './CurrencyInput';

export const GIFT_TYPES = [
  'Cash',
  'Real Property',
  'Vehicle',
  'Stocks / Securities',
  'Business Interest',
  'Personal Property',
  'Education / Tuition',
  'Medical Expenses',
  'Loan Forgiveness',
  'Trust Distribution',
  'Other',
] as const;

export const RELATIONSHIP_TYPES = [
  'Son',
  'Daughter',
  'Grandchild',
  'Sibling',
  'Niece / Nephew',
  'Friend',
  'Charity',
  'Other',
] as const;

export interface GiftData {
  recipientName: string;
  relationship: string;
  giftType: string;
  description: string;
  amount: string;
  dateGiven: string;
  reduceInheritance: boolean;
  documentation: string;
  notes: string;
}

export const emptyGift: GiftData = {
  recipientName: '',
  relationship: '',
  giftType: '',
  description: '',
  amount: '',
  dateGiven: '',
  reduceInheritance: false,
  documentation: '',
  notes: '',
};

interface GiftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: GiftData) => void;
  onDelete?: () => void;
  initialData?: GiftData;
  isEdit?: boolean;
}

const GiftModal: React.FC<GiftModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<GiftData>(initialData || emptyGift);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyGift);
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<GiftData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const recipientError = touched.recipientName && !data.recipientName;
  const giftTypeError = touched.giftType && !data.giftType;
  const canSave = data.recipientName.length > 0 && data.giftType.length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ recipientName: true, giftType: true });
      return;
    }
    onSave(data);
    onClose();
  };

  const footer = (
    <>
      <Box>
        {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <FolioCancelButton onClick={onClose} />
        <FolioSaveButton onClick={handleSave} disabled={!canSave}>
          {isEdit ? 'Save Changes' : 'Add Gift'}
        </FolioSaveButton>
      </Box>
    </>
  );

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Gift' : 'Add Gift'}
      eyebrow="My Life Folio — Gifts & Advancements"
      maxWidth="sm"
      footer={footer}
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Recipient Name"
              value={data.recipientName}
              onChange={(e) => handleChange({ recipientName: e.target.value })}
              onBlur={() => handleBlur('recipientName')}
              error={!!recipientError}
              helperText={recipientError ? 'Recipient is required' : ''}
              required
              InputLabelProps={{ shrink: true }}
              placeholder="e.g., John Smith"
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
            <TextField
              select
              label="Relationship"
              value={data.relationship}
              onChange={(e) => handleChange({ relationship: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
            >
              {RELATIONSHIP_TYPES.map((rel) => (
                <MenuItem key={rel} value={rel}>{rel}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Gift Type"
              value={data.giftType}
              onChange={(e) => handleChange({ giftType: e.target.value })}
              onBlur={() => handleBlur('giftType')}
              error={!!giftTypeError}
              helperText={giftTypeError ? 'Gift type is required' : ''}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
            >
              {GIFT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date Given"
              type="date"
              value={data.dateGiven}
              onChange={(e) => handleChange({ dateGiven: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Description"
              value={data.description}
              onChange={(e) => handleChange({ description: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g., Down payment for house on Elm St."
              sx={{ ...folioTextFieldSx, flex: 2 }}
            />
            <CurrencyInput
              label="Amount / Value"
              value={data.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange({ amount: e.target.value })}
              InputLabelProps={{ shrink: true }}
              name="giftAmount"
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={data.reduceInheritance}
                onChange={(e) => handleChange({ reduceInheritance: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Count against inheritance share
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  If checked, this gift should reduce the recipient&apos;s share of the estate
                </Typography>
              </Box>
            }
          />

          <TextField
            label="Documentation"
            value={data.documentation}
            onChange={(e) => handleChange({ documentation: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="e.g., Deed transfer recorded 1/15/2024, check #4521"
            sx={{ ...folioTextFieldSx }}
          />

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
        </Box>
      </FolioFieldFade>
    </FolioModal>
  );
};

export default GiftModal;
