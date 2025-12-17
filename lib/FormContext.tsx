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
    disinherit: boolean;
    comments: string;
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
  executorFirstOther: string;
  executorAlternate: string;
  executorAlternateOther: string;
  executorSecondAlternate: string;
  executorSecondAlternateOther: string;
  spouseExecutorFirst: string;
  spouseExecutorFirstOther: string;
  spouseExecutorAlternate: string;
  spouseExecutorAlternateOther: string;
  spouseExecutorSecondAlternate: string;
  spouseExecutorSecondAlternateOther: string;

  trusteeFirst: string;
  trusteeFirstOther: string;
  trusteeAlternate: string;
  trusteeAlternateOther: string;
  spouseTrusteeFirst: string;
  spouseTrusteeFirstOther: string;
  spouseTrusteeAlternate: string;
  spouseTrusteeAlternateOther: string;

  guardianFirst: string;
  guardianFirstOther: string;
  guardianAlternate: string;
  guardianAlternateOther: string;
  spouseGuardianFirst: string;
  spouseGuardianFirstOther: string;
  spouseGuardianAlternate: string;
  spouseGuardianAlternateOther: string;

  // Health Care
  healthCareAgentName: string;
  healthCareAgentNameOther: string;
  healthCareAlternateName: string;
  healthCareAlternateNameOther: string;
  withdrawArtificialFoodFluid: boolean;

  spouseHealthCareAgentName: string;
  spouseHealthCareAgentNameOther: string;
  spouseHealthCareAlternateName: string;
  spouseHealthCareAlternateNameOther: string;
  spouseWithdrawArtificialFoodFluid: boolean;

  // Financial Power of Attorney
  financialAgentName: string;
  financialAgentNameOther: string;
  financialAlternateName: string;
  financialAlternateNameOther: string;

  spouseFinancialAgentName: string;
  spouseFinancialAgentNameOther: string;
  spouseFinancialAlternateName: string;
  spouseFinancialAlternateNameOther: string;

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
    showBeneficiaries: boolean;
    showOther: boolean;
    jointOwnerBeneficiaries: string[];
    jointOwnerOther: string;
    hasBeneficiaries: boolean;
    street: string;
    city: string;
    state: string;
    zip: string;
    value: string;
    mortgageBalance: string;
    costBasis: string;
    primaryBeneficiaries: string[];
    secondaryBeneficiaries: string[];
    notes: string;
  }>;

  bankAccounts: Array<{
    owner: string;
    institution: string;
    amount: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    secondaryBeneficiaries: string[];
    notes: string;
  }>;

  nonQualifiedInvestments: Array<{
    owner: string;
    institution: string;
    description: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    secondaryBeneficiaries: string[];
    notes: string;
  }>;

  retirementAccounts: Array<{
    owner: string;
    institution: string;
    accountType: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    secondaryBeneficiaries: string[];
    notes: string;
  }>;

  lifeInsurance: Array<{
    owner: string;
    company: string;
    faceAmount: string;
    cashValue: string;
    insured: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    secondaryBeneficiaries: string[];
    notes: string;
  }>;

  vehicles: Array<{
    owner: string;
    yearMakeModel: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    secondaryBeneficiaries: string[];
    notes: string;
  }>;

  otherAssets: Array<{
    owner: string;
    description: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    secondaryBeneficiaries: string[];
    notes: string;
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
  executorFirstOther: '',
  executorAlternate: '',
  executorAlternateOther: '',
  executorSecondAlternate: '',
  executorSecondAlternateOther: '',
  spouseExecutorFirst: '',
  spouseExecutorFirstOther: '',
  spouseExecutorAlternate: '',
  spouseExecutorAlternateOther: '',
  spouseExecutorSecondAlternate: '',
  spouseExecutorSecondAlternateOther: '',
  trusteeFirst: '',
  trusteeFirstOther: '',
  trusteeAlternate: '',
  trusteeAlternateOther: '',
  spouseTrusteeFirst: '',
  spouseTrusteeFirstOther: '',
  spouseTrusteeAlternate: '',
  spouseTrusteeAlternateOther: '',
  guardianFirst: '',
  guardianFirstOther: '',
  guardianAlternate: '',
  guardianAlternateOther: '',
  spouseGuardianFirst: '',
  spouseGuardianFirstOther: '',
  spouseGuardianAlternate: '',
  spouseGuardianAlternateOther: '',
  healthCareAgentName: '',
  healthCareAgentNameOther: '',
  healthCareAlternateName: '',
  healthCareAlternateNameOther: '',
  withdrawArtificialFoodFluid: false,
  spouseHealthCareAgentName: '',
  spouseHealthCareAgentNameOther: '',
  spouseHealthCareAlternateName: '',
  spouseHealthCareAlternateNameOther: '',
  spouseWithdrawArtificialFoodFluid: false,
  financialAgentName: '',
  financialAgentNameOther: '',
  financialAlternateName: '',
  financialAlternateNameOther: '',
  spouseFinancialAgentName: '',
  spouseFinancialAgentNameOther: '',
  spouseFinancialAlternateName: '',
  spouseFinancialAlternateNameOther: '',
  legalIssues: '',
  spouseLegalIssues: '',
  importantPapersLocation: '',
  hasSafeDepositBox: false,
  safeDepositBoxLocation: '',
  dependents: [],
  realEstate: [],
  bankAccounts: [],
  nonQualifiedInvestments: [],
  retirementAccounts: [],
  lifeInsurance: [],
  vehicles: [],
  otherAssets: [],
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
