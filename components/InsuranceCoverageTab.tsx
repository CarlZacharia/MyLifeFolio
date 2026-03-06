'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Tab,
  Tabs,
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
import MedicalInsuranceModal, { MedicalInsurancePolicyData } from './MedicalInsuranceModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const formatCurrency = (value: string): string => {
  if (!value) return '-';
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const InsuranceCoverageTab = () => {
  const { formData, updateFormData } = useFormContext();
  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const [personTab, setPersonTab] = useState(0); // 0 = Client, 1 = Spouse

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPerson, setModalPerson] = useState<'client' | 'spouse'>('client');
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = (person: 'client' | 'spouse') => {
    setModalPerson(person);
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setModalPerson(formData.medicalInsurancePolicies[index].person);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: MedicalInsurancePolicyData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.medicalInsurancePolicies];
      updated[editIndex] = data;
      updateFormData({ medicalInsurancePolicies: updated });
    } else {
      updateFormData({ medicalInsurancePolicies: [...formData.medicalInsurancePolicies, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        medicalInsurancePolicies: formData.medicalInsurancePolicies.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): MedicalInsurancePolicyData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.medicalInsurancePolicies[editIndex] as MedicalInsurancePolicyData;
  };

  const getByPerson = (person: 'client' | 'spouse') =>
    formData.medicalInsurancePolicies
      .map((p, i) => ({ ...p, originalIndex: i }))
      .filter((p) => p.person === person);

  const isSpouseView = personTab === 1;
  const currentPerson: 'client' | 'spouse' = isSpouseView ? 'spouse' : 'client';
  const policies = getByPerson(currentPerson);

  return (
    <Box>
      {showSpouse && (
        <Tabs
          value={personTab}
          onChange={(_, v) => setPersonTab(v)}
          sx={{
            mb: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
          }}
        >
          <Tab label="Client" />
          <Tab label="Spouse" />
        </Tabs>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => openAdd(currentPerson)}
          size="small"
        >
          Medical Insurance
        </Button>
      </Box>

      {policies.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Policy No.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Monthly Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((policy) => (
                <TableRow
                  key={policy.originalIndex}
                  hover
                  onClick={() => openEdit(policy.originalIndex)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{policy.insuranceType || '-'}</TableCell>
                  <TableCell>{policy.provider || '-'}</TableCell>
                  <TableCell>{policy.policyNo || '-'}</TableCell>
                  <TableCell>{formatCurrency(policy.monthlyCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No insurance coverage added yet. Use the button above to add a policy.
          </Typography>
        </Paper>
      )}

      <MedicalInsuranceModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
        person={modalPerson}
      />
    </Box>
  );
};

export default InsuranceCoverageTab;
