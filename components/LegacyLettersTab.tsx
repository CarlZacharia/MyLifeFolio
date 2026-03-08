'use client';

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, Typography, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockIcon from '@mui/icons-material/Lock';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import LegacyLetterModal, { LetterData } from './LegacyLetterModal';

const LegacyLettersTab = () => {
  const { formData, updateFormData } = useFormContext();
  const letters = formData.legacyLetters;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = () => { setIsEdit(false); setEditIndex(null); setModalOpen(true); };
  const openEdit = (i: number) => { setIsEdit(true); setEditIndex(i); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

  const handleSave = (data: LetterData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...letters]; updated[editIndex] = data;
      updateFormData({ legacyLetters: updated });
    } else {
      updateFormData({ legacyLetters: [...letters, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ legacyLetters: letters.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <MailOutlineIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Letters to Family</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Write letters to the people who matter most. These will be treasured for generations.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Write a Letter
        </Button>
      </Box>

      {letters.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {letters.map((letter, i) => (
            <Card key={i} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <MailOutlineIcon sx={{ color: folioColors.accent, fontSize: 24 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          To: {letter.recipientName || letter.recipientType || 'Unnamed'}
                        </Typography>
                        {letter.recipientType && (
                          <Chip label={letter.recipientType} size="small" variant="outlined" sx={{ height: 22 }} />
                        )}
                        {letter.isPrivate && (
                          <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Private" size="small"
                            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, height: 22 }} />
                        )}
                      </Box>
                      {letter.letterBody && (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
                          {letter.letterBody.slice(0, 120)}{letter.letterBody.length > 120 ? '...' : ''}
                        </Typography>
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
          <MailOutlineIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            No letters written yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            "The best time to write a letter to someone you love is right now."
          </Typography>
        </Paper>
      )}

      <LegacyLetterModal open={modalOpen} onClose={closeModal} onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={isEdit && editIndex !== null ? letters[editIndex] as LetterData : undefined}
        isEdit={isEdit} />
    </Box>
  );
};

export default LegacyLettersTab;
