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
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneIcon from '@mui/icons-material/Phone';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import PharmacyModal, { PharmacyData } from './PharmacyModal';

const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return phone;
};

const PharmaciesTab = () => {
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

  const handleSave = (data: PharmacyData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.pharmacies];
      updated[editIndex] = data;
      updateFormData({ pharmacies: updated });
    } else {
      updateFormData({ pharmacies: [...formData.pharmacies, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        pharmacies: formData.pharmacies.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): PharmacyData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.pharmacies[editIndex] as PharmacyData;
  };

  const activePharmacies = formData.pharmacies
    .map((p, i) => ({ ...p, originalIndex: i }))
    .filter((p) => p.isActive !== false);

  const inactivePharmacies = formData.pharmacies
    .map((p, i) => ({ ...p, originalIndex: i }))
    .filter((p) => p.isActive === false);

  // Count medications linked to each pharmacy
  const getMedCountForPharmacy = (pharmacyIndex: number): number => {
    return (formData.medications || []).filter((m) => m.pharmacyIndex === pharmacyIndex).length;
  };

  const hasAny = formData.pharmacies.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Pharmacy
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activePharmacies.map((pharmacy) => {
            const medCount = getMedCountForPharmacy(pharmacy.originalIndex);
            return (
              <Card key={pharmacy.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <LocalPharmacyIcon sx={{ color: folioColors.accent, fontSize: 28 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {pharmacy.pharmacyName}
                          </Typography>
                          {pharmacy.isPrimary && (
                            <Chip label="Primary" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, height: 22 }} />
                          )}
                          {pharmacy.specialty && (
                            <Chip label="Specialty" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, height: 22 }} />
                          )}
                          {pharmacy.mailOrder && (
                            <Chip label="Mail Order" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, height: 22 }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {[
                            pharmacy.phone && formatPhone(pharmacy.phone),
                            medCount > 0 && `${medCount} medication${medCount !== 1 ? 's' : ''} on file`,
                          ].filter(Boolean).join(' · ')}
                        </Typography>
                        {(pharmacy.address || pharmacy.city) && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {[pharmacy.address, pharmacy.city, pharmacy.state, pharmacy.zip].filter(Boolean).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {pharmacy.phone && (
                        <IconButton size="small" href={`tel:${pharmacy.phone}`} sx={{ color: folioColors.accent }}>
                          <PhoneIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => openEdit(pharmacy.originalIndex)} sx={{ color: folioColors.inkLight }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {inactivePharmacies.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowInactive(!showInactive)}
                endIcon={showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: folioColors.inkLight, textTransform: 'none' }}
              >
                {showInactive ? 'Hide' : 'Show'} Inactive Pharmacies ({inactivePharmacies.length})
              </Button>
              <Collapse in={showInactive}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, opacity: 0.7 }}>
                  {inactivePharmacies.map((pharmacy) => (
                    <Card key={pharmacy.originalIndex} variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LocalPharmacyIcon sx={{ color: folioColors.inkFaint, fontSize: 28 }} />
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {pharmacy.pharmacyName}
                                </Typography>
                                <Chip label="Inactive" size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', height: 22 }} />
                              </Box>
                              {pharmacy.phone && (
                                <Typography variant="body2" color="text.secondary">
                                  {formatPhone(pharmacy.phone)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => openEdit(pharmacy.originalIndex)} sx={{ color: folioColors.inkLight }}>
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
          <LocalPharmacyIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No pharmacies saved yet. Add a pharmacy to link it to your medications.
          </Typography>
        </Paper>
      )}

      <PharmacyModal
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

export default PharmaciesTab;
