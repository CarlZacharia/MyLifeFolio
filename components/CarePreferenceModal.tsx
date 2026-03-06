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
  onSave: (data: CarePreferenceData[]) => void;
  category: string;
  existingEntries: CarePreferenceData[];
}

const CarePreferenceModal: React.FC<CarePreferenceModalProps> = ({
  open,
  onClose,
  onSave,
  category,
  existingEntries,
}) => {
  const selectedCategory = CARE_PREFERENCE_CATEGORIES.find(
    (c) => c.label === category
  );
  const items = selectedCategory?.items || [];

  // Map of item label -> response value
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      // Pre-populate from existing entries
      const map: Record<string, string> = {};
      let existingNotes = '';
      existingEntries.forEach((entry) => {
        if (entry.preferenceItem) {
          map[entry.preferenceItem] = entry.response || '';
        }
        if (entry.notes && !existingNotes) {
          existingNotes = entry.notes;
        }
      });
      setResponses(map);
      setNotes(existingNotes);
    }
  }, [open, existingEntries]);

  const handleResponseChange = (item: string, value: string) => {
    setResponses((prev) => ({ ...prev, [item]: value }));
  };

  const handleSave = () => {
    // Build entries for items that have a response
    const entries: CarePreferenceData[] = items
      .filter((item) => responses[item]?.trim())
      .map((item, idx) => ({
        category,
        preferenceItem: item,
        response: responses[item].trim(),
        notes: idx === 0 ? notes.trim() : '',
      }));
    onSave(entries);
    onClose();
  };

  const filledCount = items.filter((item) => responses[item]?.trim()).length;

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
        {category}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {items.map((item) => (
            <TextField
              key={item}
              label={item}
              value={responses[item] || ''}
              onChange={(e) => handleResponseChange(item, e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          ))}

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save ({filledCount}/{items.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarePreferenceModal;
