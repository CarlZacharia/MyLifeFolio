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
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import DigitalSubscriptionModal, { DigitalSubscriptionData } from './DigitalSubscriptionModal';

const formatAmount = (amount: string, frequency: string): string => {
  if (!amount) return '';
  const clean = amount.replace(/[$,\s]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return amount;
  const formatted = `$${num.toFixed(2)}`;
  if (frequency) return `${formatted}/${frequency.toLowerCase()}`;
  return formatted;
};

const DigitalSubscriptionsTab = () => {
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

  const handleSave = (data: DigitalSubscriptionData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.digitalSubscriptions];
      updated[editIndex] = data;
      updateFormData({ digitalSubscriptions: updated });
    } else {
      updateFormData({ digitalSubscriptions: [...formData.digitalSubscriptions, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        digitalSubscriptions: formData.digitalSubscriptions.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): DigitalSubscriptionData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.digitalSubscriptions[editIndex] as DigitalSubscriptionData;
  };

  const activeSubs = formData.digitalSubscriptions
    .map((s, i) => ({ ...s, originalIndex: i }))
    .filter((s) => s.isActive !== false)
    .sort((a, b) => a.serviceName.localeCompare(b.serviceName));

  const inactiveSubs = formData.digitalSubscriptions
    .map((s, i) => ({ ...s, originalIndex: i }))
    .filter((s) => s.isActive === false)
    .sort((a, b) => a.serviceName.localeCompare(b.serviceName));

  // Calculate monthly total for active subscriptions
  const monthlyTotal = activeSubs.reduce((sum, sub) => {
    const clean = (sub.amount || '').replace(/[$,\s]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return sum;
    switch (sub.frequency) {
      case 'Annual': return sum + num / 12;
      case 'Quarterly': return sum + num / 3;
      case 'Weekly': return sum + num * 4.33;
      default: return sum + num; // Monthly or other
    }
  }, 0);

  const hasAny = formData.digitalSubscriptions.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {hasAny && monthlyTotal > 0 ? (
          <Typography variant="body2" sx={{ color: folioColors.inkLight, fontWeight: 600 }}>
            Est. monthly total: ${monthlyTotal.toFixed(2)}
          </Typography>
        ) : <Box />}
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}>
          Add Digital Subscription
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activeSubs.map((sub) => (
            <Card key={sub.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: '#00695c' }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <SubscriptionsIcon sx={{ color: '#00695c', fontSize: 28 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {sub.serviceName}
                        </Typography>
                        <Chip label="Active" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, height: 22 }} />
                        {sub.category && (
                          <Chip label={sub.category} size="small" variant="outlined" sx={{ height: 22 }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {[
                          formatAmount(sub.amount, sub.frequency),
                          sub.accountHolder,
                          sub.paymentMethod,
                        ].filter(Boolean).join(' · ')}
                      </Typography>
                      {sub.loginEmail && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {sub.loginEmail}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => openEdit(sub.originalIndex)} sx={{ color: folioColors.inkLight }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          {inactiveSubs.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => setShowInactive(!showInactive)}
                endIcon={showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: folioColors.inkLight, textTransform: 'none' }}
              >
                {showInactive ? 'Hide' : 'Show'} Cancelled Subscriptions ({inactiveSubs.length})
              </Button>
              <Collapse in={showInactive}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, opacity: 0.7 }}>
                  {inactiveSubs.map((sub) => (
                    <Card key={sub.originalIndex} variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <SubscriptionsIcon sx={{ color: folioColors.inkFaint, fontSize: 28 }} />
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {sub.serviceName}
                                </Typography>
                                <Chip label="Cancelled" size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', height: 22 }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {[formatAmount(sub.amount, sub.frequency), sub.category].filter(Boolean).join(' · ')}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => openEdit(sub.originalIndex)} sx={{ color: folioColors.inkLight }}>
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
          <SubscriptionsIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No digital subscriptions recorded yet. Add your streaming services, cloud storage, apps, and other online subscriptions.
          </Typography>
        </Paper>
      )}

      <DigitalSubscriptionModal
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

export default DigitalSubscriptionsTab;
