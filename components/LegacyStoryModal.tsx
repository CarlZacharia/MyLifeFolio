'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';

export interface StoryData {
  storyTitle: string;
  storyBody: string;
  peopleInvolved: string;
  approximateDate: string;
  location: string;
  lessonsLearned: string;
}

export const emptyStory = (): StoryData => ({
  storyTitle: '', storyBody: '', peopleInvolved: '', approximateDate: '', location: '', lessonsLearned: '',
});

interface Props {
  open: boolean; onClose: () => void; onSave: (data: StoryData) => void;
  onDelete?: () => void; initialData?: StoryData; isEdit?: boolean;
}

const LegacyStoryModal: React.FC<Props> = ({ open, onClose, onSave, onDelete, initialData, isEdit = false }) => {
  const [data, setData] = useState<StoryData>(initialData || emptyStory());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) { setData(isEdit && initialData ? initialData : emptyStory()); setTouched({}); }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<StoryData>) => setData((prev) => ({ ...prev, ...updates }));
  const nameError = touched.storyTitle && !data.storyTitle.trim();
  const canSave = data.storyTitle.trim().length > 0;

  const handleSave = () => {
    if (!canSave) { setTouched({ storyTitle: true }); return; }
    onSave(data); onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal open={open} onClose={onClose}
      title={isEdit ? 'Edit Story' : 'Tell a Story'}
      eyebrow="My Life Folio — Life Stories" maxWidth="md"
      footer={<><Box>{isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}</Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FolioCancelButton onClick={onClose} />
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Save Story'}
          </FolioSaveButton></Box></>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Story Title" value={data.storyTitle}
            onChange={(e) => handleChange({ storyTitle: e.target.value })}
            onBlur={() => setTouched((p) => ({ ...p, storyTitle: true }))}
            error={!!nameError} helperText={nameError ? 'Title is required' : ''}
            required InputLabelProps={{ shrink: true }} fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Your Story" value={data.storyBody}
            onChange={(e) => handleChange({ storyBody: e.target.value })}
            InputLabelProps={{ shrink: true }} multiline minRows={10} fullWidth
            placeholder="Tell the story in your own words..."
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="People Involved" value={data.peopleInvolved}
              onChange={(e) => handleChange({ peopleInvolved: e.target.value })}
              InputLabelProps={{ shrink: true }} placeholder="Names of people in the story"
              sx={{ flex: 1, ...folioTextFieldSx }} />
            <TextField label="Approximate Date" value={data.approximateDate}
              onChange={(e) => handleChange({ approximateDate: e.target.value })}
              InputLabelProps={{ shrink: true }} placeholder='"Summer of 1972"'
              sx={{ flex: 1, ...folioTextFieldSx }} />
          </Box>
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Location" value={data.location}
            onChange={(e) => handleChange({ location: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Lessons Learned" value={data.lessonsLearned}
            onChange={(e) => handleChange({ lessonsLearned: e.target.value })}
            InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth
            placeholder="What did this teach you?"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default LegacyStoryModal;
