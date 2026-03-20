'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';

export interface MemoryData {
  memoryTitle: string;
  description: string;
  peopleInPhoto: string;
  approximateYear: string;
  location: string;
  tags: string;
  mediaUrl: string;
}

export const emptyMemory = (): MemoryData => ({
  memoryTitle: '', description: '', peopleInPhoto: '', approximateYear: '', location: '', tags: '', mediaUrl: '',
});

interface Props {
  open: boolean; onClose: () => void; onSave: (data: MemoryData) => void;
  onDelete?: () => void; initialData?: MemoryData; isEdit?: boolean;
}

const LegacyMemoryModal: React.FC<Props> = ({ open, onClose, onSave, onDelete, initialData, isEdit = false }) => {
  const [data, setData] = useState<MemoryData>(initialData || emptyMemory());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) { setData(isEdit && initialData ? initialData : emptyMemory()); setTouched({}); }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<MemoryData>) => setData((prev) => ({ ...prev, ...updates }));
  const nameError = touched.memoryTitle && !data.memoryTitle.trim();
  const canSave = data.memoryTitle.trim().length > 0;

  const handleSave = () => {
    if (!canSave) { setTouched({ memoryTitle: true }); return; }
    onSave(data); onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal open={open} onClose={onClose}
      title={isEdit ? 'Edit Memory' : 'Add a Memory'}
      eyebrow="My Life Folio — Memory Vault" maxWidth="sm"
      footer={<><Box>{isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}</Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FolioCancelButton onClick={onClose} />
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Add Memory'}
          </FolioSaveButton></Box></>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Title" value={data.memoryTitle}
            onChange={(e) => handleChange({ memoryTitle: e.target.value })}
            onBlur={() => setTouched((p) => ({ ...p, memoryTitle: true }))}
            error={!!nameError} helperText={nameError ? 'Title is required' : 'Give this memory a name'}
            required InputLabelProps={{ shrink: true }} fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Description" value={data.description}
            onChange={(e) => handleChange({ description: e.target.value })}
            InputLabelProps={{ shrink: true }} multiline minRows={3} fullWidth
            placeholder="What's the story behind this memory?"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="People in Photo" value={data.peopleInPhoto}
              onChange={(e) => handleChange({ peopleInPhoto: e.target.value })}
              InputLabelProps={{ shrink: true }} placeholder="Names of people"
              sx={{ flex: 1, ...folioTextFieldSx }} />
            <TextField label="Approximate Year" value={data.approximateYear}
              onChange={(e) => handleChange({ approximateYear: e.target.value })}
              InputLabelProps={{ shrink: true }} placeholder="e.g. 1985"
              sx={{ flex: 1, ...folioTextFieldSx }} />
          </Box>
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Location" value={data.location}
            onChange={(e) => handleChange({ location: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth placeholder="Where was this?"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Tags" value={data.tags}
            onChange={(e) => handleChange({ tags: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth
            placeholder="e.g. family, vacation, holiday"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Photo / Media Link" value={data.mediaUrl}
            onChange={(e) => handleChange({ mediaUrl: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth
            placeholder="Google Photos, Dropbox, or cloud link"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default LegacyMemoryModal;
