'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Box, FormControlLabel, Checkbox } from '@mui/material';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';

export interface VideoData {
  videoTitle: string;
  recordingDate: string;
  description: string;
  cloudLink: string;
  isPrivate: boolean;
  transcript: string;
}

export const emptyVideo = (): VideoData => ({
  videoTitle: '', recordingDate: '', description: '', cloudLink: '', isPrivate: false, transcript: '',
});

interface Props {
  open: boolean; onClose: () => void; onSave: (data: VideoData) => void;
  onDelete?: () => void; initialData?: VideoData; isEdit?: boolean;
}

const LegacyVideoModal: React.FC<Props> = ({ open, onClose, onSave, onDelete, initialData, isEdit = false }) => {
  const [data, setData] = useState<VideoData>(initialData || emptyVideo());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) { setData(isEdit && initialData ? initialData : emptyVideo()); setTouched({}); }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<VideoData>) => setData((prev) => ({ ...prev, ...updates }));
  const nameError = touched.videoTitle && !data.videoTitle.trim();
  const canSave = data.videoTitle.trim().length > 0;

  const handleSave = () => {
    if (!canSave) { setTouched({ videoTitle: true }); return; }
    onSave(data); onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal open={open} onClose={onClose}
      title={isEdit ? 'Edit Video' : 'Add Video'}
      eyebrow="My Life Folio — Video Legacy" maxWidth="sm"
      footer={<><Box>{isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}</Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FolioCancelButton onClick={onClose} />
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Add Video'}
          </FolioSaveButton></Box></>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Video Title" value={data.videoTitle}
            onChange={(e) => handleChange({ videoTitle: e.target.value })}
            onBlur={() => setTouched((p) => ({ ...p, videoTitle: true }))}
            error={!!nameError} helperText={nameError ? 'Title is required' : 'e.g. "My life story", "Message to my grandchildren"'}
            required InputLabelProps={{ shrink: true }} fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Recording Date" value={data.recordingDate}
            onChange={(e) => handleChange({ recordingDate: e.target.value })}
            InputLabelProps={{ shrink: true }} type="date" sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Description" value={data.description}
            onChange={(e) => handleChange({ description: e.target.value })}
            InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth
            placeholder="What does this video cover?"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Video Link" value={data.cloudLink}
            onChange={(e) => handleChange({ cloudLink: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth
            placeholder="YouTube (unlisted), Vimeo, Google Drive link"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Transcript" value={data.transcript}
            onChange={(e) => handleChange({ transcript: e.target.value })}
            InputLabelProps={{ shrink: true }} multiline minRows={3} fullWidth
            placeholder="Optional text transcript"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <FormControlLabel
            control={<Checkbox checked={data.isPrivate} onChange={(e) => handleChange({ isPrivate: e.target.checked })} />}
            label="Private — only I can see this video"
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default LegacyVideoModal;
