'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { CARE_PREFERENCE_CATEGORIES } from '../lib/carePreferenceCategories';
import FolioModal, {
  folioColors,
  folioLabelSx,
  folioInputSx,
  FolioOptionalBadge,
  FolioCancelButton,
  FolioSaveButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

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

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
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

  const footer = (
    <>
      <Box
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '13px',
          fontWeight: 400,
          color: folioColors.inkLight,
        }}
      >
        {filledCount} of {items.length} fields completed
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <FolioCancelButton onClick={onClose} />
        <FolioSaveButton onClick={handleSave}>Save Preferences</FolioSaveButton>
      </Box>
    </>
  );

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={category}
      eyebrow="My Life Folio — Care Preferences"
      footer={footer}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {items.map((item, idx) => (
          <FolioFieldFade key={item} visible={fieldsVisible} index={idx}>
            <Box sx={folioLabelSx}>{item}</Box>
            <Box
              component="input"
              type="text"
              value={responses[item] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleResponseChange(item, e.target.value)
              }
              placeholder="Enter your preference..."
              sx={folioInputSx}
            />
          </FolioFieldFade>
        ))}

        {/* Notes field */}
        <FolioFieldFade visible={fieldsVisible} index={items.length}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={folioLabelSx}>Notes</Box>
            <FolioOptionalBadge />
          </Box>
          <Box
            component="textarea"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNotes(e.target.value)
            }
            placeholder="Any additional notes for this category..."
            rows={3}
            sx={{
              ...folioInputSx,
              resize: 'vertical' as const,
              minHeight: '72px',
            }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default CarePreferenceModal;
