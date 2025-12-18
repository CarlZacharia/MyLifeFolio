'use client';

import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import AssetsSummaryTable from './AssetsSummaryTable';

import {
  RealEstateModal,
  BankAccountModal,
  NonQualifiedInvestmentModal,
  RetirementAccountModal,
  LifeInsuranceModal,
  VehicleModal,
  OtherAssetModal,
  RealEstateData,
  BankAccountData,
  NonQualifiedInvestmentData,
  RetirementAccountData,
  LifeInsuranceData,
  VehicleData,
  OtherAssetData,
  BeneficiaryOption,
} from './AssetModals';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

type ModalType =
  | 'realEstate'
  | 'bankAccount'
  | 'nonQualifiedInvestment'
  | 'retirementAccount'
  | 'lifeInsurance'
  | 'vehicle'
  | 'otherAsset'
  | null;

interface ModalState {
  type: ModalType;
  isEdit: boolean;
  editIndex: number | null;
}

const AssetsSection = () => {
  const { formData, updateFormData } = useFormContext();

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Modal state management
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isEdit: false,
    editIndex: null,
  });

  // Build beneficiary options from all sources
  const beneficiaryOptions = useMemo((): BeneficiaryOption[] => {
    const options: BeneficiaryOption[] = [];

    // Add spouse if available and married
    if (showSpouseInfo && formData.spouseName) {
      options.push({ value: `spouse:${formData.spouseName}`, label: `${formData.spouseName} (Spouse)` });
    }

    // Add client if available
    if (formData.name) {
      options.push({ value: `client:${formData.name}`, label: `${formData.name} (Client)` });
    }

    // Add all children
    formData.children.forEach((child, index) => {
      if (child.name) {
        options.push({ value: `child:${index}:${child.name}`, label: `${child.name} (Child)` });
      }
    });

    // Add all grandchildren
    formData.grandchildren.forEach((grandchild, index) => {
      if (grandchild.name) {
        options.push({ value: `grandchild:${index}:${grandchild.name}`, label: `${grandchild.name} (Grandchild)` });
      }
    });

    // Add other beneficiaries
    formData.otherBeneficiaries.forEach((beneficiary, index) => {
      if (beneficiary.name) {
        options.push({ value: `beneficiary:${index}:${beneficiary.name}`, label: `${beneficiary.name} (Other)` });
      }
    });

    return options;
  }, [showSpouseInfo, formData.spouseName, formData.name, formData.children, formData.grandchildren, formData.otherBeneficiaries]);

  // Modal open handlers
  const openAddModal = (type: ModalType) => {
    setModalState({ type, isEdit: false, editIndex: null });
  };

  const openEditModal = (type: ModalType, index: number) => {
    setModalState({ type, isEdit: true, editIndex: index });
  };

  const closeModal = () => {
    setModalState({ type: null, isEdit: false, editIndex: null });
  };

  // Real Estate handlers
  const handleSaveRealEstate = (data: RealEstateData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newRealEstate = [...formData.realEstate];
      newRealEstate[modalState.editIndex] = data;
      updateFormData({ realEstate: newRealEstate });
    } else {
      updateFormData({ realEstate: [...formData.realEstate, data] });
    }
  };

  const handleDeleteRealEstate = () => {
    if (modalState.editIndex !== null) {
      const newRealEstate = formData.realEstate.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ realEstate: newRealEstate });
      closeModal();
    }
  };

  // Bank Account handlers
  const handleSaveBankAccount = (data: BankAccountData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newBankAccounts = [...formData.bankAccounts];
      newBankAccounts[modalState.editIndex] = data;
      updateFormData({ bankAccounts: newBankAccounts });
    } else {
      updateFormData({ bankAccounts: [...formData.bankAccounts, data] });
    }
  };

  const handleDeleteBankAccount = () => {
    if (modalState.editIndex !== null) {
      const newBankAccounts = formData.bankAccounts.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ bankAccounts: newBankAccounts });
      closeModal();
    }
  };

  // Non-Qualified Investment handlers
  const handleSaveNonQualifiedInvestment = (data: NonQualifiedInvestmentData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newInvestments = [...formData.nonQualifiedInvestments];
      newInvestments[modalState.editIndex] = data;
      updateFormData({ nonQualifiedInvestments: newInvestments });
    } else {
      updateFormData({ nonQualifiedInvestments: [...formData.nonQualifiedInvestments, data] });
    }
  };

  const handleDeleteNonQualifiedInvestment = () => {
    if (modalState.editIndex !== null) {
      const newInvestments = formData.nonQualifiedInvestments.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ nonQualifiedInvestments: newInvestments });
      closeModal();
    }
  };

  // Retirement Account handlers
  const handleSaveRetirementAccount = (data: RetirementAccountData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newAccounts = [...formData.retirementAccounts];
      newAccounts[modalState.editIndex] = data;
      updateFormData({ retirementAccounts: newAccounts });
    } else {
      updateFormData({ retirementAccounts: [...formData.retirementAccounts, data] });
    }
  };

  const handleDeleteRetirementAccount = () => {
    if (modalState.editIndex !== null) {
      const newAccounts = formData.retirementAccounts.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ retirementAccounts: newAccounts });
      closeModal();
    }
  };

  // Life Insurance handlers
  const handleSaveLifeInsurance = (data: LifeInsuranceData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newLifeInsurance = [...formData.lifeInsurance];
      newLifeInsurance[modalState.editIndex] = data;
      updateFormData({ lifeInsurance: newLifeInsurance });
    } else {
      updateFormData({ lifeInsurance: [...formData.lifeInsurance, data] });
    }
  };

  const handleDeleteLifeInsurance = () => {
    if (modalState.editIndex !== null) {
      const newLifeInsurance = formData.lifeInsurance.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ lifeInsurance: newLifeInsurance });
      closeModal();
    }
  };

  // Vehicle handlers
  const handleSaveVehicle = (data: VehicleData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newVehicles = [...formData.vehicles];
      newVehicles[modalState.editIndex] = data;
      updateFormData({ vehicles: newVehicles });
    } else {
      updateFormData({ vehicles: [...formData.vehicles, data] });
    }
  };

  const handleDeleteVehicle = () => {
    if (modalState.editIndex !== null) {
      const newVehicles = formData.vehicles.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ vehicles: newVehicles });
      closeModal();
    }
  };

  // Other Asset handlers
  const handleSaveOtherAsset = (data: OtherAssetData) => {
    if (modalState.isEdit && modalState.editIndex !== null) {
      const newAssets = [...formData.otherAssets];
      newAssets[modalState.editIndex] = data;
      updateFormData({ otherAssets: newAssets });
    } else {
      updateFormData({ otherAssets: [...formData.otherAssets, data] });
    }
  };

  const handleDeleteOtherAsset = () => {
    if (modalState.editIndex !== null) {
      const newAssets = formData.otherAssets.filter((_, i) => i !== modalState.editIndex);
      updateFormData({ otherAssets: newAssets });
      closeModal();
    }
  };

  // Get initial data for edit modals
  const getEditData = () => {
    if (!modalState.isEdit || modalState.editIndex === null) return undefined;

    switch (modalState.type) {
      case 'realEstate':
        return formData.realEstate[modalState.editIndex];
      case 'bankAccount':
        return formData.bankAccounts[modalState.editIndex];
      case 'nonQualifiedInvestment':
        return formData.nonQualifiedInvestments[modalState.editIndex];
      case 'retirementAccount':
        return formData.retirementAccounts[modalState.editIndex];
      case 'lifeInsurance':
        return formData.lifeInsurance[modalState.editIndex];
      case 'vehicle':
        return formData.vehicles[modalState.editIndex];
      case 'otherAsset':
        return formData.otherAssets[modalState.editIndex];
      default:
        return undefined;
    }
  };

  return (
    <Box>
      <AssetsSummaryTable
        realEstate={formData.realEstate}
        bankAccounts={formData.bankAccounts}
        nonQualifiedInvestments={formData.nonQualifiedInvestments}
        retirementAccounts={formData.retirementAccounts}
        lifeInsurance={formData.lifeInsurance}
        vehicles={formData.vehicles}
        otherAssets={formData.otherAssets}
        onEditRealEstate={(index) => openEditModal('realEstate', index)}
        onEditBankAccount={(index) => openEditModal('bankAccount', index)}
        onEditNonQualifiedInvestment={(index) => openEditModal('nonQualifiedInvestment', index)}
        onEditRetirementAccount={(index) => openEditModal('retirementAccount', index)}
        onEditLifeInsurance={(index) => openEditModal('lifeInsurance', index)}
        onEditVehicle={(index) => openEditModal('vehicle', index)}
        onEditOtherAsset={(index) => openEditModal('otherAsset', index)}
        onAddRealEstate={() => openAddModal('realEstate')}
        onAddBankAccount={() => openAddModal('bankAccount')}
        onAddNonQualifiedInvestment={() => openAddModal('nonQualifiedInvestment')}
        onAddRetirementAccount={() => openAddModal('retirementAccount')}
        onAddLifeInsurance={() => openAddModal('lifeInsurance')}
        onAddVehicle={() => openAddModal('vehicle')}
        onAddOtherAsset={() => openAddModal('otherAsset')}
      />

      {/* Real Estate Modal */}
      <RealEstateModal
        open={modalState.type === 'realEstate'}
        onClose={closeModal}
        onSave={handleSaveRealEstate}
        onDelete={modalState.isEdit ? handleDeleteRealEstate : undefined}
        initialData={getEditData() as RealEstateData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

      {/* Bank Account Modal */}
      <BankAccountModal
        open={modalState.type === 'bankAccount'}
        onClose={closeModal}
        onSave={handleSaveBankAccount}
        onDelete={modalState.isEdit ? handleDeleteBankAccount : undefined}
        initialData={getEditData() as BankAccountData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

      {/* Non-Qualified Investment Modal */}
      <NonQualifiedInvestmentModal
        open={modalState.type === 'nonQualifiedInvestment'}
        onClose={closeModal}
        onSave={handleSaveNonQualifiedInvestment}
        onDelete={modalState.isEdit ? handleDeleteNonQualifiedInvestment : undefined}
        initialData={getEditData() as NonQualifiedInvestmentData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

      {/* Retirement Account Modal */}
      <RetirementAccountModal
        open={modalState.type === 'retirementAccount'}
        onClose={closeModal}
        onSave={handleSaveRetirementAccount}
        onDelete={modalState.isEdit ? handleDeleteRetirementAccount : undefined}
        initialData={getEditData() as RetirementAccountData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

      {/* Life Insurance Modal */}
      <LifeInsuranceModal
        open={modalState.type === 'lifeInsurance'}
        onClose={closeModal}
        onSave={handleSaveLifeInsurance}
        onDelete={modalState.isEdit ? handleDeleteLifeInsurance : undefined}
        initialData={getEditData() as LifeInsuranceData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

      {/* Vehicle Modal */}
      <VehicleModal
        open={modalState.type === 'vehicle'}
        onClose={closeModal}
        onSave={handleSaveVehicle}
        onDelete={modalState.isEdit ? handleDeleteVehicle : undefined}
        initialData={getEditData() as VehicleData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />

      {/* Other Asset Modal */}
      <OtherAssetModal
        open={modalState.type === 'otherAsset'}
        onClose={closeModal}
        onSave={handleSaveOtherAsset}
        onDelete={modalState.isEdit ? handleDeleteOtherAsset : undefined}
        initialData={getEditData() as OtherAssetData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={modalState.isEdit}
        showSpouse={showSpouseInfo}
      />
    </Box>
  );
};

export default AssetsSection;
