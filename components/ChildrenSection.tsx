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
} from '@mui/material';
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import { ChildModal, ChildData } from './ChildModals';
import ChildrenSummaryTable from './ChildrenSummaryTable';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

interface ModalState {
  open: boolean;
  isEdit: boolean;
  editIndex: number | null;
}

const ChildrenSection = () => {
  const { formData, updateFormData } = useFormContext();

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Modal state management
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
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
  const openAddModal = () => {
    setModalState({ open: true, isEdit: false, editIndex: null });
  };

  const openEditModal = (index: number) => {
    setModalState({ open: true, isEdit: true, editIndex: index });
  };

  const closeModal = () => {
    setModalState({ open: false, isEdit: false, editIndex: null });
  };

  const handleSaveChild = (data: ChildData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newChildren = [...formData.children];
      newChildren[modalState.editIndex] = data;
      updateFormData({ children: newChildren });
    } else {
      updateFormData({ children: [...formData.children, data] });
    }
  };

  const handleDeleteChild = () => {
    if (modalState.editIndex !== null) {
      const newChildren = formData.children.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ children: newChildren });
      closeModal();
    }
  };

  const getEditData = (): ChildData | undefined => {
    if (!modalState.isEdit || modalState.editIndex === null) return undefined;
    return formData.children[modalState.editIndex];
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        CHILDREN
      </Typography>

      {/* Children List with Summary Table */}
      <Box sx={{ mb: 4 }}>
        <ChildrenSummaryTable
          children={formData.children}
          onEdit={openEditModal}
          onAdd={openAddModal}
        />
      </Box>

      {/* Child Modal */}
      <ChildModal
        open={modalState.open}
        onClose={closeModal}
        onSave={handleSaveChild}
        onDelete={modalState.isEdit ? handleDeleteChild : undefined}
        initialData={getEditData()}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

      {/* Children Health Questions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Are all of your children in good health?</FormLabel>
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
            <FormLabel component="legend">Are any of your children under the age of 21?</FormLabel>
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
            <FormLabel component="legend">Are any of your children disabled or blind?</FormLabel>
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
            <FormLabel component="legend">Have all of your children completed their education?</FormLabel>
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
            <FormLabel component="legend">Do any of your children have marital problems?</FormLabel>
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
            <FormLabel component="legend">
              Are any of your children receiving SSI or other government entitlement?
            </FormLabel>
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
            <FormLabel component="legend">Drug Addiction?</FormLabel>
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
            <FormLabel component="legend">Alcoholism?</FormLabel>
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
            <FormLabel component="legend">Does any child have financial problems?</FormLabel>
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
          <TextField
            fullWidth
            label="Other"
            value={formData.childrenOtherConcerns}
            onChange={handleChange('childrenOtherConcerns')}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes about your children"
            value={formData.childrenNotes}
            onChange={handleChange('childrenNotes')}
            variant="outlined"
            multiline
            rows={5}
            placeholder="Enter any additional comments or information about your children..."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChildrenSection;
