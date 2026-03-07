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
  const fieldsVisible = useFolioFieldAnimation(open);

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
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${category}` : `Add ${category}`}
      eyebrow="My Life Folio — End of Life"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave}>
              {isEdit ? 'Save Changes' : 'Add Entry'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {fields.map((field, idx) => (
          <FolioFieldFade key={field.name} visible={fieldsVisible} index={idx}>
            {field.type === 'select' && field.options ? (
              <TextField
                select
                label={field.label}
                value={data[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ ...folioTextFieldSx }}
              >
                {field.options.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label={field.label}
                value={data[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                InputLabelProps={{ shrink: true }}
                multiline={field.name === 'notes' || field.type === 'textarea'}
                minRows={field.name === 'notes' || field.type === 'textarea' ? 3 : undefined}
                fullWidth
                sx={{ ...folioTextFieldSx }}
              />
            )}
          </FolioFieldFade>
        ))}
      </Box>
    </FolioModal>
  );
};

export default EndOfLifeModal;
