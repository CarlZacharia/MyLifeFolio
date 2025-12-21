'use client';

import React, { useState } from 'react';
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
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import { ChildModal, ChildData } from './ChildModals';
import ChildrenSummaryTable from './ChildrenSummaryTable';
import { BeneficiaryModal, CharityModal, BeneficiaryData, CharityData } from './BeneficiaryModals';
import { BeneficiariesSummaryTable, CharitiesSummaryTable } from './BeneficiariesSummaryTable';
import { HelpIcon, VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

type ModalType = 'child' | 'beneficiary' | 'charity' | null;

interface ModalState {
  type: ModalType;
  isEdit: boolean;
  editIndex: number | null;
}

const BeneficiariesSection = () => {
  const { formData, updateFormData } = useFormContext();

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

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
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          BENEFICIARIES
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

        {/* Children Health Questions - only show if there are children */}
        {formData.children.length > 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Are all of your children in good health?</FormLabel>
                  <HelpIcon helpId={30} onClick={() => openHelp(30)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.allChildrenHealthy ? 'yes' : 'no'}
                  onChange={handleRadioChange('allChildrenHealthy')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {!formData.allChildrenHealthy && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please explain"
                  value={formData.childrenHealthExplanation}
                  onChange={handleChange('childrenHealthExplanation')}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Are any of your children under the age of 21?</FormLabel>
                  <HelpIcon helpId={31} onClick={() => openHelp(31)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.anyChildrenMinors ? 'yes' : 'no'}
                  onChange={handleRadioChange('anyChildrenMinors')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Are any of your children disabled or blind?</FormLabel>
                  <HelpIcon helpId={32} onClick={() => openHelp(32)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.anyChildrenDisabled ? 'yes' : 'no'}
                  onChange={handleRadioChange('anyChildrenDisabled')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Have all of your children completed their education?</FormLabel>
                  <HelpIcon helpId={33} onClick={() => openHelp(33)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.allChildrenEducated ? 'yes' : 'no'}
                  onChange={handleRadioChange('allChildrenEducated')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Do any of your children have marital problems?</FormLabel>
                  <HelpIcon helpId={34} onClick={() => openHelp(34)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.anyChildrenMaritalProblems ? 'yes' : 'no'}
                  onChange={handleRadioChange('anyChildrenMaritalProblems')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">
                    Are any of your children receiving SSI or other government entitlement?
                  </FormLabel>
                  <HelpIcon helpId={35} onClick={() => openHelp(35)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.anyChildrenReceivingSSI ? 'yes' : 'no'}
                  onChange={handleRadioChange('anyChildrenReceivingSSI')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Drug Addiction?</FormLabel>
                  <HelpIcon helpId={36} onClick={() => openHelp(36)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.drugAddiction ? 'yes' : 'no'}
                  onChange={handleRadioChange('drugAddiction')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Alcoholism?</FormLabel>
                  <HelpIcon helpId={37} onClick={() => openHelp(37)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.alcoholism ? 'yes' : 'no'}
                  onChange={handleRadioChange('alcoholism')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Does any child have financial problems?</FormLabel>
                  <HelpIcon helpId={38} onClick={() => openHelp(38)} />
                </Box>
                <RadioGroup
                  row
                  value={formData.spendthrift ? 'yes' : 'no'}
                  onChange={handleRadioChange('spendthrift')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset" fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel component="legend">Other</FormLabel>
                  <HelpIcon helpId={39} onClick={() => openHelp(39)} />
                </Box>
                <TextField
                  fullWidth
                  value={formData.childrenOtherConcerns}
                  onChange={handleChange('childrenOtherConcerns')}
                  variant="outlined"
                  size="small"
                  placeholder="Any other concerns..."
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes about your children"
                value={formData.childrenNotes}
                onChange={handleChange('childrenNotes')}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Enter any additional comments or information about your children..."
              />
            </Grid>
          </Grid>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Category 2: Other Beneficiaries */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            2. Other Beneficiaries
          </Typography>
          <VideoHelpIcon helpId={102} onClick={() => openHelp(102)} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include grandchildren, cousins, friends, or any other individuals you wish to name as beneficiaries.
        </Typography>
        <BeneficiariesSummaryTable
          beneficiaries={formData.otherBeneficiaries}
          onEditBeneficiary={(index) => openEditModal('beneficiary', index)}
          onAddBeneficiary={() => openAddModal('beneficiary')}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Category 3: Charities */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            3. Charities
          </Typography>
          <VideoHelpIcon helpId={103} onClick={() => openHelp(103)} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include any charitable organizations you wish to name as beneficiaries.
        </Typography>
        <CharitiesSummaryTable
          charities={formData.charities}
          onEditCharity={(index) => openEditModal('charity', index)}
          onAddCharity={() => openAddModal('charity')}
        />
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
