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
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MedicationIcon from '@mui/icons-material/Medication';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import MedicationModal, { MedicationData } from './MedicationModal';

const MedicationsTab = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

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

  const handleSave = (data: MedicationData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.medications];
      updated[editIndex] = data;
      updateFormData({ medications: updated });
    } else {
      updateFormData({ medications: [...formData.medications, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        medications: formData.medications.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): MedicationData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.medications[editIndex] as MedicationData;
  };

  const activeMeds = formData.medications
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter((m) => m.isActive !== false)
    .sort((a, b) => a.medicationName.localeCompare(b.medicationName));

  const inactiveMeds = formData.medications
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter((m) => m.isActive === false)
    .sort((a, b) => a.medicationName.localeCompare(b.medicationName));

  const getPharmacyName = (pharmacyIndex: number | null): string | null => {
    if (pharmacyIndex === null) return null;
    const pharmacy = (formData.pharmacies || [])[pharmacyIndex];
    return pharmacy ? pharmacy.pharmacyName : null;
  };

  const hasAny = formData.medications.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Medication
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activeMeds.map((med) => {
            const pharmacyName = getPharmacyName(med.pharmacyIndex);
            return (
              <Card key={med.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <MedicationIcon sx={{ color: folioColors.accent, fontSize: 28 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {med.medicationName}
                          </Typography>
                          <Chip label="Active" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, height: 22 }} />
                          {med.controlledSubstance && (
                            <Chip label="Controlled" size="small" sx={{ bgcolor: '#fce4ec', color: '#c62828', fontWeight: 600, height: 22 }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {[
                            med.dosage,
                            med.frequency,
                            med.conditionTreated,
                          ].filter(Boolean).join(' · ')}
                        </Typography>
                        {(pharmacyName || med.rxNumber) && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {[
                              pharmacyName,
                              med.rxNumber && `Rx #${med.rxNumber}`,
                            ].filter(Boolean).join(' · ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => openEdit(med.originalIndex)} sx={{ color: folioColors.inkLight }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {inactiveMeds.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowInactive(!showInactive)}
                endIcon={showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: folioColors.inkLight, textTransform: 'none' }}
              >
                {showInactive ? 'Hide' : 'Show'} Past Medications ({inactiveMeds.length})
              </Button>
              <Collapse in={showInactive}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, opacity: 0.7 }}>
                  {inactiveMeds.map((med) => (
                    <Card key={med.originalIndex} variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <MedicationIcon sx={{ color: folioColors.inkFaint, fontSize: 28 }} />
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {med.medicationName}
                                </Typography>
                                <Chip label="Inactive" size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', height: 22 }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {[med.dosage, med.conditionTreated].filter(Boolean).join(' · ')}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => openEdit(med.originalIndex)} sx={{ color: folioColors.inkLight }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <MedicationIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No medications recorded yet. Add your first medication to keep your health profile complete.
          </Typography>
        </Paper>
      )}

      <MedicationModal
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

export default MedicationsTab;
