'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useFormContext } from '../lib/FormContext';
import { BeneficiaryModal, CharityModal, BeneficiaryData, CharityData } from './BeneficiaryModals';
import { BeneficiariesSummaryTable, CharitiesSummaryTable } from './BeneficiariesSummaryTable';
import { VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';
import { folioColors } from './FolioModal';

type ModalType = 'beneficiary' | 'charity' | null;

interface ModalState {
  type: ModalType;
  isEdit: boolean;
  editIndex: number | null;
}

const OtherBeneficiariesSection = () => {
  const { formData, updateFormData } = useFormContext();

  // Modal state management
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isEdit: false,
    editIndex: null,
  });

  // Help modal state
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  // Modal handlers
  const openAddModal = (type: ModalType) => {
    setModalState({ type, isEdit: false, editIndex: null });
  };

  const openEditModal = (type: ModalType, index: number) => {
    setModalState({ type, isEdit: true, editIndex: index });
  };

  const closeModal = () => {
    setModalState({ type: null, isEdit: false, editIndex: null });
  };

  // Beneficiary handlers
  const handleSaveBeneficiary = (data: BeneficiaryData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newBeneficiaries = [...formData.otherBeneficiaries];
      newBeneficiaries[modalState.editIndex] = data;
      updateFormData({ otherBeneficiaries: newBeneficiaries });
    } else {
      updateFormData({ otherBeneficiaries: [...formData.otherBeneficiaries, data] });
    }
  };

  const handleDeleteBeneficiary = () => {
    if (modalState.editIndex !== null) {
      const newBeneficiaries = formData.otherBeneficiaries.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ otherBeneficiaries: newBeneficiaries });
      closeModal();
    }
  };

  // Charity handlers
  const handleSaveCharity = (data: CharityData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newCharities = [...formData.charities];
      newCharities[modalState.editIndex] = data;
      updateFormData({ charities: newCharities });
    } else {
      updateFormData({ charities: [...formData.charities, data] });
    }
  };

  const handleDeleteCharity = () => {
    if (modalState.editIndex !== null) {
      const newCharities = formData.charities.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ charities: newCharities });
      closeModal();
    }
  };

  // Get initial data for edit modals
  const getBeneficiaryEditData = (): BeneficiaryData | undefined => {
    if (modalState.type !== 'beneficiary' || !modalState.isEdit || modalState.editIndex === null) return undefined;
    return formData.otherBeneficiaries[modalState.editIndex];
  };

  const getCharityEditData = (): CharityData | undefined => {
    if (modalState.type !== 'charity' || !modalState.isEdit || modalState.editIndex === null) return undefined;
    return formData.charities[modalState.editIndex];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: folioColors.ink }}>
          OTHER FAMILY MEMBERS
        </Typography>
        <VideoHelpIcon helpId={102} onClick={() => openHelp(102)} size="medium" />
      </Box>

      {/* Other Beneficiaries */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include grandchildren, cousins, friends, or any other individuals you wish to include.
        </Typography>
        <BeneficiariesSummaryTable
          beneficiaries={formData.otherBeneficiaries}
          onEditBeneficiary={(index) => openEditModal('beneficiary', index)}
          onAddBeneficiary={() => openAddModal('beneficiary')}
        />
      </Box>

      {/* Charities */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: folioColors.ink }}>
            CHARITIES
          </Typography>
          <VideoHelpIcon helpId={103} onClick={() => openHelp(103)} size="medium" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include any charitable organizations you wish to include.
        </Typography>
        <CharitiesSummaryTable
          charities={formData.charities}
          onEditCharity={(index) => openEditModal('charity', index)}
          onAddCharity={() => openAddModal('charity')}
        />
      </Box>

      {/* Beneficiary Modal */}
      <BeneficiaryModal
        open={modalState.type === 'beneficiary'}
        onClose={closeModal}
        onSave={handleSaveBeneficiary}
        onDelete={modalState.isEdit ? handleDeleteBeneficiary : undefined}
        initialData={getBeneficiaryEditData()}
        isEdit={modalState.isEdit}
      />

      {/* Charity Modal */}
      <CharityModal
        open={modalState.type === 'charity'}
        onClose={closeModal}
        onSave={handleSaveCharity}
        onDelete={modalState.isEdit ? handleDeleteCharity : undefined}
        initialData={getCharityEditData()}
        isEdit={modalState.isEdit}
      />

      {/* Help Modal */}
      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default OtherBeneficiariesSection;
