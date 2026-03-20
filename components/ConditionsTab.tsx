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
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import ConditionModal, { ConditionData } from './ConditionModal';

const statusChip = (status: string) => {
  switch (status) {
    case 'Active':
      return { bg: '#e8f5e9', color: '#2e7d32' };
    case 'In Remission':
      return { bg: '#e3f2fd', color: '#1565c0' };
    case 'Resolved':
      return { bg: '#f5f5f5', color: '#757575' };
    default:
      return { bg: '#f5f5f5', color: '#757575' };
  }
};

const ConditionsTab = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showResolved, setShowResolved] = useState(false);

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

  const handleSave = (data: ConditionData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.medicalConditions];
      updated[editIndex] = data;
      updateFormData({ medicalConditions: updated });
    } else {
      updateFormData({ medicalConditions: [...formData.medicalConditions, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        medicalConditions: formData.medicalConditions.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): ConditionData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.medicalConditions[editIndex] as ConditionData;
  };

  const activeConditions = formData.medicalConditions
    .map((c, i) => ({ ...c, originalIndex: i }))
    .filter((c) => c.status !== 'Resolved')
    .sort((a, b) => a.conditionName.localeCompare(b.conditionName));

  const resolvedConditions = formData.medicalConditions
    .map((c, i) => ({ ...c, originalIndex: i }))
    .filter((c) => c.status === 'Resolved')
    .sort((a, b) => a.conditionName.localeCompare(b.conditionName));

  const hasAny = formData.medicalConditions.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Condition
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activeConditions.map((cond) => {
            const sc = statusChip(cond.status);
            return (
              <Card key={cond.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <MonitorHeartIcon sx={{ color: folioColors.accent, fontSize: 28 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {cond.conditionName}
                          </Typography>
                          {cond.status && (
                            <Chip label={cond.status} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, height: 22 }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {[
                            cond.treatingPhysician && `Dr. ${cond.treatingPhysician}`,
                            cond.diagnosedDate && `Diagnosed ${cond.diagnosedDate}`,
                          ].filter(Boolean).join(' · ')}
                        </Typography>
                        {cond.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                            {cond.notes}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => openEdit(cond.originalIndex)} sx={{ color: folioColors.inkLight }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {resolvedConditions.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowResolved(!showResolved)}
                endIcon={showResolved ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: folioColors.inkLight, textTransform: 'none' }}
              >
                {showResolved ? 'Hide' : 'Show'} Resolved Conditions ({resolvedConditions.length})
              </Button>
              <Collapse in={showResolved}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, opacity: 0.7 }}>
                  {resolvedConditions.map((cond) => (
                    <Card key={cond.originalIndex} variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <MonitorHeartIcon sx={{ color: folioColors.inkFaint, fontSize: 28 }} />
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {cond.conditionName}
                                </Typography>
                                <Chip label="Resolved" size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', height: 22 }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {[cond.treatingPhysician, cond.diagnosedDate].filter(Boolean).join(' · ')}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => openEdit(cond.originalIndex)} sx={{ color: folioColors.inkLight }}>
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
          <MonitorHeartIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No conditions recorded yet. Add any current or past diagnoses to keep your health profile complete.
          </Typography>
        </Paper>
      )}

      <ConditionModal
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

export default ConditionsTab;
