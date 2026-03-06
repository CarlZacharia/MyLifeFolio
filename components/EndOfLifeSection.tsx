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
import { END_OF_LIFE_CATEGORIES } from '../lib/endOfLifeCategories';
import EndOfLifeModal, { EndOfLifeData } from './EndOfLifeModal';

const EndOfLifeSection = () => {
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
    setModalCategory(formData.endOfLife[index].category);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: EndOfLifeData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.endOfLife];
      updated[editIndex] = data;
      updateFormData({ endOfLife: updated });
    } else {
      updateFormData({ endOfLife: [...formData.endOfLife, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        endOfLife: formData.endOfLife.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): EndOfLifeData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.endOfLife[editIndex] as EndOfLifeData;
  };

  const getEntriesForCategory = (categoryLabel: string) =>
    formData.endOfLife
      .map((e, i) => ({ ...e, originalIndex: i }))
      .filter((e) => e.category === categoryLabel);

  const hasAnyEntries = formData.endOfLife.length > 0;

  // Build display columns: first non-notes, non-category field as primary, then notes
  const getDisplayFields = (categoryLabel: string) => {
    const cat = END_OF_LIFE_CATEGORIES.find((c) => c.label === categoryLabel);
    if (!cat) return [];
    return cat.fields.filter((f) => f.name !== 'notes');
  };

  return (
    <Box>
      {/* Category buttons */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1,
          mb: 3,
        }}
      >
        {END_OF_LIFE_CATEGORIES.map((cat) => {
          const completed = formData.endOfLife.some(
            (e) => e.category === cat.label
          );
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
                  bgcolor: '#6a1b9a',
                  color: 'white',
                  '&:hover': { bgcolor: '#4a148c' },
                }),
              }}
            >
              {cat.label}
            </Button>
          );
        })}
      </Box>

      {hasAnyEntries ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {END_OF_LIFE_CATEGORIES.map((cat) => {
                const entries = getEntriesForCategory(cat.label);
                if (entries.length === 0) return null;
                const displayFields = getDisplayFields(cat.label);

                return (
                  <React.Fragment key={cat.label}>
                    {entries.map((entry) => (
                      <React.Fragment key={entry.originalIndex}>
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
                        {/* Field rows */}
                        {displayFields.map((field, fIdx) => (
                          <TableRow
                            key={`${entry.originalIndex}-${field.name}`}
                            hover
                            onClick={() => openEdit(entry.originalIndex)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>{field.label}</TableCell>
                            <TableCell>{entry[field.name] || '-'}</TableCell>
                            {fIdx === 0 ? (
                              <TableCell rowSpan={displayFields.length}>
                                {entry.notes || '-'}
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))}
                      </React.Fragment>
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
            No end of life entries added yet. Use the buttons above to add information by category.
          </Typography>
        </Paper>
      )}

      <EndOfLifeModal
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

export default EndOfLifeSection;
