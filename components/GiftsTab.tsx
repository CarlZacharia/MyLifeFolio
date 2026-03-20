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
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import GiftModal, { GiftData } from './GiftModal';

const formatCurrency = (value: string): string => {
  if (!value) return '-';
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value: string): string => {
  if (!value) return '-';
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const GiftsTab = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const gifts = formData.giftsAndAdvancements || [];

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

  const handleSave = (data: GiftData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...gifts];
      updated[editIndex] = data;
      updateFormData({ giftsAndAdvancements: updated });
    } else {
      updateFormData({ giftsAndAdvancements: [...gifts, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        giftsAndAdvancements: gifts.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): GiftData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return gifts[editIndex] as GiftData;
  };

  const parseAmount = (val: string) => {
    const cleaned = val?.replace(/[$,\s]/g, '') || '';
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const grandTotal = gifts.reduce((sum, g) => sum + parseAmount(g.amount), 0);
  const advancementTotal = gifts
    .filter((g) => g.reduceInheritance)
    .reduce((sum, g) => sum + parseAmount(g.amount), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Track lifetime gifts to family members. Mark gifts that should reduce the recipient&apos;s inheritance share.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={openAdd}
          size="small"
        >
          Add Gift
        </Button>
      </Box>

      {gifts.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Reduces Share</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gifts.map((gift, i) => (
                <TableRow
                  key={`gift-${i}`}
                  hover
                  onClick={() => openEdit(i)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box>
                      {gift.recipientName || '-'}
                      {gift.relationship && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {gift.relationship}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{gift.giftType || '-'}</TableCell>
                  <TableCell>{gift.description || '-'}</TableCell>
                  <TableCell>{formatDate(gift.dateGiven)}</TableCell>
                  <TableCell align="right">{formatCurrency(gift.amount)}</TableCell>
                  <TableCell align="center">
                    {gift.reduceInheritance ? (
                      <Chip label="Yes" size="small" color="warning" sx={{ fontSize: '0.7rem', height: 20 }} />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Total row */}
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ fontWeight: 700, borderTop: '2px solid', borderColor: 'divider' }}
                >
                  Total Gifts
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, borderTop: '2px solid', borderColor: 'divider' }}
                >
                  {formatCurrency(`$${grandTotal.toFixed(2)}`)}
                </TableCell>
                <TableCell sx={{ borderTop: '2px solid', borderColor: 'divider' }} />
              </TableRow>

              {/* Advancement subtotal (if any marked) */}
              {advancementTotal > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    sx={{ fontWeight: 600, color: 'warning.dark', fontSize: '0.85rem' }}
                  >
                    Total Counting Against Inheritance
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, color: 'warning.dark', fontSize: '0.85rem' }}
                  >
                    {formatCurrency(`$${advancementTotal.toFixed(2)}`)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No gifts recorded yet. Use the button above to document lifetime gifts made to family members or others.
          </Typography>
        </Paper>
      )}

      <GiftModal
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

export default GiftsTab;
