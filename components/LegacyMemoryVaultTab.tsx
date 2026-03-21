'use client';

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, Typography, Paper,
  Snackbar, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import LegacyMemoryModal, { MemoryData } from './LegacyMemoryModal';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MemoryVaultHelpModal from './MemoryVaultHelpModal';
import { uploadMemoryFile, deleteMemoryFile, generateClientFolderName } from '../lib/supabaseStorage';

const MAX_TOTAL_FILES = 20;

const LegacyMemoryVaultTab = () => {
  const { formData, updateFormData } = useFormContext();
  const memories = formData.legacyMemories;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const clientFolderName = formData.name ? generateClientFolderName(formData.name) : undefined;

  // Global file count across all memories
  const totalFileCount = memories.reduce((sum, m) => sum + ((m.files as Array<{ path: string; name: string; size: number; type: string }>)?.length || 0), 0);

  const openAdd = () => { setIsEdit(false); setEditIndex(null); setModalOpen(true); };
  const openEdit = (i: number) => { setIsEdit(true); setEditIndex(i); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

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
      const files = (memory.files as Array<{ path: string; name: string; size: number; type: string }>) || [];
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
            const fileCount = ((memory.files as Array<{ path: string; name: string; size: number; type: string }>) || []).length;
            return (
              <Card key={i} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <PhotoLibraryIcon sx={{ color: folioColors.accent, fontSize: 24 }} />
                      <Box sx={{ minWidth: 0 }}>
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
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => openEdit(i)} sx={{ color: folioColors.inkLight }}>
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
