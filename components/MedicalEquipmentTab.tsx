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
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import MedicalEquipmentModal, { MedicalEquipmentData, EQUIPMENT_TYPES } from './MedicalEquipmentModal';

const shortType = (equipmentType: string): string => {
  // Shorten the type label for the card display
  const match = EQUIPMENT_TYPES.find((t) => t === equipmentType);
  if (!match) return equipmentType;
  const parenIdx = match.indexOf('(');
  return parenIdx > 0 ? match.substring(0, parenIdx).trim() : match;
};

const MedicalEquipmentTab = () => {
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

  const handleSave = (data: MedicalEquipmentData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.medicalEquipment];
      updated[editIndex] = data;
      updateFormData({ medicalEquipment: updated });
    } else {
      updateFormData({ medicalEquipment: [...formData.medicalEquipment, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        medicalEquipment: formData.medicalEquipment.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): MedicalEquipmentData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.medicalEquipment[editIndex] as MedicalEquipmentData;
  };

  const activeEquipment = formData.medicalEquipment
    .map((e, i) => ({ ...e, originalIndex: i }))
    .filter((e) => e.isActive !== false);

  const inactiveEquipment = formData.medicalEquipment
    .map((e, i) => ({ ...e, originalIndex: i }))
    .filter((e) => e.isActive === false);

  // Group active equipment by type
  const typeGroups = new Map<string, typeof activeEquipment>();
  activeEquipment.forEach((item) => {
    const type = item.equipmentType || 'Other';
    if (!typeGroups.has(type)) typeGroups.set(type, []);
    typeGroups.get(type)!.push(item);
  });

  const hasAny = formData.medicalEquipment.length > 0;

  const formatServiceDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Equipment
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from(typeGroups.entries()).map(([type, items]) => (
            <Box key={type}>
              <Typography variant="caption" sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: folioColors.inkLight,
                fontSize: '0.7rem',
                mb: 0.5,
                display: 'block',
              }}>
                {shortType(type)}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map((equipment) => {
                  const serviceDate = formatServiceDate(equipment.nextServiceDate);
                  return (
                    <Card key={equipment.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                            <DevicesOtherIcon sx={{ color: folioColors.accent, fontSize: 28 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                  {equipment.makeModel ? `${equipment.makeModel} (${equipment.equipmentName})` : equipment.equipmentName}
                                </Typography>
                                <Chip label="Active" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, height: 22 }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                {[
                                  shortType(equipment.equipmentType),
                                  equipment.supplierName,
                                ].filter(Boolean).join(' · ')}
                              </Typography>
                              {serviceDate && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  Service due: {serviceDate}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => openEdit(equipment.originalIndex)} sx={{ color: folioColors.inkLight }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          ))}

          {inactiveEquipment.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowInactive(!showInactive)}
                endIcon={showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: folioColors.inkLight, textTransform: 'none' }}
              >
                {showInactive ? 'Hide' : 'Show'} Past/Retired Equipment ({inactiveEquipment.length})
              </Button>
              <Collapse in={showInactive}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, opacity: 0.7 }}>
                  {inactiveEquipment.map((equipment) => (
                    <Card key={equipment.originalIndex} variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <DevicesOtherIcon sx={{ color: folioColors.inkFaint, fontSize: 28 }} />
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {equipment.equipmentName}
                                </Typography>
                                <Chip label="Retired" size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', height: 22 }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {shortType(equipment.equipmentType)}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => openEdit(equipment.originalIndex)} sx={{ color: folioColors.inkLight }}>
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
          <DevicesOtherIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No medical equipment recorded. Document hearing aids, mobility devices, and other medical equipment here.
          </Typography>
        </Paper>
      )}

      <MedicalEquipmentModal
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

export default MedicalEquipmentTab;
