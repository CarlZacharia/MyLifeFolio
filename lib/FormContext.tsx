'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type MaritalStatus = 'Single' | 'Married' | 'Second Marriage' | 'Divorced' | 'Separated' | 'Domestic Partnership' | '';
export type Sex = 'Male' | 'Female' | '';
export type RealEstateOwner = 'Client' | 'Spouse' | 'Client and Spouse' | 'Client and Other' | 'Spouse and Other' | 'Client, Spouse and Other' | '';
export type OwnershipForm = 'Sole' | 'Tenants by Entirety' | 'JTWROS' | 'Tenants in Common' | 'Life Estate' | 'Lady Bird Deed' | 'Trust' | 'Other' | '';

export interface FormData {
  // Personal Data
  date: string;
  appointmentDate: string;
  name: string;
  sex: Sex;
  maritalStatus: MaritalStatus;
  aka: string;
  mailingAddress: string;
  cellPhone: string;
  homePhone: string;
  workPhone: string;
  email: string;
  birthDate: Date | null;
  spouseName: string;
  spouseAka: string;
  spouseMailingAddress: string;
  spouseCellPhone: string;
  spouseHomePhone: string;
  spouseWorkPhone: string;
  spouseEmail: string;
  spouseBirthDate: Date | null;
  spouseSex: Sex;

  // Marital Information
  dateMarried: Date | null;
  placeOfMarriage: string;
  priorMarriage: boolean;
  childrenFromPriorMarriage: boolean;

  // Children
  children: Array<{
    name: string;
    address: string;
    birthDate: string;
    relationship: string;
  }>;
  allChildrenHealthy: boolean;
  childrenHealthExplanation: string;
  anyChildrenBlind: boolean;
  anyChildrenDisabled: boolean;
  allChildrenEducated: boolean;
  anyChildrenReceivingSSI: boolean;
  drugAddiction: boolean;
  alcoholism: boolean;
  spendthrift: boolean;

  // Grandchildren
  grandchildren: Array<{
    name: string;
    address: string;
    age: string;
  }>;

  // Dispositive Intentions
  provideForSpouseThenChildren: boolean;
  treatAllChildrenEqually: boolean;
  childrenEqualityExplanation: string;
  distributionAge: string;
  childrenPredeceasedBeneficiaries: boolean;
  leaveToGrandchildren: boolean;
  treatAllGrandchildrenEqually: boolean;
  grandchildrenEqualityExplanation: string;
  grandchildrenAmount: string;
  grandchildrenDistributionAge: string;

  // Charities
  leaveToCharity: boolean;
  charities: Array<{
    name: string;
    address: string;
    amount: string;
  }>;

  // Other Beneficiaries
  otherBeneficiaries: Array<{
    name: string;
    address: string;
    relationship: string;
    relationshipOther: string;
    amount: string;
    notes: string;
  }>;

  // Fiduciaries
  executorFirst: string;
  executorAlternate: string;
  executorSecondAlternate: string;
  spouseExecutorFirst: string;
  spouseExecutorAlternate: string;
  spouseExecutorSecondAlternate: string;

  trusteeFirst: string;
  trusteeAlternate: string;
  spouseTrusteeFirst: string;
  spouseTrusteeAlternate: string;

  guardianFirst: string;
  guardianAlternate: string;
  spouseGuardianFirst: string;
  spouseGuardianAlternate: string;

  // Health Care
  healthCareAgentName: string;
  healthCareAgentAddress: string;
  healthCareAgentCityStateZip: string;
  healthCareAlternateName: string;
  healthCareAlternateAddress: string;
  healthCareAlternateCityStateZip: string;
  withdrawArtificialFoodFluid: boolean;

  spouseHealthCareAgentName: string;
  spouseHealthCareAgentAddress: string;
  spouseHealthCareAgentCityStateZip: string;
  spouseHealthCareAlternateName: string;
  spouseHealthCareAlternateAddress: string;
  spouseHealthCareAlternateCityStateZip: string;
  spouseWithdrawArtificialFoodFluid: boolean;

  // Financial Power of Attorney
  financialAgentName: string;
  financialAgentAddress: string;
  financialAgentCityStateZip: string;
  financialAlternateName: string;
  financialAlternateAddress: string;
  financialAlternateCityStateZip: string;

  spouseFinancialAgentName: string;
  spouseFinancialAgentAddress: string;
  spouseFinancialAgentCityStateZip: string;
  spouseFinancialAlternateName: string;
  spouseFinancialAlternateAddress: string;
  spouseFinancialAlternateCityStateZip: string;

  // Miscellaneous
  legalIssues: string;
  spouseLegalIssues: string;
  importantPapersLocation: string;
  hasSafeDepositBox: boolean;
  safeDepositBoxLocation: string;

  // Dependents
  dependents: Array<{
    name: string;
    relationship: string;
  }>;

  // Assets
  realEstate: Array<{
    owner: RealEstateOwner;
    ownershipForm: OwnershipForm;
    street: string;
    city: string;
    state: string;
    zip: string;
    value: string;
    mortgageBalance: string;
    costBasis: string;
  }>;

  bankAccounts: Array<{
    owner: string;
    institution: string;
    amount: string;
  }>;

  stocksBonds: Array<{
    owner: string;
    description: string;
    amount: string;
  }>;

  lifeInsurance: Array<{
    owner: string;
    company: string;
    faceAmount: string;
    cashValue: string;
    insured: string;
    beneficiary: string;
  }>;

  retirementBenefits: Array<{
    owner: string;
    description: string;
    beneficiary: string;
    principalValue: string;
  }>;

  businessInterests: Array<{
    description: string;
  }>;

  additionalComments: string;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
};

const initialFormData: FormData = {
  date: '',
  appointmentDate: '',
  name: '',
  sex: '',
  maritalStatus: '',
  aka: '',
  mailingAddress: '',
  cellPhone: '',
  homePhone: '',
  workPhone: '',
  email: '',
  birthDate: null,
  spouseName: '',
  spouseAka: '',
  spouseMailingAddress: '',
  spouseCellPhone: '',
  spouseHomePhone: '',
  spouseWorkPhone: '',
  spouseEmail: '',
  spouseBirthDate: null,
  spouseSex: '',
  dateMarried: null,
  placeOfMarriage: '',
  priorMarriage: false,
  childrenFromPriorMarriage: false,
  children: [],
  allChildrenHealthy: true,
  childrenHealthExplanation: '',
  anyChildrenBlind: false,
  anyChildrenDisabled: false,
  allChildrenEducated: true,
  anyChildrenReceivingSSI: false,
  drugAddiction: false,
  alcoholism: false,
  spendthrift: false,
  grandchildren: [],
  provideForSpouseThenChildren: true,
  treatAllChildrenEqually: true,
  childrenEqualityExplanation: '',
  distributionAge: '',
  childrenPredeceasedBeneficiaries: true,
  leaveToGrandchildren: false,
  treatAllGrandchildrenEqually: true,
  grandchildrenEqualityExplanation: '',
  grandchildrenAmount: '',
  grandchildrenDistributionAge: '',
  leaveToCharity: false,
  charities: [],
  otherBeneficiaries: [],
  executorFirst: '',
  executorAlternate: '',
  executorSecondAlternate: '',
  spouseExecutorFirst: '',
  spouseExecutorAlternate: '',
  spouseExecutorSecondAlternate: '',
  trusteeFirst: '',
  trusteeAlternate: '',
  spouseTrusteeFirst: '',
  spouseTrusteeAlternate: '',
  guardianFirst: '',
  guardianAlternate: '',
  spouseGuardianFirst: '',
  spouseGuardianAlternate: '',
  healthCareAgentName: '',
  healthCareAgentAddress: '',
  healthCareAgentCityStateZip: '',
  healthCareAlternateName: '',
  healthCareAlternateAddress: '',
  healthCareAlternateCityStateZip: '',
  withdrawArtificialFoodFluid: false,
  spouseHealthCareAgentName: '',
  spouseHealthCareAgentAddress: '',
  spouseHealthCareAgentCityStateZip: '',
  spouseHealthCareAlternateName: '',
  spouseHealthCareAlternateAddress: '',
  spouseHealthCareAlternateCityStateZip: '',
  spouseWithdrawArtificialFoodFluid: false,
  financialAgentName: '',
  financialAgentAddress: '',
  financialAgentCityStateZip: '',
  financialAlternateName: '',
  financialAlternateAddress: '',
  financialAlternateCityStateZip: '',
  spouseFinancialAgentName: '',
  spouseFinancialAgentAddress: '',
  spouseFinancialAgentCityStateZip: '',
  spouseFinancialAlternateName: '',
  spouseFinancialAlternateAddress: '',
  spouseFinancialAlternateCityStateZip: '',
  legalIssues: '',
  spouseLegalIssues: '',
  importantPapersLocation: '',
  hasSafeDepositBox: false,
  safeDepositBoxLocation: '',
  dependents: [],
  realEstate: [],
  bankAccounts: [],
  stocksBonds: [],
  lifeInsurance: [],
  retirementBenefits: [],
  businessInterests: [],
  additionalComments: '',
};

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
