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
import { folioColors } from './FolioModal';
import {
  OtherAssetModal,
  OtherAssetData,
  OtherAssetCategory,
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

interface OtherAssetsTabProps {
  category?: OtherAssetCategory;
}

const OtherAssetsTab: React.FC<OtherAssetsTabProps> = ({ category = 'other' }) => {
  const { formData, updateFormData } = useFormContext();
  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const isPersonalProperty = category === 'personalProperty';
  const labelSingular = isPersonalProperty ? 'Personal Property Item' : 'Other Asset';
  const labelPlural = isPersonalProperty ? 'Personal Property' : 'Other Assets';
  const emptyMessage = isPersonalProperty
    ? 'No personal property items added yet. Use the button above to add your first item.'
    : 'No other assets added yet. Use the button above to add your first asset.';

  // Build index map: filtered index → real index in formData.otherAssets
  const filteredItems = useMemo(() => {
    return formData.otherAssets
      .map((asset, realIndex) => ({ asset, realIndex }))
      .filter(({ asset }) => (asset.category || 'other') === category);
  }, [formData.otherAssets, category]);

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
  const openEdit = (realIndex: number) => { setModalOpen(true); setIsEdit(true); setEditIndex(realIndex); };
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

  const total = filteredItems.reduce((sum, { asset }) => {
    const num = parseFloat((asset.value || '0').replace(/[^0-9.-]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const fmtTotal = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const hasAny = filteredItems.length > 0;

  return (
    <Box>
      {/* Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Add {labelSingular}
        </Button>
      </Box>

      {/* Table */}
      {hasAny ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600, width: 48 }}>Photo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map(({ asset, realIndex }) => (
                <TableRow
                  key={`other-${realIndex}`}
                  hover
                  onClick={() => openEdit(realIndex)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ width: 48, p: '6px 8px' }}>
                    {asset.photo ? (
                      <Box
                        component="img"
                        src={asset.photo}
                        alt={asset.description || 'Item'}
                        sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 0.5, border: '1px solid', borderColor: 'divider', display: 'block' }}
                      />
                    ) : (
                      <Box sx={{ width: 36, height: 36, bgcolor: 'grey.100', borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }} />
                    )}
                  </TableCell>
                  <TableCell>{asset.description || '-'}</TableCell>
                  <TableCell>{asset.owner || '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(asset.value)}</TableCell>
                </TableRow>
              ))}

              {/* Total row */}
              <TableRow sx={{ bgcolor: folioColors.ink }}>
                <TableCell colSpan={3} sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                  Total {labelPlural}
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
            {emptyMessage}
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
        defaultCategory={category}
      />
    </Box>
  );
};

export default OtherAssetsTab;
