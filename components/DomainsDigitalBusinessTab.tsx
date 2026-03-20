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
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import DomainDigitalBusinessModal, { DomainDigitalBusinessData } from './DomainDigitalBusinessModal';

const formatAmount = (amount: string, frequency: string): string => {
  if (!amount) return '';
  const clean = amount.replace(/[$,\s]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return amount;
  const formatted = `$${num.toFixed(2)}`;
  if (frequency) return `${formatted}/${frequency.toLowerCase()}`;
  return formatted;
};

const DomainsDigitalBusinessTab = () => {
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

  const handleSave = (data: DomainDigitalBusinessData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.domainsDigitalBusiness];
      updated[editIndex] = data;
      updateFormData({ domainsDigitalBusiness: updated });
    } else {
      updateFormData({ domainsDigitalBusiness: [...formData.domainsDigitalBusiness, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        domainsDigitalBusiness: formData.domainsDigitalBusiness.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): DomainDigitalBusinessData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.domainsDigitalBusiness[editIndex] as DomainDigitalBusinessData;
  };

  const activeItems = formData.domainsDigitalBusiness
    .map((s, i) => ({ ...s, originalIndex: i }))
    .filter((s) => s.isActive !== false)
    .sort((a, b) => a.name.localeCompare(b.name));

  const inactiveItems = formData.domainsDigitalBusiness
    .map((s, i) => ({ ...s, originalIndex: i }))
    .filter((s) => s.isActive === false)
    .sort((a, b) => a.name.localeCompare(b.name));

  const hasAny = formData.domainsDigitalBusiness.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}>
          Add Domain / Business
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activeItems.map((item) => (
            <Card key={item.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: '#00695c' }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <LanguageIcon sx={{ color: '#00695c', fontSize: 28 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {item.name}
                        </Typography>
                        {item.businessType && (
                          <Chip label={item.businessType} size="small" variant="outlined" sx={{ height: 22 }} />
                        )}
                        {item.monthlyRevenue && (
                          <Chip label="Earns Revenue" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, height: 22 }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {[
                          item.businessType,
                          item.registrarHost,
                          item.hostingCost && item.hostingFrequency ? `${formatAmount(item.hostingCost, item.hostingFrequency)}` : '',
                        ].filter(Boolean).join(' · ')}
                      </Typography>
                      {item.loginEmail && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {item.loginEmail}
                        </Typography>
                      )}
                      {item.expirationDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Expires: {item.expirationDate}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => openEdit(item.originalIndex)} sx={{ color: folioColors.inkLight }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          {inactiveItems.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowInactive(!showInactive)}
                endIcon={showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: folioColors.inkLight, textTransform: 'none' }}
              >
                {showInactive ? 'Hide Inactive / Sold Domains' : 'Show Inactive / Sold Domains'} ({inactiveItems.length})
              </Button>
              <Collapse in={showInactive}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, opacity: 0.7 }}>
                  {inactiveItems.map((item) => (
                    <Card key={item.originalIndex} variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LanguageIcon sx={{ color: folioColors.inkFaint, fontSize: 28 }} />
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {item.name}
                                </Typography>
                                <Chip label="Inactive" size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', height: 22 }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {[item.businessType, item.registrarHost].filter(Boolean).join(' · ')}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => openEdit(item.originalIndex)} sx={{ color: folioColors.inkLight }}>
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
          <LanguageIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No domains or digital businesses recorded yet. Add domain names, websites, online stores, and other digital business assets.
          </Typography>
        </Paper>
      )}

      <DomainDigitalBusinessModal
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

export default DomainsDigitalBusinessTab;
