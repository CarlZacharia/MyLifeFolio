'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import { useFormContext, MaritalStatus, PetData } from '../lib/FormContext';
import { ChildModal, ChildData } from './ChildModals';
import ChildrenSummaryTable from './ChildrenSummaryTable';
import { BeneficiaryModal, CharityModal, BeneficiaryData, CharityData } from './BeneficiaryModals';
import { BeneficiariesSummaryTable, CharitiesSummaryTable } from './BeneficiariesSummaryTable';
import PetCareSection from './PetCareSection';
import { folioColors } from './FolioModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// Calculate age from birth date
const calculateAge = (dateString: string | null | undefined): number | null => {
  if (!dateString) return null;

  const date = typeof dateString === 'string' ? dateString : String(dateString);
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return null;

  const birthDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
};

type ModalType = 'child' | 'beneficiary' | 'charity' | null;

interface ModalState {
  type: ModalType;
  isEdit: boolean;
  editIndex: number | null;
}

const BeneficiariesSection = () => {
  const { formData, updateFormData } = useFormContext();

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Determine if there are any children (from client or spouse)
  const hasChildren = formData.children.length > 0;

  // Determine if there are any beneficiaries at all (children, other beneficiaries, or charities)
  const hasAnyBeneficiaries =
    formData.children.length > 0 ||
    formData.otherBeneficiaries.length > 0 ||
    formData.charities.length > 0;

  // Check if any child is under 21
  const hasChildUnder21 = useMemo(() => {
    return formData.children.some((child) => {
      const age = calculateAge(child.birthDate);
      return age !== null && age < 21;
    });
  }, [formData.children]);

  // Get list of children under 21 with their ages
  const childrenUnder21Text = useMemo(() => {
    const childrenUnder21 = formData.children
      .filter((child) => {
        const age = calculateAge(child.birthDate);
        return age !== null && age < 21;
      })
      .map((child) => {
        const age = calculateAge(child.birthDate);
        return `${child.name} (age ${age})`;
      });
    return childrenUnder21.join(', ');
  }, [formData.children]);

  // Automatically set anyBeneficiariesMinors to true and populate explanation if any child is under 21
  useEffect(() => {
    if (hasChildUnder21) {
      const updates: Record<string, unknown> = {};
      if (!formData.anyBeneficiariesMinors) {
        updates.anyBeneficiariesMinors = true;
      }
      // Only auto-populate if the field is empty or if it was previously auto-populated
      if (!formData.beneficiaryMinorsExplanation || formData.beneficiaryMinorsExplanation === '') {
        updates.beneficiaryMinorsExplanation = childrenUnder21Text;
      }
      if (Object.keys(updates).length > 0) {
        updateFormData(updates);
      }
    }
  }, [hasChildUnder21, childrenUnder21Text, formData.anyBeneficiariesMinors, formData.beneficiaryMinorsExplanation, updateFormData]);

  // Modal state management
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isEdit: false,
    editIndex: null,
  });

  const handleRadioChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value === 'yes' });
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

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

  // Child handlers
  const handleSaveChild = (data: ChildData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newChildren = [...formData.children];
      newChildren[modalState.editIndex] = data;
      updateFormData({ children: newChildren });
    } else {
      updateFormData({ children: [...formData.children, data] });
    }
    closeModal();
  };

  const handleDeleteChild = () => {
    if (modalState.editIndex !== null) {
      const newChildren = formData.children.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ children: newChildren });
      closeModal();
    }
  };

  const getChildEditData = (): ChildData | undefined => {
    if (modalState.type !== 'child' || !modalState.isEdit || modalState.editIndex === null) return undefined;
    return formData.children[modalState.editIndex];
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
    closeModal();
  };

  const handleDeleteBeneficiary = () => {
    if (modalState.editIndex !== null) {
      const newBeneficiaries = formData.otherBeneficiaries.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ otherBeneficiaries: newBeneficiaries });
      closeModal();
    }
  };

  const getBeneficiaryEditData = (): BeneficiaryData | undefined => {
    if (modalState.type !== 'beneficiary' || !modalState.isEdit || modalState.editIndex === null) return undefined;
    return formData.otherBeneficiaries[modalState.editIndex];
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
    closeModal();
  };

  const handleDeleteCharity = () => {
    if (modalState.editIndex !== null) {
      const newCharities = formData.charities.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ charities: newCharities });
      closeModal();
    }
  };

  const getCharityEditData = (): CharityData | undefined => {
    if (modalState.type !== 'charity' || !modalState.isEdit || modalState.editIndex === null) return undefined;
    return formData.charities[modalState.editIndex];
  };

  return (
    <Box>
      {/* Main Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: folioColors.ink }}>
          CHILDREN
        </Typography>
      </Box>

      {/* Category 1: Children */}
      <Box sx={{ mb: 4 }}>
        {/* Children List with Summary Table */}
        <Box sx={{ mb: 3 }}>
          <ChildrenSummaryTable
            children={formData.children}
            onEdit={(index) => openEditModal('child', index)}
            onAdd={() => openAddModal('child')}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Category 2: Other Beneficiaries (or just "Beneficiaries" if no children) */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {hasChildren ? 'Other Family Members' : 'Other Family Members'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include grandchildren, cousins, friends, or any other individuals you wish to include.
        </Typography>
        <BeneficiariesSummaryTable
          beneficiaries={formData.otherBeneficiaries}
          onEditBeneficiary={(index) => openEditModal('beneficiary', index)}
          onAddBeneficiary={() => openAddModal('beneficiary')}
        />
      </Box>

      {/* Category 3: Charities - only show if user desires to leave to charity */}
      {formData.leaveToCharity && (
        <>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                3. Charities
              </Typography>
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
        </>
      )}

      {/* Pet Care Section */}
      <Divider sx={{ my: 4 }} />
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Pet Care
          </Typography>
        </Box>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">
            Do you have a pet or pets that you want cared for if you become unable or when you pass away?
          </FormLabel>
          <RadioGroup
            row
            value={formData.hasPetsForCare ? 'yes' : 'no'}
            onChange={handleRadioChange('hasPetsForCare')}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        {formData.hasPetsForCare && (
          <PetCareSection
            pets={formData.pets}
            onUpdatePets={(pets: PetData[]) => updateFormData({ pets })}
          />
        )}
      </Box>

      {/* Child Modal */}
      <ChildModal
        open={modalState.type === 'child'}
        onClose={closeModal}
        onSave={handleSaveChild}
        onDelete={modalState.isEdit ? handleDeleteChild : undefined}
        initialData={getChildEditData()}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

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

    </Box>
  );
};

export default BeneficiariesSection;
