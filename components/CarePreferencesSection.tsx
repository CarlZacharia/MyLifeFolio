'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';
import { CARE_PREFERENCE_CATEGORIES } from '../lib/carePreferenceCategories';
import CarePreferenceModal, { CarePreferenceData } from './CarePreferenceModal';

const CarePreferencesSection = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('');
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = (category: string) => {
    setModalCategory(category);
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setModalCategory(formData.carePreferences[index].category);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: CarePreferenceData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.carePreferences];
      updated[editIndex] = data;
      updateFormData({ carePreferences: updated });
    } else {
      updateFormData({ carePreferences: [...formData.carePreferences, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        carePreferences: formData.carePreferences.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): CarePreferenceData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.carePreferences[editIndex] as CarePreferenceData;
  };

  const getPreferencesForCategory = (categoryLabel: string) =>
    formData.carePreferences
      .map((e, i) => ({ ...e, originalIndex: i }))
      .filter((e) => e.category === categoryLabel);

  const hasAnyPreferences = formData.carePreferences.length > 0;

  return (
    <Box>
      {/* Add buttons row — one per category */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          mb: 3,
        }}
      >
        {CARE_PREFERENCE_CATEGORIES.map((cat) => {
          const totalItems = cat.items.length;
          const answeredItems = formData.carePreferences.filter(
            (p) => p.category === cat.label
          ).length;
          const completed = answeredItems > 0;
          return (
            <Button
              key={cat.label}
              variant={completed ? 'contained' : 'outlined'}
              size="small"
              startIcon={<AddIcon />}
              onClick={() => openAdd(cat.label)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                ...(completed && {
                  bgcolor: '#00838f',
                  color: 'white',
                  '&:hover': { bgcolor: '#006064' },
                }),
              }}
            >
              {cat.label} ({answeredItems}/{totalItems})
            </Button>
          );
        })}
      </Box>

      {hasAnyPreferences ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Preference Item</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Your Preference / Response</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {CARE_PREFERENCE_CATEGORIES.map((cat) => {
                const preferences = getPreferencesForCategory(cat.label);
                if (preferences.length === 0) return null;
                return (
                  <React.Fragment key={cat.label}>
                    {/* Category header row */}
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 0.75,
                          letterSpacing: '0.03em',
                        }}
                      >
                        {cat.label}
                      </TableCell>
                    </TableRow>
                    {/* Preference rows */}
                    {preferences.map((pref) => (
                      <TableRow
                        key={pref.originalIndex}
                        hover
                        onClick={() => openEdit(pref.originalIndex)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{pref.preferenceItem || '-'}</TableCell>
                        <TableCell>{pref.response || '-'}</TableCell>
                        <TableCell>{pref.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No care preferences added yet. Use the buttons above to add preferences by category.
          </Typography>
        </Paper>
      )}

      <CarePreferenceModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
        category={modalCategory}
      />
    </Box>
  );
};

export default CarePreferencesSection;
