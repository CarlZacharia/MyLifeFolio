'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PetsIcon from '@mui/icons-material/Pets';
import { PetData } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import PetModal from './PetModal';

interface PetCareSectionProps {
  pets: PetData[];
  onUpdatePets: (pets: PetData[]) => void;
}

export default function PetCareSection({ pets, onUpdatePets }: PetCareSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleAddClick = () => {
    setEditIndex(null);
    setModalOpen(true);
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setModalOpen(true);
  };

  const handleSave = (data: PetData) => {
    if (editIndex !== null) {
      const newPets = [...pets];
      newPets[editIndex] = data;
      onUpdatePets(newPets);
    } else {
      onUpdatePets([...pets, data]);
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      onUpdatePets(pets.filter((_, i) => i !== editIndex));
      setModalOpen(false);
    }
  };

  return (
    <Box>
      {pets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <PetsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No pets added yet. Click below to add a pet.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: folioColors.inkLight, borderBottom: `2px solid ${folioColors.parchment}` } }}>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Breed</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Caretaker</TableCell>
                <TableCell align="right" sx={{ width: 60 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pets.map((pet, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '& td': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink, borderBottom: `1px solid ${folioColors.parchment}` },
                  }}
                  onClick={() => handleEditClick(index)}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PetsIcon sx={{ fontSize: 18, color: folioColors.accent }} />
                      {pet.petName || `Pet ${index + 1}`}
                    </Box>
                  </TableCell>
                  <TableCell>{pet.petType === 'Other' ? pet.petTypeOther || 'Other' : pet.petType || '—'}</TableCell>
                  <TableCell>{pet.breed || '—'}</TableCell>
                  <TableCell>{pet.age || '—'}</TableCell>
                  <TableCell>{pet.preferredCaretaker || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(index);
                      }}
                    >
                      <EditIcon fontSize="small" sx={{ color: folioColors.inkLight }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Pet
        </Button>
      </Box>

      <PetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={editIndex !== null ? handleDelete : undefined}
        initialData={editIndex !== null ? pets[editIndex] : undefined}
        isEdit={editIndex !== null}
      />
    </Box>
  );
}
