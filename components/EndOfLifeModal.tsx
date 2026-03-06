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
import { END_OF_LIFE_CATEGORIES } from '../lib/endOfLifeCategories';

export interface EndOfLifeData {
  category: string;
  [key: string]: string;
}

export const emptyEndOfLife = (category: string): EndOfLifeData => {
  const cat = END_OF_LIFE_CATEGORIES.find((c) => c.label === category);
  const data: EndOfLifeData = { category };
  cat?.fields.forEach((f) => {
    data[f.name] = '';
  });
  return data;
};

interface EndOfLifeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EndOfLifeData) => void;
  onDelete?: () => void;
  initialData?: EndOfLifeData;
  isEdit?: boolean;
  category: string;
}

const EndOfLifeModal: React.FC<EndOfLifeModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  category,
}) => {
  const [data, setData] = useState<EndOfLifeData>(
    initialData || emptyEndOfLife(category)
  );

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyEndOfLife(category));
    }
  }, [open, isEdit, initialData, category]);

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedCategory = END_OF_LIFE_CATEGORIES.find(
    (c) => c.label === category
  );
  const fields = selectedCategory?.fields || [];

  const handleSave = () => {
    onSave(data);
    onClose();
  };

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
        {isEdit ? `Edit ${category}` : `Add ${category}`}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {fields.map((field) =>
            field.type === 'select' && field.options ? (
              <TextField
                key={field.name}
                select
                label={field.label}
                value={data[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              >
                {field.options.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                key={field.name}
                label={field.label}
                value={data[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                InputLabelProps={{ shrink: true }}
                multiline={field.name === 'notes' || field.type === 'textarea'}
                minRows={field.name === 'notes' || field.type === 'textarea' ? 3 : undefined}
                fullWidth
              />
            )
          )}
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
        <Button onClick={handleSave} variant="contained">
          {isEdit ? 'Save Changes' : 'Add Entry'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EndOfLifeModal;
