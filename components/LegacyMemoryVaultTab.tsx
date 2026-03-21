'use client';

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, Typography, Paper,
  Snackbar, CircularProgress, Dialog, DialogContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import LegacyMemoryModal, { MemoryData, MemoryFileAttachment } from './LegacyMemoryModal';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MemoryVaultHelpModal from './MemoryVaultHelpModal';
import { uploadMemoryFile, deleteMemoryFile, generateClientFolderName, downloadFile } from '../lib/supabaseStorage';

const MAX_TOTAL_FILES = 20;

function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

const LegacyMemoryVaultTab = () => {
  const { formData, updateFormData } = useFormContext();
  const memories = formData.legacyMemories;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerName, setViewerName] = useState('');
  const [viewerLoading, setViewerLoading] = useState(false);

  const clientFolderName = formData.name ? generateClientFolderName(formData.name) : undefined;

  // Global file count across all memories
  const totalFileCount = memories.reduce((sum, m) => sum + ((m.files as MemoryFileAttachment[])?.length || 0), 0);

  const openAdd = () => { setIsEdit(false); setEditIndex(null); setModalOpen(true); };
  const openEdit = (i: number) => { setIsEdit(true); setEditIndex(i); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

  const handleFileClick = async (file: MemoryFileAttachment) => {
    setViewerLoading(true);

    const blob = await downloadFile(file.path);
    if (!blob) {
      setSnackMsg('Unable to load file. Please try again.');
      setViewerLoading(false);
      return;
    }

    const objectUrl = URL.createObjectURL(blob);

    if (isImageType(file.type)) {
      // Revoke any previous object URL
      if (viewerUrl) URL.revokeObjectURL(viewerUrl);
      setViewerName(file.name);
      setViewerUrl(objectUrl);
      setViewerOpen(true);
    } else {
      // PDFs and other non-image files open in a new tab
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
    }
    setViewerLoading(false);
  };

  const handleSave = async (data: MemoryData, pendingFiles: File[]) => {
    // Handle removed files (cleanup storage)
    const removedPaths = (data as MemoryData & { _removedPaths?: string[] })._removedPaths || [];
    for (const path of removedPaths) {
      await deleteMemoryFile(path);
    }

    // Strip internal field
    const cleanData = { ...data };
    delete (cleanData as Record<string, unknown>)._removedPaths;

    // Upload pending files
    if (pendingFiles.length > 0 && clientFolderName) {
      setUploading(true);
      const uploadedFiles = [...(cleanData.files || [])];
      const errors: string[] = [];

      for (const file of pendingFiles) {
        const result = await uploadMemoryFile(file, clientFolderName);
        if (result.success && result.metadata) {
          uploadedFiles.push({
            path: result.metadata.path,
            name: result.metadata.name,
            size: result.metadata.size,
            type: result.metadata.type,
          });
        } else {
          errors.push(result.error || `Failed to upload ${file.name}`);
        }
      }

      cleanData.files = uploadedFiles;
      setUploading(false);

      if (errors.length > 0) {
        setSnackMsg(`Some files failed: ${errors.join(', ')}`);
      }
    }

    if (isEdit && editIndex !== null) {
      const updated = [...memories];
      updated[editIndex] = cleanData;
      updateFormData({ legacyMemories: updated });
    } else {
      updateFormData({ legacyMemories: [...memories, cleanData] });
    }
  };

  const handleDelete = async () => {
    if (editIndex !== null) {
      // Clean up storage for all files in this memory
      const memory = memories[editIndex];
      const files = (memory.files as MemoryFileAttachment[]) || [];
      for (const file of files) {
        if (file.path) await deleteMemoryFile(file.path);
      }
      updateFormData({ legacyMemories: memories.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <PhotoLibraryIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Memory Vault</Typography>
        <IconButton onClick={() => setHelpOpen(true)} size="small" sx={{ ml: 0.5, bgcolor: '#1a1a1a', color: '#c9a227', width: 28, height: 28, '&:hover': { bgcolor: '#333' } }} title="Audio guide">
          <VolumeUpIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <MemoryVaultHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Photos, keepsakes, and treasured moments. Upload images, link to cloud albums, or describe the memories that matter most.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {totalFileCount > 0 && (
          <Typography variant="caption" sx={{ color: folioColors.inkLight }}>
            {totalFileCount} / {MAX_TOTAL_FILES} files uploaded
          </Typography>
        )}
        <Box sx={{ ml: 'auto' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
            sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
            Add a Memory
          </Button>
        </Box>
      </Box>

      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1 }}>
          <CircularProgress size={18} sx={{ color: '#2e7d32' }} />
          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>Uploading files...</Typography>
        </Box>
      )}

      {memories.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {memories.map((memory, i) => {
            const files = (memory.files as MemoryFileAttachment[]) || [];
            const fileCount = files.length;
            return (
              <Card key={i} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <PhotoLibraryIcon sx={{ color: folioColors.accent, fontSize: 24, mt: 0.25 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {memory.memoryTitle}
                          </Typography>
                          {fileCount > 0 && (
                            <Chip
                              icon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                              label={`${fileCount} file${fileCount > 1 ? 's' : ''}`}
                              size="small"
                              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#1565c0' }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {[memory.approximateYear, memory.location, memory.peopleInPhoto].filter(Boolean).join(' · ')}
                        </Typography>
                        {memory.tags && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            {memory.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }} />
                            ))}
                          </Box>
                        )}

                        {/* Clickable file list */}
                        {fileCount > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
                            {files.map((file, fi) => (
                              <Chip
                                key={file.path || fi}
                                icon={isImageType(file.type)
                                  ? <ImageIcon sx={{ fontSize: 16 }} />
                                  : <InsertDriveFileIcon sx={{ fontSize: 16 }} />}
                                label={file.name}
                                size="small"
                                onClick={() => handleFileClick(file)}
                                sx={{
                                  cursor: 'pointer',
                                  maxWidth: 200,
                                  height: 26,
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  bgcolor: isImageType(file.type) ? '#f3e8ff' : '#e3f2fd',
                                  color: isImageType(file.type) ? '#7b2cbf' : '#1565c0',
                                  '& .MuiChip-icon': {
                                    color: isImageType(file.type) ? '#7b2cbf' : '#1565c0',
                                  },
                                  '&:hover': {
                                    bgcolor: isImageType(file.type) ? '#e9d5ff' : '#bbdefb',
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => openEdit(i)} sx={{ color: folioColors.inkLight, mt: 0.25 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <PhotoLibraryIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            No memories yet. Start building your vault of cherished moments.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload photos, link to Google Photos albums, or catalog family keepsakes.
          </Typography>
        </Paper>
      )}

      <LegacyMemoryModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={isEdit && editIndex !== null ? memories[editIndex] as MemoryData : undefined}
        isEdit={isEdit}
        totalFileCount={totalFileCount}
      />

      {/* ── Image Viewer Dialog ── */}
      <Dialog
        open={viewerOpen}
        onClose={() => { setViewerOpen(false); if (viewerUrl) URL.revokeObjectURL(viewerUrl); setViewerUrl(''); }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1a1a1a', overflow: 'hidden' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1.5, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
            {viewerName}
          </Typography>
          <IconButton onClick={() => { setViewerOpen(false); setViewerUrl(''); }} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#111' }}>
          {viewerUrl && (
            <Box
              component="img"
              src={viewerUrl}
              alt={viewerName}
              sx={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Loading indicator for file fetching */}
      {viewerLoading && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: 'rgba(0,0,0,0.3)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          <Box sx={{ bgcolor: 'white', borderRadius: 2, px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading file...</Typography>
          </Box>
        </Box>
      )}

      <Snackbar
        open={!!snackMsg}
        autoHideDuration={5000}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
      />
    </Box>
  );
};

export default LegacyMemoryVaultTab;
