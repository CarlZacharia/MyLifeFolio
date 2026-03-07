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
import {
  EXPENSE_CATEGORIES,
  EXPENSE_FREQUENCY_OPTIONS,
} from '../lib/expenseCategories';

export interface ExpenseData {
  category: string;
  expenseType: string;
  paidTo: string;
  frequency: string;
  amount: string;
  notes: string;
}

export const emptyExpense = (category: string = ''): ExpenseData => ({
  category,
  expenseType: '',
  paidTo: '',
  frequency: '',
  amount: '',
  notes: '',
});

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ExpenseData) => void;
  onDelete?: () => void;
  initialData?: ExpenseData;
  isEdit?: boolean;
  category?: string;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  category,
}) => {
  const [data, setData] = useState<ExpenseData>(
    initialData || emptyExpense(category)
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      setData(
        isEdit && initialData ? initialData : emptyExpense(category)
      );
      setTouched({});
    }
  }, [open, isEdit, initialData, category]);

  const handleChange = (updates: Partial<ExpenseData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Get expense types for the selected category
  const selectedCategory = EXPENSE_CATEGORIES.find(
    (c) => c.label === (data.category || category)
  );
  const expenseTypes = selectedCategory?.types || [];

  const expenseTypeError = touched.expenseType && !data.expenseType;
  const canSave = data.expenseType.length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ expenseType: true });
      return;
    }
    onSave(data);
    onClose();
  };

  const categoryLabel = data.category || category || 'Expense';

  let fieldIndex = 0;

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${categoryLabel} Expense` : `Add ${categoryLabel} Expense`}
      eyebrow="My Life Folio — Expenses"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Entry'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {!category && (
          <FolioFieldFade visible={fieldsVisible} index={fieldIndex++}>
            <TextField
              select
              label="Category"
              value={data.category}
              onChange={(e) =>
                handleChange({ category: e.target.value, expenseType: '' })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              sx={{ ...folioTextFieldSx }}
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <MenuItem key={cat.label} value={cat.label}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>
          </FolioFieldFade>
        )}

        <FolioFieldFade visible={fieldsVisible} index={fieldIndex++}>
          <TextField
            select
            label="Expense Type"
            value={data.expenseType}
            onChange={(e) => handleChange({ expenseType: e.target.value })}
            onBlur={() => handleBlur('expenseType')}
            error={!!expenseTypeError}
            helperText={expenseTypeError ? 'Expense type is required' : ''}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            disabled={expenseTypes.length === 0}
            sx={{ ...folioTextFieldSx }}
          >
            {expenseTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={fieldIndex++}>
          <TextField
            label="Paid To"
            value={data.paidTo}
            onChange={(e) => handleChange({ paidTo: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="e.g., Florida Power & Light"
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={fieldIndex++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="How Often Paid"
              value={data.frequency}
              onChange={(e) => handleChange({ frequency: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              {EXPENSE_FREQUENCY_OPTIONS.map((freq) => (
                <MenuItem key={freq} value={freq}>
                  {freq}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amount"
              value={data.amount}
              onChange={(e) => handleChange({ amount: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="$0.00"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={fieldIndex++}>
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

export default ExpenseModal;
