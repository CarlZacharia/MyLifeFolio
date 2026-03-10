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
import { folioColors } from './FolioModal';
import FolioHelpModal, { FolioHelpButton, useFolioHelp } from './FolioHelpModal';
import { careDecisionsHelp } from './folioHelpContent';

const CarePreferencesSection = () => {
  const { formData, updateFormData } = useFormContext();
  const { showHelp, openHelp, closeHelp } = useFolioHelp();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('');

  const openCategory = (category: string) => {
    setModalCategory(category);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSave = (entries: CarePreferenceData[]) => {
    // Replace all entries for this category with the new set
    const otherEntries = formData.carePreferences.filter(
      (p) => p.category !== modalCategory
    );
    updateFormData({ carePreferences: [...otherEntries, ...entries] });
  };

  const getEntriesForCategory = (categoryLabel: string) =>
    formData.carePreferences.filter((e) => e.category === categoryLabel);

  const hasAnyPreferences = formData.carePreferences.length > 0;

  return (
    <Box>
      <FolioHelpModal open={showHelp} onClose={closeHelp} content={careDecisionsHelp} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <FolioHelpButton onClick={openHelp} accentColor="#bf360c" />
      </Box>
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
              onClick={() => openCategory(cat.label)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                ...(completed && {
                  bgcolor: folioColors.ink,
                  color: 'white',
                  '&:hover': { bgcolor: '#3d3224' },
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
                const preferences = getEntriesForCategory(cat.label);
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
                          cursor: 'pointer',
                        }}
                        onClick={() => openCategory(cat.label)}
                      >
                        {cat.label}
                      </TableCell>
                    </TableRow>
                    {/* Preference rows */}
                    {preferences.map((pref, idx) => (
                      <TableRow
                        key={`${cat.label}-${idx}`}
                        hover
                        onClick={() => openCategory(cat.label)}
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
        category={modalCategory}
        existingEntries={getEntriesForCategory(modalCategory)}
      />
    </Box>
  );
};

export default CarePreferencesSection;
