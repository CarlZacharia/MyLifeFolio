'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Box, MenuItem, FormControlLabel, Checkbox, Typography } from '@mui/material';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';

const RECIPIENT_TYPES = [
  'Spouse/Partner', 'Child', 'Grandchild', 'Sibling', 'Friend', 'Future Descendants', 'Other',
] as const;

const FORMATS = ['Written', 'Audio Recording', 'Video Message'] as const;

const PROMPTS = [
  'What I want you to know about our family',
  'What I am most proud of',
  'Lessons I learned in life',
  'My hopes for your future',
  'Advice I wish someone had given me',
];

export interface LetterData {
  recipientType: string;
  recipientName: string;
  letterBody: string;
  format: string;
  mediaUrl: string;
  isPrivate: boolean;
}

export const emptyLetter = (): LetterData => ({
  recipientType: '', recipientName: '', letterBody: '', format: 'Written', mediaUrl: '', isPrivate: false,
});

interface Props {
  open: boolean; onClose: () => void; onSave: (data: LetterData) => void;
  onDelete?: () => void; initialData?: LetterData; isEdit?: boolean;
}

const LegacyLetterModal: React.FC<Props> = ({ open, onClose, onSave, onDelete, initialData, isEdit = false }) => {
  const [data, setData] = useState<LetterData>(initialData || emptyLetter());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) { setData(isEdit && initialData ? initialData : emptyLetter()); setTouched({}); }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<LetterData>) => setData((prev) => ({ ...prev, ...updates }));
  const canSave = data.recipientName.trim().length > 0 || data.recipientType.length > 0;

  const handleSave = () => { onSave(data); onClose(); };
  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal open={open} onClose={onClose}
      title={isEdit ? 'Edit Letter' : 'Write a Letter'}
      eyebrow="My Life Folio — Letters to Family" maxWidth="md"
      footer={<><Box>{isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}</Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FolioCancelButton onClick={onClose} />
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Save Letter'}
          </FolioSaveButton></Box></>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Recipient Type" value={data.recipientType}
              onChange={(e) => handleChange({ recipientType: e.target.value })}
              InputLabelProps={{ shrink: true }} sx={{ flex: 1, ...folioTextFieldSx }}>
              <MenuItem value=""><em>Select type</em></MenuItem>
              {RECIPIENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Recipient Name" value={data.recipientName}
              onChange={(e) => handleChange({ recipientName: e.target.value })}
              InputLabelProps={{ shrink: true }} placeholder="Who is this letter for?"
              sx={{ flex: 1, ...folioTextFieldSx }} />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 0.5 }}>
            Some ideas to get you started:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {PROMPTS.map((p, i) => <span key={i}>{i > 0 ? ' · ' : ''}<em>{p}</em></span>)}
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Your Letter" value={data.letterBody}
            onChange={(e) => handleChange({ letterBody: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline minRows={12} fullWidth
            placeholder="Dear..."
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Format" value={data.format}
              onChange={(e) => handleChange({ format: e.target.value })}
              InputLabelProps={{ shrink: true }} sx={{ flex: 1, ...folioTextFieldSx }}>
              {FORMATS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </TextField>
            {data.format !== 'Written' && (
              <TextField label="Media URL" value={data.mediaUrl}
                onChange={(e) => handleChange({ mediaUrl: e.target.value })}
                InputLabelProps={{ shrink: true }} placeholder="Link to audio or video"
                sx={{ flex: 1, ...folioTextFieldSx }} />
            )}
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <FormControlLabel
            control={<Checkbox checked={data.isPrivate} onChange={(e) => handleChange({ isPrivate: e.target.checked })} />}
            label="Private — only I can see this letter"
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default LegacyLetterModal;
