'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Box, Typography, Button, IconButton, LinearProgress, Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation, folioColors,
} from './FolioModal';

// ── Types ──

export interface MemoryFileAttachment {
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface MemoryData {
  memoryTitle: string;
  description: string;
  peopleInPhoto: string;
  approximateYear: string;
  location: string;
  tags: string;
  mediaUrl: string;
  files: MemoryFileAttachment[];
}

export const emptyMemory = (): MemoryData => ({
  memoryTitle: '', description: '', peopleInPhoto: '', approximateYear: '',
  location: '', tags: '', mediaUrl: '', files: [],
});

// ── Constants ──

const ACCEPTED_TYPES = [
  'application/pdf', 'image/gif', 'image/jpeg', 'image/png',
  'image/webp', 'image/bmp', 'image/tiff',
];
const ACCEPT_STRING = '.pdf,.gif,.jpg,.jpeg,.png,.webp,.bmp,.tiff';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TOTAL_FILES = 20;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

// ── Component ──

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: MemoryData, pendingFiles: File[]) => void;
  onDelete?: () => void;
  initialData?: MemoryData;
  isEdit?: boolean;
  totalFileCount: number;
}

const LegacyMemoryModal: React.FC<Props> = ({
  open, onClose, onSave, onDelete, initialData, isEdit = false, totalFileCount,
}) => {
  const [data, setData] = useState<MemoryData>(initialData || emptyMemory());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing files on this memory + pending new ones
  const existingFileCount = data.files?.length || 0;
  const thisMemoryTotal = existingFileCount + pendingFiles.length;
  // How many more can be added globally
  const remainingSlots = MAX_TOTAL_FILES - totalFileCount - pendingFiles.length;
  // Files removed during this edit session (to be cleaned up by parent)
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? { ...initialData, files: initialData.files || [] } : emptyMemory());
      setTouched({});
      setPendingFiles([]);
      setFileError('');
      setRemovedPaths([]);
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<MemoryData>) => setData((prev) => ({ ...prev, ...updates }));
  const nameError = touched.memoryTitle && !data.memoryTitle.trim();
  const canSave = data.memoryTitle.trim().length > 0;

  const handleSave = () => {
    if (!canSave) { setTouched({ memoryTitle: true }); return; }
    onSave({ ...data, _removedPaths: removedPaths } as MemoryData & { _removedPaths: string[] }, pendingFiles);
    onClose();
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setFileError('');

    const newFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" is not a supported file type.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds the 10 MB limit.`);
        continue;
      }
      if (pendingFiles.length + newFiles.length + existingFileCount >= MAX_TOTAL_FILES - (totalFileCount - existingFileCount)) {
        errors.push('Maximum of 20 files across all memories has been reached.');
        break;
      }
      newFiles.push(file);
    }

    if (errors.length > 0) setFileError(errors.join(' '));
    if (newFiles.length > 0) setPendingFiles((prev) => [...prev, ...newFiles]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
    const removed = data.files[index];
    if (removed?.path) setRemovedPaths((prev) => [...prev, removed.path]);
    setData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
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

        {/* ── File Upload ── */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: folioColors.ink, mb: 1 }}>
              Upload Photos or Documents
            </Typography>
            <Typography variant="caption" sx={{ color: folioColors.inkLight, display: 'block', mb: 1.5 }}>
              PDF, GIF, JPEG, PNG, WEBP, BMP, or TIFF — up to 10 MB each.
              {' '}{Math.max(0, remainingSlots)} of {MAX_TOTAL_FILES} upload slots remaining.
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              multiple
              hidden
              onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ''; }}
            />

            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={remainingSlots <= 0}
              size="small"
              sx={{
                borderColor: folioColors.inkLight, color: folioColors.ink,
                '&:hover': { borderColor: folioColors.ink, bgcolor: 'rgba(201,162,39,0.06)' },
              }}
            >
              Choose Files
            </Button>

            {fileError && (
              <Alert severity="warning" sx={{ mt: 1.5, fontSize: '0.8rem' }} onClose={() => setFileError('')}>
                {fileError}
              </Alert>
            )}

            {/* Existing files (already uploaded) */}
            {data.files.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography variant="caption" sx={{ color: folioColors.inkFaint, fontWeight: 600 }}>
                  Uploaded
                </Typography>
                {data.files.map((file, i) => (
                  <Box key={file.path} sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                    bgcolor: folioColors.creamDark, borderRadius: 1,
                  }}>
                    {isImageType(file.type)
                      ? <ImageIcon sx={{ fontSize: 18, color: folioColors.accent }} />
                      : <InsertDriveFileIcon sx={{ fontSize: 18, color: folioColors.accent }} />}
                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.82rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: folioColors.inkFaint, flexShrink: 0 }}>
                      {formatFileSize(file.size)}
                    </Typography>
                    <IconButton size="small" onClick={() => removeExistingFile(i)} sx={{ color: folioColors.inkFaint, p: 0.25 }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Pending files (not yet uploaded) */}
            {pendingFiles.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography variant="caption" sx={{ color: folioColors.inkFaint, fontWeight: 600 }}>
                  Ready to upload
                </Typography>
                {pendingFiles.map((file, i) => (
                  <Box key={`${file.name}-${i}`} sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                    bgcolor: '#e8f5e9', borderRadius: 1,
                  }}>
                    {isImageType(file.type)
                      ? <ImageIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                      : <InsertDriveFileIcon sx={{ fontSize: 18, color: '#2e7d32' }} />}
                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.82rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#558b2f', flexShrink: 0 }}>
                      {formatFileSize(file.size)}
                    </Typography>
                    <IconButton size="small" onClick={() => removePendingFile(i)} sx={{ color: '#558b2f', p: 0.25 }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </FolioFieldFade>

        {/* ── External Link ── */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Photo / Media Link" value={data.mediaUrl}
            onChange={(e) => handleChange({ mediaUrl: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth
            placeholder="Google Photos, Dropbox, or cloud link"
            helperText="You can also link to an external album or cloud folder"
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default LegacyMemoryModal;
