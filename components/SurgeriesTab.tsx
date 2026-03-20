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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import SurgeryModal, { SurgeryData } from './SurgeryModal';

const typeChipColor = (type: string) => {
  switch (type) {
    case 'Surgery':
      return { bg: '#fce4ec', color: '#c62828' };
    case 'Hospitalization':
      return { bg: '#fff3e0', color: '#e65100' };
    case 'Procedure/Outpatient':
      return { bg: '#e3f2fd', color: '#1565c0' };
    default:
      return { bg: '#f5f5f5', color: '#757575' };
  }
};

const SurgeriesTab = () => {
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

  const handleSave = (data: SurgeryData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.surgeries];
      updated[editIndex] = data;
      updateFormData({ surgeries: updated });
    } else {
      updateFormData({ surgeries: [...formData.surgeries, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        surgeries: formData.surgeries.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): SurgeryData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.surgeries[editIndex] as SurgeryData;
  };

  const sorted = formData.surgeries
    .map((s, i) => ({ ...s, originalIndex: i }))
    .sort((a, b) => {
      // Sort by date descending (most recent first), then by name
      if (a.procedureDate && b.procedureDate) return b.procedureDate.localeCompare(a.procedureDate);
      if (a.procedureDate) return -1;
      if (b.procedureDate) return 1;
      return a.procedureName.localeCompare(b.procedureName);
    });

  const hasAny = formData.surgeries.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Procedure
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sorted.map((surg) => {
            const tc = typeChipColor(surg.procedureType);
            return (
              <Card key={surg.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <LocalHospitalIcon sx={{ color: folioColors.accent, fontSize: 28 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {surg.procedureName}
                          </Typography>
                          {surg.procedureType && (
                            <Chip label={surg.procedureType} size="small" sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 600, height: 22 }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {[
                            surg.procedureDate,
                            surg.facility,
                            surg.surgeonPhysician,
                          ].filter(Boolean).join(' · ')}
                        </Typography>
                        {surg.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                            {surg.notes}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => openEdit(surg.originalIndex)} sx={{ color: folioColors.inkLight }}>
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
          <LocalHospitalIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No surgeries or hospitalizations recorded yet. Add any past procedures to keep your health history complete.
          </Typography>
        </Paper>
      )}

      <SurgeryModal
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

export default SurgeriesTab;
