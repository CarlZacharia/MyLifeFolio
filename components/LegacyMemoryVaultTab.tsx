'use client';

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, Typography, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import LegacyMemoryModal, { MemoryData } from './LegacyMemoryModal';

const LegacyMemoryVaultTab = () => {
  const { formData, updateFormData } = useFormContext();
  const memories = formData.legacyMemories;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = () => { setIsEdit(false); setEditIndex(null); setModalOpen(true); };
  const openEdit = (i: number) => { setIsEdit(true); setEditIndex(i); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

  const handleSave = (data: MemoryData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...memories]; updated[editIndex] = data;
      updateFormData({ legacyMemories: updated });
    } else {
      updateFormData({ legacyMemories: [...memories, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ legacyMemories: memories.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <PhotoLibraryIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Memory Vault</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Photos, keepsakes, and treasured moments. Link to cloud albums or describe the memories that matter most.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add a Memory
        </Button>
      </Box>

      {memories.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {memories.map((memory, i) => (
            <Card key={i} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <PhotoLibraryIcon sx={{ color: folioColors.accent, fontSize: 24 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {memory.memoryTitle}
                      </Typography>
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
          ))}
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <PhotoLibraryIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            No memories yet. Start building your vault of cherished moments.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Link to Google Photos albums, describe favorite photos, or catalog family keepsakes.
          </Typography>
        </Paper>
      )}

      <LegacyMemoryModal open={modalOpen} onClose={closeModal} onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={isEdit && editIndex !== null ? memories[editIndex] as MemoryData : undefined}
        isEdit={isEdit} />
    </Box>
  );
};

export default LegacyMemoryVaultTab;
