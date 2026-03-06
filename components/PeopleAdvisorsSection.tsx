'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
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
import FriendNeighborModal, { FriendNeighborData } from './FriendNeighborModal';

const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

const PeopleAdvisorsSection = () => {
  const { formData, updateFormData } = useFormContext();

  // Advisor modal state
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);
  const [advisorIsEdit, setAdvisorIsEdit] = useState(false);
  const [advisorEditIndex, setAdvisorEditIndex] = useState<number | null>(null);
  const [defaultType, setDefaultType] = useState('');

  // Friend/Neighbor modal state
  const [fnModalOpen, setFnModalOpen] = useState(false);
  const [fnIsEdit, setFnIsEdit] = useState(false);
  const [fnEditIndex, setFnEditIndex] = useState<number | null>(null);

  // Advisor handlers
  const openAddAdvisor = (type: string) => {
    setDefaultType(type);
    setAdvisorIsEdit(false);
    setAdvisorEditIndex(null);
    setAdvisorModalOpen(true);
  };

  const openEditAdvisor = (index: number) => {
    setAdvisorIsEdit(true);
    setAdvisorEditIndex(index);
    setDefaultType('');
    setAdvisorModalOpen(true);
  };

  const closeAdvisorModal = () => {
    setAdvisorModalOpen(false);
    setAdvisorIsEdit(false);
    setAdvisorEditIndex(null);
    setDefaultType('');
  };

  const handleSaveAdvisor = (data: AdvisorData) => {
    if (advisorIsEdit && advisorEditIndex !== null) {
      const updated = [...formData.advisors];
      updated[advisorEditIndex] = data;
      updateFormData({ advisors: updated });
    } else {
      updateFormData({ advisors: [...formData.advisors, data] });
    }
  };

  const handleDeleteAdvisor = () => {
    if (advisorEditIndex !== null) {
      updateFormData({ advisors: formData.advisors.filter((_, i) => i !== advisorEditIndex) });
      closeAdvisorModal();
    }
  };

  const getAdvisorEditData = (): AdvisorData | undefined => {
    if (!advisorIsEdit || advisorEditIndex === null) return undefined;
    return formData.advisors[advisorEditIndex] as AdvisorData;
  };

  const getAdvisorsByType = (type: string) =>
    formData.advisors
      .map((a, i) => ({ ...a, originalIndex: i }))
      .filter((a) => a.advisorType === type);

  // Which types have entries
  const typesWithEntries = ADVISOR_TYPES.filter(
    (type) => formData.advisors.some((a) => a.advisorType === type)
  );
  const hasAnyAdvisors = typesWithEntries.length > 0;

  // Friend/Neighbor handlers
  const openAddFn = () => {
    setFnIsEdit(false);
    setFnEditIndex(null);
    setFnModalOpen(true);
  };

  const openEditFn = (index: number) => {
    setFnIsEdit(true);
    setFnEditIndex(index);
    setFnModalOpen(true);
  };

  const closeFnModal = () => {
    setFnModalOpen(false);
    setFnIsEdit(false);
    setFnEditIndex(null);
  };

  const handleSaveFn = (data: FriendNeighborData) => {
    if (fnIsEdit && fnEditIndex !== null) {
      const updated = [...formData.friendsNeighbors];
      updated[fnEditIndex] = data;
      updateFormData({ friendsNeighbors: updated });
    } else {
      updateFormData({ friendsNeighbors: [...formData.friendsNeighbors, data] });
    }
  };

  const handleDeleteFn = () => {
    if (fnEditIndex !== null) {
      updateFormData({ friendsNeighbors: formData.friendsNeighbors.filter((_, i) => i !== fnEditIndex) });
      closeFnModal();
    }
  };

  const getFnEditData = (): FriendNeighborData | undefined => {
    if (!fnIsEdit || fnEditIndex === null) return undefined;
    return formData.friendsNeighbors[fnEditIndex] as FriendNeighborData;
  };

  return (
    <Box>
      {/* ── Advisor Add Buttons ── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {ADVISOR_TYPES.map((type) => (
          <Button
            key={type}
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => openAddAdvisor(type)}
            size="small"
          >
            {type}
          </Button>
        ))}
      </Box>

      {/* ── Unified Advisors Table ── */}
      {hasAnyAdvisors ? (
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
              {typesWithEntries.map((type) => {
                const advisors = getAdvisorsByType(type);
                return (
                  <React.Fragment key={type}>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          bgcolor: '#2d6a4f',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          py: 1,
                        }}
                      >
                        {type}
                      </TableCell>
                    </TableRow>
                    {advisors.map((advisor) => (
                      <TableRow
                        key={advisor.originalIndex}
                        hover
                        onClick={() => openEditAdvisor(advisor.originalIndex)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{advisor.name || '-'}</TableCell>
                        <TableCell>{advisor.firmName || '-'}</TableCell>
                        <TableCell>{advisor.phone ? formatPhone(advisor.phone) : '-'}</TableCell>
                        <TableCell>{advisor.email || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No advisors added yet. Use the buttons above to add your first advisor.
          </Typography>
        </Paper>
      )}

      {/* ── Friends & Neighbors ── */}
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Friends & Neighbors
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>
          These are trusted individuals close to you—such as friends, neighbors, or former colleagues—who may need to be contacted in case of emergency, or who can help your family locate important information about you.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openAddFn} size="small">
          Add Friend or Neighbor
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.friendsNeighbors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No friends or neighbors added yet.
                </TableCell>
              </TableRow>
            ) : (
              formData.friendsNeighbors.map((fn, i) => (
                <TableRow
                  key={i}
                  hover
                  onClick={() => openEditFn(i)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{fn.name || '-'}</TableCell>
                  <TableCell>{fn.relationship || '-'}</TableCell>
                  <TableCell>{fn.phone ? formatPhone(fn.phone) : '-'}</TableCell>
                  <TableCell>{fn.email || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals */}
      <AdvisorModal
        open={advisorModalOpen}
        onClose={closeAdvisorModal}
        onSave={handleSaveAdvisor}
        onDelete={advisorIsEdit ? handleDeleteAdvisor : undefined}
        initialData={getAdvisorEditData()}
        isEdit={advisorIsEdit}
        defaultType={defaultType}
      />

      <FriendNeighborModal
        open={fnModalOpen}
        onClose={closeFnModal}
        onSave={handleSaveFn}
        onDelete={fnIsEdit ? handleDeleteFn : undefined}
        initialData={getFnEditData()}
        isEdit={fnIsEdit}
      />
    </Box>
  );
};

export default PeopleAdvisorsSection;
