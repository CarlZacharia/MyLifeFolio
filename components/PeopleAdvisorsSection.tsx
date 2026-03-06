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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';
import AdvisorModal, { AdvisorData, ADVISOR_TYPES } from './AdvisorModal';

const PeopleAdvisorsSection = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [defaultType, setDefaultType] = useState('');

  const openAdd = (type: string) => {
    setDefaultType(type);
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setDefaultType('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
    setDefaultType('');
  };

  const handleSave = (data: AdvisorData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.advisors];
      updated[editIndex] = data;
      updateFormData({ advisors: updated });
    } else {
      updateFormData({ advisors: [...formData.advisors, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ advisors: formData.advisors.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const getEditData = (): AdvisorData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.advisors[editIndex] as AdvisorData;
  };

  const getAdvisorsByType = (type: string) =>
    formData.advisors
      .map((a, i) => ({ ...a, originalIndex: i }))
      .filter((a) => a.advisorType === type);

  return (
    <Box>
      {ADVISOR_TYPES.map((type) => {
        const advisors = getAdvisorsByType(type);

        return (
          <Box key={type} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {type}
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(type)} size="small">
                Add {type}
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Firm/Practice</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advisors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No {type.toLowerCase()} added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    advisors.map((advisor) => (
                      <TableRow
                        key={advisor.originalIndex}
                        hover
                        onClick={() => openEdit(advisor.originalIndex)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{advisor.name || '-'}</TableCell>
                        <TableCell>{advisor.firmName || '-'}</TableCell>
                        <TableCell>{advisor.phone || '-'}</TableCell>
                        <TableCell>{advisor.email || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}

      <AdvisorModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
        defaultType={defaultType}
      />
    </Box>
  );
};

export default PeopleAdvisorsSection;
