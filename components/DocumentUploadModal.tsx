'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, MenuItem, Typography, LinearProgress, Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolioModal, {
  folioColors, folioTextFieldSx, folioLabelSx,
  FolioFieldFade, FolioCancelButton, FolioSaveButton,
  useFolioFieldAnimation,
} from './FolioModal';
import {
  SENSITIVITY_LABELS, SensitivityLevel,
  ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB,
} from '../lib/documentVaultCategories';

export interface DocumentUploadData {
  file: File;
  documentName: string;
  description: string;
  documentDate: string;
  expirationDate: string;
  sensitivity: SensitivityLevel;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: DocumentUploadData) => Promise<void>;
  categoryLabel: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DocumentUploadModal: React.FC<Props> = ({ open, onClose, onSave, categoryLabel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldsVisible = useFolioFieldAnimation(open);

  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('normal');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileError, setFileError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset on open
  useEffect(() => {
    if (open) {
      setFile(null);
      setDocumentName('');
      setDescription('');
      setDocumentDate('');
      setExpirationDate('');
      setSensitivity('normal');
      setUploading(false);
      setUploadError('');
      setFileError('');
      setTouched({});
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setFile(selected);
    // Auto-populate document name from filename (without extension)
    if (!documentName.trim()) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setDocumentName(nameWithoutExt);
    }
  };

  const nameError = touched.documentName && !documentName.trim();
  const canSave = !!file && documentName.trim().length > 0 && !uploading;

  const handleSave = async () => {
    if (!canSave || !file) return;
    setUploading(true);
    setUploadError('');
    try {
      await onSave({
        file,
        documentName: documentName.trim(),
        description: description.trim(),
        documentDate,
        expirationDate,
        sensitivity,
      });
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={`Upload to ${categoryLabel}`}
      eyebrow="Documents Vault"
      maxWidth="sm"
      footer={
        <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
          <FolioCancelButton onClick={onClose} />
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            {uploading ? 'Uploading…' : 'Upload Document'}
          </FolioSaveButton>
        </Box>
      }
    >
      {/* Drop zone / file selector */}
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${file ? folioColors.accentWarm : folioColors.parchment}`,
            borderRadius: '8px',
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: file ? 'rgba(139,105,20,0.04)' : '#ffffff',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: folioColors.accentWarm,
              bgcolor: 'rgba(139,105,20,0.04)',
            },
            mb: 2.5,
          }}
        >
          {file ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
              <InsertDriveFileIcon sx={{ color: folioColors.accent, fontSize: 28 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: folioColors.ink }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: folioColors.inkLight }}>
                  {formatFileSize(file.size)} — Click to change
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 40, color: folioColors.inkFaint, mb: 1 }} />
              <Typography variant="body2" sx={{ color: folioColors.inkLight, fontWeight: 500 }}>
                Click to select a file
              </Typography>
              <Typography variant="caption" sx={{ color: folioColors.inkFaint }}>
                PDF, JPG, PNG, HEIC, WEBP, DOC, DOCX, TXT — up to {MAX_FILE_SIZE_MB}MB
              </Typography>
            </>
          )}
        </Box>
        {fileError && <Alert severity="error" sx={{ mb: 2 }}>{fileError}</Alert>}
      </FolioFieldFade>

      {/* Document Name */}
      <FolioFieldFade visible={fieldsVisible} index={1}>
        <Box sx={{ mb: 2 }}>
          <Box sx={folioLabelSx}>Document Name *</Box>
          <TextField
            fullWidth size="small"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, documentName: true }))}
            error={!!nameError}
            helperText={nameError ? 'Document name is required' : ''}
            placeholder="e.g. Last Will and Testament"
            sx={folioTextFieldSx}
          />
        </Box>
      </FolioFieldFade>

      {/* Description */}
      <FolioFieldFade visible={fieldsVisible} index={2}>
        <Box sx={{ mb: 2 }}>
          <Box sx={folioLabelSx}>Description</Box>
          <TextField
            fullWidth size="small" multiline rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description or notes (optional)"
            sx={folioTextFieldSx}
          />
        </Box>
      </FolioFieldFade>

      {/* Dates row */}
      <FolioFieldFade visible={fieldsVisible} index={3}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={folioLabelSx}>Document Date</Box>
            <TextField
              fullWidth size="small" type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={folioTextFieldSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={folioLabelSx}>Expiration Date</Box>
            <TextField
              fullWidth size="small" type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={folioTextFieldSx}
            />
          </Box>
        </Box>
      </FolioFieldFade>

      {/* Sensitivity */}
      <FolioFieldFade visible={fieldsVisible} index={4}>
        <Box sx={{ mb: 2 }}>
          <Box sx={folioLabelSx}>Sensitivity Level</Box>
          <TextField
            fullWidth size="small" select
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
            sx={folioTextFieldSx}
          >
            {(Object.entries(SENSITIVITY_LABELS) as [SensitivityLevel, string][]).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </FolioFieldFade>

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            sx={{
              borderRadius: 3,
              height: 6,
              bgcolor: folioColors.creamDark,
              '& .MuiLinearProgress-bar': { bgcolor: folioColors.accent },
            }}
          />
          <Typography variant="caption" sx={{ color: folioColors.inkLight, mt: 0.5, display: 'block' }}>
            Uploading document…
          </Typography>
        </Box>
      )}

      {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
    </FolioModal>
  );
};

export default DocumentUploadModal;
