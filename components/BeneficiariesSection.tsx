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
import { HelpIcon, VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';
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

  // Help modal state
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

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
        <VideoHelpIcon helpId={101} onClick={() => openHelp(101)} size="medium" />
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
          <VideoHelpIcon helpId={102} onClick={() => openHelp(102)} size="small" />
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
              <VideoHelpIcon helpId={103} onClick={() => openHelp(103)} size="small" />
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

      {/* Beneficiary Concerns - only show if there are any beneficiaries */}
      {hasAnyBeneficiaries && (
        <>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Family Member Concerns
              </Typography>
              <HelpIcon helpId={30} onClick={() => openHelp(30)} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please answer the following questions about any of your family members (children, other individuals, etc.).
            </Typography>

            <Grid container spacing={3}>
              {/* Row 1: Minors and Disabled */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel component="legend">Are any of your family members under the age of 21?</FormLabel>
                    <HelpIcon helpId={31} onClick={() => openHelp(31)} />
                  </Box>
                  <RadioGroup
                    row
                    value={formData.anyBeneficiariesMinors ? 'yes' : 'no'}
                    onChange={handleRadioChange('anyBeneficiariesMinors')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.anyBeneficiariesMinors && (
                  <TextField
                    fullWidth
                    label="Who is under 21 and their ages"
                    value={formData.beneficiaryMinorsExplanation}
                    onChange={handleChange('beneficiaryMinorsExplanation')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel component="legend">Are any of your family members disabled or blind?</FormLabel>
                    <HelpIcon helpId={32} onClick={() => openHelp(32)} />
                  </Box>
                  <RadioGroup
                    row
                    value={formData.anyBeneficiariesDisabled ? 'yes' : 'no'}
                    onChange={handleRadioChange('anyBeneficiariesDisabled')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.anyBeneficiariesDisabled && (
                  <TextField
                    fullWidth
                    label="Who is disabled or blind and describe the condition"
                    value={formData.beneficiaryDisabledExplanation}
                    onChange={handleChange('beneficiaryDisabledExplanation')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              {/* Row 2: Marital Problems and SSI */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel component="legend">Do any of your family members have marital problems?</FormLabel>
                    <HelpIcon helpId={34} onClick={() => openHelp(34)} />
                  </Box>
                  <RadioGroup
                    row
                    value={formData.anyBeneficiariesMaritalProblems ? 'yes' : 'no'}
                    onChange={handleRadioChange('anyBeneficiariesMaritalProblems')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.anyBeneficiariesMaritalProblems && (
                  <TextField
                    fullWidth
                    label="Who has marital problems and describe the situation"
                    value={formData.beneficiaryMaritalProblemsExplanation}
                    onChange={handleChange('beneficiaryMaritalProblemsExplanation')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <FormLabel component="legend" sx={{ display: 'inline' }}>
                      Are any of your family members receiving SSI or other government entitlement?
                      <HelpIcon helpId={35} onClick={() => openHelp(35)} />
                    </FormLabel>
                  </Box>
                  <RadioGroup
                    row
                    value={formData.anyBeneficiariesReceivingSSI ? 'yes' : 'no'}
                    onChange={handleRadioChange('anyBeneficiariesReceivingSSI')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.anyBeneficiariesReceivingSSI && (
                  <TextField
                    fullWidth
                    label="Who receives benefits and what type"
                    value={formData.beneficiarySSIExplanation}
                    onChange={handleChange('beneficiarySSIExplanation')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              {/* Row 3: Drug Addiction and Alcoholism */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel component="legend">Does any family member have a drug addiction?</FormLabel>
                    <HelpIcon helpId={36} onClick={() => openHelp(36)} />
                  </Box>
                  <RadioGroup
                    row
                    value={formData.anyBeneficiaryDrugAddiction ? 'yes' : 'no'}
                    onChange={handleRadioChange('anyBeneficiaryDrugAddiction')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.anyBeneficiaryDrugAddiction && (
                  <TextField
                    fullWidth
                    label="Who is affected and any relevant details"
                    value={formData.beneficiaryDrugAddictionExplanation}
                    onChange={handleChange('beneficiaryDrugAddictionExplanation')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel component="legend">Does any family member have alcoholism?</FormLabel>
                    <HelpIcon helpId={37} onClick={() => openHelp(37)} />
                  </Box>
                  <RadioGroup
                    row
                    value={formData.anyBeneficiaryAlcoholism ? 'yes' : 'no'}
                    onChange={handleRadioChange('anyBeneficiaryAlcoholism')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.anyBeneficiaryAlcoholism && (
                  <TextField
                    fullWidth
                    label="Who is affected and any relevant details"
                    value={formData.beneficiaryAlcoholismExplanation}
                    onChange={handleChange('beneficiaryAlcoholismExplanation')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              {/* Row 4: Financial Problems and Other Concerns */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel component="legend">Does any family member have financial problems?</FormLabel>
                    <HelpIcon helpId={38} onClick={() => openHelp(38)} />
                  </Box>
                  <RadioGroup
                    row
                    value={formData.anyBeneficiaryFinancialProblems ? 'yes' : 'no'}
                    onChange={handleRadioChange('anyBeneficiaryFinancialProblems')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.anyBeneficiaryFinancialProblems && (
                  <TextField
                    fullWidth
                    label="Who has financial issues and describe the situation"
                    value={formData.beneficiaryFinancialProblemsExplanation}
                    onChange={handleChange('beneficiaryFinancialProblemsExplanation')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel component="legend">Are there any other concerns about your family members?</FormLabel>
                    <HelpIcon helpId={39} onClick={() => openHelp(39)} />
                  </Box>
                  <RadioGroup
                    row
                    value={formData.hasOtherBeneficiaryConcerns ? 'yes' : 'no'}
                    onChange={handleRadioChange('hasOtherBeneficiaryConcerns')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
                {formData.hasOtherBeneficiaryConcerns && (
                  <TextField
                    fullWidth
                    label="Describe any other concerns"
                    value={formData.beneficiaryOtherConcerns}
                    onChange={handleChange('beneficiaryOtherConcerns')}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional notes about your family members"
                  value={formData.beneficiaryNotes}
                  onChange={handleChange('beneficiaryNotes')}
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Enter any additional comments or information about your family members..."
                />
              </Grid>
            </Grid>
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
          <HelpIcon helpId={40} onClick={() => openHelp(40)} />
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

      {/* Help Modal */}
      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default BeneficiariesSection;
