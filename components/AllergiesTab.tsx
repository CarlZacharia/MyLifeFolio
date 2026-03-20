'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import AllergyModal, { AllergyData } from './AllergyModal';

const severityColor = (severity: string) => {
  switch (severity) {
    case 'Severe / Anaphylactic':
      return { bg: '#fce4ec', color: '#c62828' };
    case 'Moderate':
      return { bg: '#fff3e0', color: '#e65100' };
    case 'Mild':
      return { bg: '#e8f5e9', color: '#2e7d32' };
    default:
      return { bg: '#f5f5f5', color: '#757575' };
  }
};

const AllergiesTab = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = () => {
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: AllergyData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.allergies];
      updated[editIndex] = data;
      updateFormData({ allergies: updated });
    } else {
      updateFormData({ allergies: [...formData.allergies, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        allergies: formData.allergies.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): AllergyData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.allergies[editIndex] as AllergyData;
  };

  const sorted = formData.allergies
    .map((a, i) => ({ ...a, originalIndex: i }))
    .sort((a, b) => a.allergen.localeCompare(b.allergen));

  const hasSevere = formData.allergies.some((a) => a.severity === 'Severe / Anaphylactic');
  const hasAny = formData.allergies.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Allergy
        </Button>
      </Box>

      {hasSevere && (
        <Alert
          severity="error"
          icon={<ReportProblemIcon />}
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Severe / Anaphylactic allergy on file — ensure emergency contacts and medical team are aware.
        </Alert>
      )}

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sorted.map((allergy) => {
            const sc = severityColor(allergy.severity);
            const isSevere = allergy.severity === 'Severe / Anaphylactic';
            return (
              <Card
                key={allergy.originalIndex}
                variant="outlined"
                sx={{
                  borderColor: isSevere ? '#ef5350' : undefined,
                  borderWidth: isSevere ? 2 : 1,
                  bgcolor: isSevere ? '#fff5f5' : undefined,
                  '&:hover': { borderColor: isSevere ? '#c62828' : folioColors.accentWarm },
                  transition: 'border-color 0.2s',
                }}
              >
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <WarningAmberIcon sx={{ color: isSevere ? '#c62828' : folioColors.accent, fontSize: 28 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {allergy.allergen}
                          </Typography>
                          {allergy.severity && (
                            <Chip
                              label={allergy.severity}
                              size="small"
                              sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, height: 22 }}
                            />
                          )}
                          {allergy.allergyType && (
                            <Chip
                              label={allergy.allergyType}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22 }}
                            />
                          )}
                        </Box>
                        {allergy.reaction && (
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            Reaction: {allergy.reaction}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => openEdit(allergy.originalIndex)} sx={{ color: folioColors.inkLight }}>
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
          <WarningAmberIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No allergies recorded yet. Add any known allergies to keep your health profile complete.
          </Typography>
        </Paper>
      )}

      <AllergyModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
      />
    </Box>
  );
};

export default AllergiesTab;
