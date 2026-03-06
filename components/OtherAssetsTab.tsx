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
import {
  OtherAssetModal,
  OtherAssetData,
  BeneficiaryOption,
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

const OtherAssetsTab = () => {
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

  const beneficiaryOptions = useMemo((): BeneficiaryOption[] => {
    const options: BeneficiaryOption[] = [];
    if (showSpouseInfo && formData.spouseName) {
      options.push({ value: `spouse:${formData.spouseName}`, label: `${formData.spouseName} (Spouse)` });
    }
    if (formData.name) {
      options.push({ value: `client:${formData.name}`, label: `${formData.name} (Client)` });
    }
    formData.children.forEach((child, index) => {
      if (child.name) options.push({ value: `child:${index}:${child.name}`, label: `${child.name} (Child)` });
    });
    formData.otherBeneficiaries.forEach((b, index) => {
      if (b.name) {
        const label = b.relationship === 'Grandchild' ? `${b.name} (Grandchild)` : `${b.name} (${b.relationship || 'Other'})`;
        options.push({ value: `beneficiary:${index}:${b.name}`, label });
      }
    });
    if (formData.clientHasLivingTrust) options.push({ value: `trust:client-living:${formData.clientLivingTrustName || "Client's Living Trust"}`, label: `${formData.clientLivingTrustName || "Client's Living Trust"} (Living Trust)` });
    if (formData.clientHasIrrevocableTrust) options.push({ value: `trust:client-irrevocable:${formData.clientIrrevocableTrustName || "Client's Irrevocable Trust"}`, label: `${formData.clientIrrevocableTrustName || "Client's Irrevocable Trust"} (Irrevocable Trust)` });
    if (showSpouseInfo && formData.spouseHasLivingTrust) options.push({ value: `trust:spouse-living:${formData.spouseLivingTrustName || "Spouse's Living Trust"}`, label: `${formData.spouseLivingTrustName || "Spouse's Living Trust"} (Living Trust)` });
    if (showSpouseInfo && formData.spouseHasIrrevocableTrust) options.push({ value: `trust:spouse-irrevocable:${formData.spouseIrrevocableTrustName || "Spouse's Irrevocable Trust"}`, label: `${formData.spouseIrrevocableTrustName || "Spouse's Irrevocable Trust"} (Irrevocable Trust)` });
    return options;
  }, [showSpouseInfo, formData.spouseName, formData.name, formData.children, formData.otherBeneficiaries, formData.clientHasLivingTrust, formData.clientLivingTrustName, formData.clientHasIrrevocableTrust, formData.clientIrrevocableTrustName, formData.spouseHasLivingTrust, formData.spouseLivingTrustName, formData.spouseHasIrrevocableTrust, formData.spouseIrrevocableTrustName]);

  const openAdd = () => { setModalOpen(true); setIsEdit(false); setEditIndex(null); };
  const openEdit = (index: number) => { setModalOpen(true); setIsEdit(true); setEditIndex(index); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

  const handleSave = (data: OtherAssetData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.otherAssets];
      updated[editIndex] = data;
      updateFormData({ otherAssets: updated });
    } else {
      updateFormData({ otherAssets: [...formData.otherAssets, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ otherAssets: formData.otherAssets.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const getEditData = (): OtherAssetData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.otherAssets[editIndex];
  };

  const total = formData.otherAssets.reduce((sum, a) => {
    const num = parseFloat((a.value || '0').replace(/[^0-9.-]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const fmtTotal = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const hasAny = formData.otherAssets.length > 0;

  return (
    <Box>
      {/* Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Add Other Asset
        </Button>
      </Box>

      {/* Table */}
      {hasAny ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Personal Property Memo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.otherAssets.map((asset, i) => (
                <TableRow
                  key={`other-${i}`}
                  hover
                  onClick={() => openEdit(i)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{asset.description || '-'}</TableCell>
                  <TableCell>{asset.owner || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={asset.addToPersonalPropertyMemo ? 'Yes' : 'No'}
                      size="small"
                      color={asset.addToPersonalPropertyMemo ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(asset.value)}</TableCell>
                </TableRow>
              ))}

              {/* Total row */}
              <TableRow sx={{ bgcolor: '#0a5c36' }}>
                <TableCell colSpan={3} sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                  Total Other Assets
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
            No other assets added yet. Use the button above to add your first asset.
          </Typography>
        </Paper>
      )}

      {/* Modal */}
      <OtherAssetModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={isEdit}
        showSpouse={showSpouseInfo}
        trustFlags={trustFlags}
      />
    </Box>
  );
};

export default OtherAssetsTab;
