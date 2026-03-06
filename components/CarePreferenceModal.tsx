'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CARE_PREFERENCE_CATEGORIES } from '../lib/carePreferenceCategories';

export interface CarePreferenceData {
  category: string;
  preferenceItem: string;
  response: string;
  notes: string;
}

export const emptyCarePreference = (category: string = ''): CarePreferenceData => ({
  category,
  preferenceItem: '',
  response: '',
  notes: '',
});

interface CarePreferenceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CarePreferenceData) => void;
  onDelete?: () => void;
  initialData?: CarePreferenceData;
  isEdit?: boolean;
  category?: string;
}

const CarePreferenceModal: React.FC<CarePreferenceModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  category,
}) => {
  const [data, setData] = useState<CarePreferenceData>(
    initialData || emptyCarePreference(category)
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(
        isEdit && initialData ? initialData : emptyCarePreference(category)
      );
      setTouched({});
    }
  }, [open, isEdit, initialData, category]);

  const handleChange = (updates: Partial<CarePreferenceData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const selectedCategory = CARE_PREFERENCE_CATEGORIES.find(
    (c) => c.label === (data.category || category)
  );
  const preferenceItems = selectedCategory?.items || [];

  const preferenceItemError = touched.preferenceItem && !data.preferenceItem;
  const canSave = data.preferenceItem.length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ preferenceItem: true });
      return;
    }
    onSave(data);
    onClose();
  };

  const categoryLabel = data.category || category || 'Care Preference';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
        }}
      >
        {isEdit ? `Edit ${categoryLabel}` : `Add ${categoryLabel}`}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {!category && (
            <TextField
              select
              label="Category"
              value={data.category}
              onChange={(e) =>
                handleChange({ category: e.target.value, preferenceItem: '' })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            >
              {CARE_PREFERENCE_CATEGORIES.map((cat) => (
                <MenuItem key={cat.label} value={cat.label}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            select
            label="Preference Item"
            value={data.preferenceItem}
            onChange={(e) => handleChange({ preferenceItem: e.target.value })}
            onBlur={() => handleBlur('preferenceItem')}
            error={!!preferenceItemError}
            helperText={preferenceItemError ? 'Preference item is required' : ''}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            disabled={preferenceItems.length === 0}
          >
            {preferenceItems.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Your Preference / Response"
            value={data.response}
            onChange={(e) => handleChange({ response: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="Describe your preference or decision"
            multiline
            minRows={2}
            fullWidth
          />

          <TextField
            label="Notes"
            value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {isEdit && onDelete && (
          <Button onClick={onDelete} color="error" sx={{ mr: 'auto' }}>
            Delete
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSave}>
          {isEdit ? 'Save Changes' : 'Add Preference'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarePreferenceModal;
