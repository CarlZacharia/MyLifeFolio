'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

const STORAGE_KEY = 'estate-planning-form-data';
const STEP_STORAGE_KEY = 'estate-planning-current-step';

export type MaritalStatus = 'Single' | 'Married' | 'Second Marriage' | 'Divorced' | 'Separated' | 'Domestic Partnership' | '';
export type Sex = 'Male' | 'Female' | 'Other' | '';
export type RealEstateOwner = 'Client' | 'Spouse' | 'Client and Spouse' | 'Client and Other' | 'Spouse and Other' | 'Client, Spouse and Other' | '';
export type OwnershipForm = 'Sole' | 'Tenants by Entirety' | 'JTWROS' | 'Tenants in Common' | 'Life Estate' | 'Lady Bird Deed' | 'Living Trust' | 'Irrevocable Trust' | 'Other' | '';

export interface FormData {
  // Personal Data
  date: string;
  appointmentDate: string;
  name: string;
  sex: Sex;
  maritalStatus: MaritalStatus;
  numberOfChildren: number; // For single clients
  clientHasChildrenFromPrior: boolean;
  clientChildrenFromPrior: number;
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
  childrenTogether: number;
  spouseHasChildrenFromPrior: boolean;
  spouseChildrenFromPrior: number;

  // Existing Trusts
  clientHasLivingTrust: boolean;
  clientLivingTrustName: string;
  clientLivingTrustDate: Date | null;
  clientHasIrrevocableTrust: boolean;
  clientIrrevocableTrustName: string;
  clientIrrevocableTrustDate: Date | null;
  spouseHasLivingTrust: boolean;
  spouseHasIrrevocableTrust: boolean;
  spouseLivingTrustName: string;
  spouseLivingTrustDate: Date | null;
  spouseIrrevocableTrustName: string;
  spouseIrrevocableTrustDate: Date | null;

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
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | '';
    hasChildren: boolean;
    numberOfChildren: number;
    hasMinorChildren: boolean;
    distributionType: 'Per Stirpes' | 'Per Capita' | '';
    disinherit: boolean;
    comments: string;
  }>;
  allChildrenHealthy: boolean;
  childrenHealthExplanation: string;
  anyChildrenMinors: boolean;
  anyChildrenDisabled: boolean;
  allChildrenEducated: boolean;
  anyChildrenMaritalProblems: boolean;
  anyChildrenReceivingSSI: boolean;
  drugAddiction: boolean;
  alcoholism: boolean;
  spendthrift: boolean;
  childrenOtherConcerns: string;
  childrenNotes: string;

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
  hasSpecificDevises: boolean;
  specificDevisesDescription: string;
  hasGeneralBequests: boolean;
  generalBequestsDescription: string;
  dispositiveIntentionsComments: string;

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
    distributionType: 'Per Stirpes' | 'Per Capita' | '';
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
  healthCareSecondAlternateName: string;
  healthCareSecondAlternateNameOther: string;
  withdrawArtificialFoodFluid: boolean;

  spouseHealthCareAgentName: string;
  spouseHealthCareAgentNameOther: string;
  spouseHealthCareAlternateName: string;
  spouseHealthCareAlternateNameOther: string;
  spouseHealthCareSecondAlternateName: string;
  spouseHealthCareSecondAlternateNameOther: string;
  spouseWithdrawArtificialFoodFluid: boolean;

  // Financial Power of Attorney
  financialAgentName: string;
  financialAgentNameOther: string;
  financialAlternateName: string;
  financialAlternateNameOther: string;
  financialSecondAlternateName: string;
  financialSecondAlternateNameOther: string;

  spouseFinancialAgentName: string;
  spouseFinancialAgentNameOther: string;
  spouseFinancialAlternateName: string;
  spouseFinancialAlternateNameOther: string;
  spouseFinancialSecondAlternateName: string;
  spouseFinancialSecondAlternateNameOther: string;

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
    street: string;
    city: string;
    state: string;
    zip: string;
    value: string;
    mortgageBalance: string;
    costBasis: string;
    primaryBeneficiaries: string[]; // Used for Remainder Interest when Life Estate or Lady Bird Deed
    remainderInterestOther: string; // Name of non-beneficiary remainder interest holder
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
    policyType: string;
    faceAmount: string;
    deathBenefit: string;
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

  businessInterests: Array<{
    owner: string;
    businessName: string;
    entityType: string;
    ownershipPercentage: string;
    value: string;
    coOwners: string;
    hasBuySellAgreement: boolean;
    notes: string;
  }>;

  digitalAssets: Array<{
    owner: string;
    assetType: string;
    platform: string;
    description: string;
    value: string;
    notes: string;
  }>;

  additionalComments: string;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  clearFormData: () => void;
}

// Fields that contain Date objects and need special serialization
const DATE_FIELDS = [
  'birthDate',
  'spouseBirthDate',
  'clientLivingTrustDate',
  'clientIrrevocableTrustDate',
  'spouseLivingTrustDate',
  'spouseIrrevocableTrustDate',
  'dateMarried',
];

// Serialize form data for localStorage (convert Dates to ISO strings)
const serializeFormData = (data: FormData): string => {
  const serialized = { ...data } as Record<string, unknown>;
  DATE_FIELDS.forEach((field) => {
    const value = serialized[field];
    if (value instanceof Date) {
      serialized[field] = value.toISOString();
    }
  });
  return JSON.stringify(serialized);
};

// Deserialize form data from localStorage (convert ISO strings back to Dates)
const deserializeFormData = (json: string): FormData => {
  const parsed = JSON.parse(json) as Record<string, unknown>;
  DATE_FIELDS.forEach((field) => {
    const value = parsed[field];
    if (typeof value === 'string' && value) {
      parsed[field] = new Date(value);
    }
  });
  return parsed as unknown as FormData;
};

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
  numberOfChildren: 0,
  clientHasChildrenFromPrior: false,
  clientChildrenFromPrior: 0,
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
  childrenTogether: 0,
  spouseHasChildrenFromPrior: false,
  spouseChildrenFromPrior: 0,
  clientHasLivingTrust: false,
  clientLivingTrustName: '',
  clientLivingTrustDate: null,
  clientHasIrrevocableTrust: false,
  clientIrrevocableTrustName: '',
  clientIrrevocableTrustDate: null,
  spouseHasLivingTrust: false,
  spouseLivingTrustName: '',
  spouseLivingTrustDate: null,
  spouseHasIrrevocableTrust: false,
  spouseIrrevocableTrustName: '',
  spouseIrrevocableTrustDate: null,
  dateMarried: null,
  placeOfMarriage: '',
  priorMarriage: false,
  childrenFromPriorMarriage: false,
  children: [],
  allChildrenHealthy: true,
  childrenHealthExplanation: '',
  anyChildrenMinors: false,
  anyChildrenDisabled: false,
  allChildrenEducated: true,
  anyChildrenMaritalProblems: false,
  anyChildrenReceivingSSI: false,
  drugAddiction: false,
  alcoholism: false,
  spendthrift: false,
  childrenOtherConcerns: '',
  childrenNotes: '',
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
  hasSpecificDevises: false,
  specificDevisesDescription: '',
  hasGeneralBequests: false,
  generalBequestsDescription: '',
  dispositiveIntentionsComments: '',
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
  healthCareSecondAlternateName: '',
  healthCareSecondAlternateNameOther: '',
  withdrawArtificialFoodFluid: false,
  spouseHealthCareAgentName: '',
  spouseHealthCareAgentNameOther: '',
  spouseHealthCareAlternateName: '',
  spouseHealthCareAlternateNameOther: '',
  spouseHealthCareSecondAlternateName: '',
  spouseHealthCareSecondAlternateNameOther: '',
  spouseWithdrawArtificialFoodFluid: false,
  financialAgentName: '',
  financialAgentNameOther: '',
  financialAlternateName: '',
  financialAlternateNameOther: '',
  financialSecondAlternateName: '',
  financialSecondAlternateNameOther: '',
  spouseFinancialAgentName: '',
  spouseFinancialAgentNameOther: '',
  spouseFinancialAlternateName: '',
  spouseFinancialAlternateNameOther: '',
  spouseFinancialSecondAlternateName: '',
  spouseFinancialSecondAlternateNameOther: '',
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
  businessInterests: [],
  digitalAssets: [],
  additionalComments: '',
};

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const isFirstRender = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);

      if (savedData) {
        const parsed = deserializeFormData(savedData);
        // Merge with initialFormData to handle any new fields added to the schema
        setFormData({ ...initialFormData, ...parsed });
      }

      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step)) {
          setCurrentStep(step);
        }
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Auto-save to localStorage whenever formData changes (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEY, serializeFormData(formData));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, [formData, isInitialized]);

  // Save currentStep to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString());
    } catch (error) {
      console.error('Error saving step to localStorage:', error);
    }
  }, [currentStep, isInitialized]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const clearFormData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    setFormData(initialFormData);
    setCurrentStep(0);
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
        clearFormData,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
