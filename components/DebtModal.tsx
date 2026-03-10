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
import CurrencyInput from './CurrencyInput';

export const DEBT_TYPES = [
  'Mortgage',
  'Home Equity Loan',
  'Home Equity Line of Credit',
  'Vehicle Loan',
  'Student Loan',
  'Personal Line of Credit',
  'Credit Card',
  'Medical Debt',
  'Business Loan',
  'Tax Debt',
  'Personal Loan',
  'Other',
] as const;

export interface DebtData {
  type: string;
  dateIncurred: string;
  description: string;
  amount: string;
  notes: string;
}

const emptyDebt: DebtData = {
  type: '',
  dateIncurred: '',
  description: '',
  amount: '',
  notes: '',
};

interface DebtModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DebtData) => void;
  onDelete?: () => void;
  initialData?: DebtData;
  isEdit?: boolean;
}

const DebtModal: React.FC<DebtModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<DebtData>(initialData || emptyDebt);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyDebt);
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<DebtData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const typeError = touched.type && !data.type;
  const canSave = data.type.length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ type: true });
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
          {isEdit ? 'Save Changes' : 'Add Debt'}
        </FolioSaveButton>
      </Box>
    </>
  );

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Debt' : 'Add Debt'}
      eyebrow="My Life Folio — Debts"
      maxWidth="sm"
      footer={footer}
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Type"
              value={data.type}
              onChange={(e) => handleChange({ type: e.target.value })}
              onBlur={() => handleBlur('type')}
              error={!!typeError}
              helperText={typeError ? 'Type is required' : ''}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx, flex: 1 }}
            >
              {DEBT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date Incurred"
              type="date"
              value={data.dateIncurred}
              onChange={(e) => handleChange({ dateIncurred: e.target.value })}
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
              placeholder="e.g., Chase Bank, Wells Fargo Auto"
              sx={{ ...folioTextFieldSx, flex: 2 }}
            />
            <CurrencyInput
              label="Amount"
              value={data.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange({ amount: e.target.value })}
              InputLabelProps={{ shrink: true }}
              name="debtAmount"
              sx={{ ...folioTextFieldSx, flex: 1 }}
            />
          </Box>

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

export default DebtModal;
