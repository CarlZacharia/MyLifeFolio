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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import {
  DigitalAssetModal,
  DigitalAssetData,
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

const DigitalAssetsTab = () => {
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

  const handleSave = (data: DigitalAssetData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.digitalAssets];
      updated[editIndex] = data;
      updateFormData({ digitalAssets: updated });
    } else {
      updateFormData({ digitalAssets: [...formData.digitalAssets, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ digitalAssets: formData.digitalAssets.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const getEditData = (): DigitalAssetData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.digitalAssets[editIndex];
  };

  const total = formData.digitalAssets.reduce((sum, d) => {
    const num = parseFloat((d.value || '0').replace(/[^0-9.-]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const fmtTotal = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const hasAny = formData.digitalAssets.length > 0;

  return (
    <Box>
      {/* Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Add Digital Asset
        </Button>
      </Box>

      {/* Table */}
      {hasAny ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Asset Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.digitalAssets.map((asset, i) => (
                <TableRow
                  key={`digital-${i}`}
                  hover
                  onClick={() => openEdit(i)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{asset.platform || '-'}</TableCell>
                  <TableCell>{asset.assetType || '-'}</TableCell>
                  <TableCell>{asset.description || '-'}</TableCell>
                  <TableCell>{asset.owner || '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(asset.value)}</TableCell>
                </TableRow>
              ))}

              {/* Total row */}
              <TableRow sx={{ bgcolor: '#0a5c36' }}>
                <TableCell colSpan={4} sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                  Total Digital Assets
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
            No digital assets added yet. Use the button above to add your first digital asset.
          </Typography>
        </Paper>
      )}

      {/* Modal */}
      <DigitalAssetModal
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

export default DigitalAssetsTab;
