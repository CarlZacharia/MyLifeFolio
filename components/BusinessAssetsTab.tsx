'use client';

import React, { useMemo, useState } from 'react';
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
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import {
  BusinessInterestModal,
  BusinessInterestData,
  TrustFlags,
} from './AssetModals';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const formatCurrency = (value: string): string => {
  const num = parseFloat((value || '0').replace(/[^0-9.-]/g, ''));
  if (isNaN(num) || num === 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const BusinessAssetsTab = () => {
  const { formData, updateFormData } = useFormContext();
  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const trustFlags: TrustFlags = useMemo(() => ({
    clientHasLivingTrust: formData.clientHasLivingTrust,
    clientHasIrrevocableTrust: formData.clientHasIrrevocableTrust,
    spouseHasLivingTrust: formData.spouseHasLivingTrust,
    spouseHasIrrevocableTrust: formData.spouseHasIrrevocableTrust,
  }), [formData.clientHasLivingTrust, formData.clientHasIrrevocableTrust, formData.spouseHasLivingTrust, formData.spouseHasIrrevocableTrust]);

  const openAdd = () => { setModalOpen(true); setIsEdit(false); setEditIndex(null); };
  const openEdit = (index: number) => { setModalOpen(true); setIsEdit(true); setEditIndex(index); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

  const handleSave = (data: BusinessInterestData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.businessInterests];
      updated[editIndex] = data;
      updateFormData({ businessInterests: updated });
    } else {
      updateFormData({ businessInterests: [...formData.businessInterests, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ businessInterests: formData.businessInterests.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const getEditData = (): BusinessInterestData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.businessInterests[editIndex];
  };

  const total = formData.businessInterests.reduce((sum, b) => {
    const num = parseFloat((b.fullValue || '0').replace(/[^0-9.-]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const fmtTotal = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const hasAny = formData.businessInterests.length > 0;

  return (
    <Box>
      {/* Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Add Business Interest
        </Button>
      </Box>

      {/* Table */}
      {hasAny ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Business Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ownership %</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Buy-Sell</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.businessInterests.map((biz, i) => (
                <TableRow
                  key={`biz-${i}`}
                  hover
                  onClick={() => openEdit(i)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{biz.businessName || '-'}</TableCell>
                  <TableCell>{biz.entityType || '-'}</TableCell>
                  <TableCell>{biz.owner || '-'}</TableCell>
                  <TableCell>{biz.ownershipPercentage ? `${biz.ownershipPercentage}%` : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={biz.hasBuySellAgreement ? 'Yes' : 'No'}
                      size="small"
                      color={biz.hasBuySellAgreement ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(biz.fullValue)}</TableCell>
                </TableRow>
              ))}

              {/* Total row */}
              <TableRow sx={{ bgcolor: folioColors.ink }}>
                <TableCell colSpan={5} sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                  Total Business Interests
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                  {fmtTotal(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No business interests added yet. Use the button above to add your first business.
          </Typography>
        </Paper>
      )}

      {/* Modal */}
      <BusinessInterestModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
        showSpouse={showSpouseInfo}
        trustFlags={trustFlags}
      />
    </Box>
  );
};

export default BusinessAssetsTab;
