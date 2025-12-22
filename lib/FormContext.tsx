'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

const STORAGE_KEY = 'estate-planning-form-data';
const STEP_STORAGE_KEY = 'estate-planning-current-step';
const SCHEMA_VERSION_KEY = 'estate-planning-schema-version';
const CURRENT_SCHEMA_VERSION = 2; // Increment when schema changes require migration

export type MaritalStatus = 'Single' | 'Married' | 'Second Marriage' | 'Divorced' | 'Separated' | 'Domestic Partnership' | '';
export type Sex = 'Male' | 'Female' | 'Other' | '';
export type RealEstateOwner = 'Client' | 'Spouse' | 'Client and Spouse' | 'Client and Other' | 'Spouse and Other' | 'Client, Spouse and Other' | '';
export type OwnershipForm = 'Sole' | 'Tenants by Entirety' | 'JTWROS' | 'Tenants in Common' | 'Life Estate' | 'Lady Bird Deed' | 'Living Trust' | 'Irrevocable Trust' | 'Other' | '';
export type PropertyCategory = 'Primary residence' | 'Vacation home' | 'Rental property' | 'Vacant land' | 'Commercial property' | 'Timeshare' | '';

// Long-Term Care Types
export type ConcernLevel = '' | 'Not at all' | 'Slightly' | 'Moderately' | 'Very' | 'Extremely';
export type HealthRating = '' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type DementiaStage = '' | 'Mild' | 'Moderate' | 'Severe';
export type LivingSituation = '' | 'Own home' | 'Rented home/apartment' | 'Independent living in a senior community' | 'Assisted living' | 'Memory care' | 'Skilled nursing facility' | 'Living with family' | 'Other';
export type CareLevel = '' | 'Independent living' | 'Assisted living' | 'Memory care' | 'Skilled nursing' | 'Rehabilitation' | 'At-home care with agency' | 'At-home care with private aides';
export type HoursPerWeek = '' | '0' | '1-10' | '11-20' | '21-40' | '40+';
export type Likelihood = '' | 'Very unlikely' | 'Unlikely' | 'Unsure' | 'Likely' | 'Very likely';
export type CarePreference = '' | 'Age in place at home as long as possible' | 'Live with family' | 'Assisted living' | 'Memory care' | 'Skilled nursing' | 'Continuing care retirement community' | 'No preference' | 'Other';

// Current Estate Plan Types
export type DocumentReviewOption = '' | 'Upload' | 'Answer Questions';

export interface SpecificGift {
  recipientName: string;
  relationship: string;
  description: string;
  notes: string;
}

// Will/Trust Distribution Plan Types
export interface AssetGift {
  assetId: string;           // Reference to the asset (e.g., "realEstate-0", "vehicle-1")
  assetDescription: string;  // Human-readable description
  assetValue: number;        // Value for display
  recipientIds: string[];    // Array of beneficiary IDs (e.g., "child-0", "beneficiary-1")
}

export interface CashGift {
  recipientName: string;
  relationship: string;
  amount: string;
  notes: string;
}

export interface ResiduaryBeneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;        // Percentage share (0-100)
}

export type DistributionType = 'sweetheart' | 'spouseFirstDiffering' | 'custom';

export interface DistributionPlan {
  distributionType: DistributionType;
  isSweetheartPlan: boolean; // Kept for backwards compatibility
  hasSpecificGifts: boolean;
  specificAssetGifts: AssetGift[];
  cashGifts: CashGift[];
  residuaryBeneficiaries: ResiduaryBeneficiary[];
  residuaryShareType: 'equal' | 'percentage';
  notes: string;
}

// Specific Gift - for giving specific items to specific people
export interface SpecificGiftItem {
  recipientName: string;
  relationship: string;
  description: string;
  notes: string;
}

// Cash Gift to Beneficiary - for giving cash amounts to beneficiaries
export interface CashGiftToBeneficiary {
  beneficiaryId: string;  // e.g., "child-0", "beneficiary-1", "charity-0"
  beneficiaryName: string;
  relationship: string;
  amount: string;
}

export interface CurrentEstatePlanData {
  // Document existence
  hasWill: boolean;
  hasTrust: boolean;
  isJointTrust: boolean; // For married couples - is the trust joint with spouse?
  hasFinancialPOA: boolean;
  hasHealthCarePOA: boolean;
  hasLivingWill: boolean;
  hasNone: boolean;

  // Per-document details: date signed and home state at signing
  willDateSigned: string;
  willStateSigned: string;
  trustDateSigned: string;
  trustStateSigned: string;
  financialPOADateSigned: string;
  financialPOAStateSigned: string;
  healthCarePOADateSigned: string;
  healthCarePOAStateSigned: string;
  livingWillDateSigned: string;
  livingWillStateSigned: string;

  // Legacy document details - kept for backwards compatibility
  documentState: string;
  documentDate: string;
  reviewOption: DocumentReviewOption;

  // File uploads per document type (store file names/references)
  uploadedFiles: string[]; // Legacy - kept for backwards compatibility
  willUploadedFiles: string[];
  trustUploadedFiles: string[];
  financialPOAUploadedFiles: string[];
  healthCarePOAUploadedFiles: string[];
  livingWillUploadedFiles: string[];

  // Legacy fiduciary fields - kept for backwards compatibility but no longer shown in UI
  willPersonalRep: string;
  willPersonalRepAlternate1: string;
  willPersonalRepAlternate2: string;
  willPrimaryBeneficiary: string;
  willSecondaryBeneficiaries: string;
  willSpecificRealEstateGifts: SpecificGift[];
  willSpecificAssetGifts: SpecificGift[];
  willGeneralMoneyGifts: SpecificGift[];
  trustTrustee: string;
  trustTrusteeAlternate1: string;
  trustTrusteeAlternate2: string;
  trustPrimaryBeneficiary: string;
  trustSecondaryBeneficiaries: string;
  trustSpecificRealEstateGifts: SpecificGift[];
  trustSpecificAssetGifts: SpecificGift[];
  trustGeneralMoneyGifts: SpecificGift[];
  financialPOAAgent1: string;
  financialPOAAgent2: string;
  financialPOAAgent3: string;
  healthCarePOAAgent1: string;
  healthCarePOAAgent2: string;
  healthCarePOAAgent3: string;
  isHIPAACompliant: boolean;
  hasDNROrder: boolean;
  hasLivingWillDocument: boolean;

  // Comments
  comments: string;
}

export interface LongTermCareData {
  // General framing questions
  primaryGoalsConcerns: string;
  ltcConcernLevel: ConcernLevel;
  previouslyMetWithAdvisor: boolean;
  advisorMeetingDetails: string;

  // Current health and diagnoses
  overallHealth: HealthRating;
  diagnoses: string[]; // Array of selected diagnoses
  diagnosesOther: string;
  recentHospitalizations: boolean;
  hospitalizationDetails: string;
  mobilityLimitations: string[]; // Array of selected limitations
  adlHelp: string[]; // Activities of Daily Living needing help
  adlAssistance: string; // Who assists
  iadlHelp: string[]; // Instrumental ADLs needing help
  hasDementia: boolean;
  dementiaStage: DementiaStage;
  familyHistoryOfConditions: boolean;
  familyHistoryDetails: string;

  // Current living situation and services
  currentLivingSituation: LivingSituation;
  livingOther: string;
  inLtcFacility: boolean;
  currentCareLevel: CareLevel;
  facilityName: string;
  facilityAddress: string;
  facilityStartDate: string;
  receivesHomeHelp: boolean;
  homeHelpProviders: string[]; // Array of selected providers
  hoursOfHelpPerWeek: HoursPerWeek;
  expectCareIncrease: '' | 'Yes' | 'No' | 'Unsure';
  careIncreaseExplanation: string;

  // Five-year care foreseeability and preferences
  likelihoodOfLtcIn5Years: Likelihood;
  carePreference: CarePreference;
  carePreferenceOther: string;
  hasSpecificProvider: boolean;
  preferredProviderDetails: string;
  homeSupportsNeeded: string[]; // Array of selected supports
  geographicPreferences: string;

  // Caregivers
  primaryCaregivers: string[]; // Array of selected caregivers
  caregiversLimitedAbility: boolean;
  caregiversLimitedDetails: string;
  familyConflicts: string;

  // Insurance and public benefits
  medicareTypes: string[]; // Array: Part A, Part B, Part C, Part D
  hasMedigap: boolean;
  medigapDetails: string;
  hasLtcInsurance: boolean;
  ltcInsuranceDetails: string;
  currentBenefits: string[]; // Array of current benefits
  previousMedicaidApplication: boolean;
  medicaidApplicationDetails: string;

  // Finances relevant to LTC / Medicaid
  monthlyIncome: string;
  madeGiftsOver5Years: boolean;
  giftsDetails: string;
  expectingWindfall: boolean;
  windfallDetails: string;

  // Quality-of-life and care preferences
  careSettingImportance: {
    stayWithSpouse: '' | 'Not important' | 'Somewhat important' | 'Very important';
    nearFamily: '' | 'Not important' | 'Somewhat important' | 'Very important';
    religiousCultural: '' | 'Not important' | 'Somewhat important' | 'Very important';
    petFriendly: '' | 'Not important' | 'Somewhat important' | 'Very important';
    privateRoom: '' | 'Not important' | 'Somewhat important' | 'Very important';
    socialActivities: '' | 'Not important' | 'Somewhat important' | 'Very important';
    onSiteMedicalStaff: '' | 'Not important' | 'Somewhat important' | 'Very important';
  };
  endOfLifePreferences: string;
  importantTherapiesActivities: string;
}

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
  stateOfDomicile: string;
  lookingToChangeDomicile: boolean;
  newDomicileState: string;
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

  // Military Service - Client
  clientServedMilitary: boolean;
  clientMilitaryBranch: string;
  clientMilitaryStartDate: string;
  clientMilitaryEndDate: string;

  // Military Service - Spouse
  spouseServedMilitary: boolean;
  spouseMilitaryBranch: string;
  spouseMilitaryStartDate: string;
  spouseMilitaryEndDate: string;

  // Funeral Preferences - Client
  clientHasPrepaidFuneral: boolean;
  clientPrepaidFuneralDetails: string;
  clientPreferredFuneralHome: string;
  clientBurialOrCremation: '' | 'Burial' | 'Cremation' | 'Undecided';
  clientPreferredChurch: string;

  // Funeral Preferences - Spouse
  spouseHasPrepaidFuneral: boolean;
  spousePrepaidFuneralDetails: string;
  spousePreferredFuneralHome: string;
  spouseBurialOrCremation: '' | 'Burial' | 'Cremation' | 'Undecided';
  spousePreferredChurch: string;

  // Existing Trusts
  clientHasLivingTrust: boolean;
  clientLivingTrustName: string;
  clientLivingTrustDate: Date | null;
  clientHasIrrevocableTrust: boolean;
  clientIrrevocableTrustName: string;
  clientIrrevocableTrustDate: Date | null;
  clientConsideringTrust: boolean;
  spouseHasLivingTrust: boolean;
  spouseHasIrrevocableTrust: boolean;
  spouseLivingTrustName: string;
  spouseLivingTrustDate: Date | null;
  spouseIrrevocableTrustName: string;
  spouseIrrevocableTrustDate: Date | null;
  spouseConsideringTrust: boolean;

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
    age: string;
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
  specificGifts: SpecificGiftItem[];
  hasGeneralBequests: boolean;
  generalBequestsDescription: string;
  cashGiftsToBeneficiaries: CashGiftToBeneficiary[];
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
    age: string;
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
  trusteeSecondAlternate: string;
  trusteeSecondAlternateOther: string;
  spouseTrusteeFirst: string;
  spouseTrusteeFirstOther: string;
  spouseTrusteeAlternate: string;
  spouseTrusteeAlternateOther: string;
  spouseTrusteeSecondAlternate: string;
  spouseTrusteeSecondAlternateOther: string;

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
  safeDepositBoxBank: string;
  safeDepositBoxNumber: string;
  safeDepositBoxLocation: string;
  safeDepositBoxAccess: string;
  safeDepositBoxContents: string;

  // Dependents
  dependents: Array<{
    name: string;
    relationship: string;
  }>;

  // Assets
  realEstate: Array<{
    owner: RealEstateOwner;
    ownershipForm: OwnershipForm;
    category: PropertyCategory;
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
    clientOwnershipPercentage: string; // For Tenants in Common
    spouseOwnershipPercentage: string; // For Tenants in Common
    clientSpouseJointType: string; // For TIC with "Client, Spouse and Other" - how client/spouse own their share (TBE or JTWROS)
    clientSpouseCombinedPercentage: string; // For TIC with "Client, Spouse and Other" when owned as TBE/JTWROS - their combined share percentage
    notes: string;
  }>;

  bankAccounts: Array<{
    owner: string;
    accountType: string;
    institution: string;
    amount: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    primaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    secondaryBeneficiaries: string[];
    secondaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    notes: string;
  }>;

  nonQualifiedInvestments: Array<{
    owner: string;
    institution: string;
    description: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    primaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    secondaryBeneficiaries: string[];
    secondaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    notes: string;
  }>;

  retirementAccounts: Array<{
    owner: string;
    institution: string;
    accountType: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    primaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    secondaryBeneficiaries: string[];
    secondaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
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
    primaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    secondaryBeneficiaries: string[];
    secondaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    notes: string;
  }>;

  vehicles: Array<{
    owner: string;
    yearMakeModel: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    primaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    secondaryBeneficiaries: string[];
    secondaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    notes: string;
  }>;

  otherAssets: Array<{
    owner: string;
    description: string;
    value: string;
    hasBeneficiaries: boolean;
    primaryBeneficiaries: string[];
    primaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    secondaryBeneficiaries: string[];
    secondaryDistributionType: 'Per Stirpes' | 'Per Capita' | '';
    addToPersonalPropertyMemo: boolean;
    notes: string;
  }>;

  businessInterests: Array<{
    owner: string;
    businessName: string;
    entityType: string;
    ownershipPercentage: string;
    fullValue: string; // Full estimated value of the business
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

  // Will/Trust Distribution Plans
  clientDistributionPlan: DistributionPlan;
  spouseDistributionPlan: DistributionPlan;
  mirrorDistributionPlans: boolean;

  // Client Notes - questions/comments for the attorney meeting
  clientNotes: string;

  // Long-Term Care - Client
  clientLongTermCare: LongTermCareData;
  // Long-Term Care - Spouse
  spouseLongTermCare: LongTermCareData;

  // Current Estate Plan - Client
  clientCurrentEstatePlan: CurrentEstatePlanData;
  // Current Estate Plan - Spouse
  spouseCurrentEstatePlan: CurrentEstatePlanData;

  // Metadata
  createdAt: string; // ISO date string of when the questionnaire was started
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
    if (value instanceof Date && !isNaN(value.getTime())) {
      serialized[field] = value.toISOString();
    } else if (value instanceof Date) {
      // Invalid date - set to null
      serialized[field] = null;
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
  stateOfDomicile: '',
  lookingToChangeDomicile: false,
  newDomicileState: '',
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
  clientServedMilitary: false,
  clientMilitaryBranch: '',
  clientMilitaryStartDate: '',
  clientMilitaryEndDate: '',
  spouseServedMilitary: false,
  spouseMilitaryBranch: '',
  spouseMilitaryStartDate: '',
  spouseMilitaryEndDate: '',
  clientHasPrepaidFuneral: false,
  clientPrepaidFuneralDetails: '',
  clientPreferredFuneralHome: '',
  clientBurialOrCremation: '',
  clientPreferredChurch: '',
  spouseHasPrepaidFuneral: false,
  spousePrepaidFuneralDetails: '',
  spousePreferredFuneralHome: '',
  spouseBurialOrCremation: '',
  spousePreferredChurch: '',
  clientHasLivingTrust: false,
  clientLivingTrustName: '',
  clientLivingTrustDate: null,
  clientHasIrrevocableTrust: false,
  clientIrrevocableTrustName: '',
  clientIrrevocableTrustDate: null,
  clientConsideringTrust: false,
  spouseHasLivingTrust: false,
  spouseLivingTrustName: '',
  spouseLivingTrustDate: null,
  spouseHasIrrevocableTrust: false,
  spouseIrrevocableTrustName: '',
  spouseIrrevocableTrustDate: null,
  spouseConsideringTrust: false,
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
  specificGifts: [],
  hasGeneralBequests: false,
  generalBequestsDescription: '',
  cashGiftsToBeneficiaries: [],
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
  trusteeSecondAlternate: '',
  trusteeSecondAlternateOther: '',
  spouseTrusteeFirst: '',
  spouseTrusteeFirstOther: '',
  spouseTrusteeAlternate: '',
  spouseTrusteeAlternateOther: '',
  spouseTrusteeSecondAlternate: '',
  spouseTrusteeSecondAlternateOther: '',
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
  safeDepositBoxBank: '',
  safeDepositBoxNumber: '',
  safeDepositBoxLocation: '',
  safeDepositBoxAccess: '',
  safeDepositBoxContents: '',
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
  clientDistributionPlan: {
    distributionType: 'sweetheart',
    isSweetheartPlan: true,
    hasSpecificGifts: false,
    specificAssetGifts: [],
    cashGifts: [],
    residuaryBeneficiaries: [],
    residuaryShareType: 'equal',
    notes: '',
  },
  spouseDistributionPlan: {
    distributionType: 'sweetheart',
    isSweetheartPlan: true,
    hasSpecificGifts: false,
    specificAssetGifts: [],
    cashGifts: [],
    residuaryBeneficiaries: [],
    residuaryShareType: 'equal',
    notes: '',
  },
  mirrorDistributionPlans: false,
  clientNotes: '',
  clientLongTermCare: {
    primaryGoalsConcerns: '',
    ltcConcernLevel: '',
    previouslyMetWithAdvisor: false,
    advisorMeetingDetails: '',
    overallHealth: '',
    diagnoses: [],
    diagnosesOther: '',
    recentHospitalizations: false,
    hospitalizationDetails: '',
    mobilityLimitations: [],
    adlHelp: [],
    adlAssistance: '',
    iadlHelp: [],
    hasDementia: false,
    dementiaStage: '',
    familyHistoryOfConditions: false,
    familyHistoryDetails: '',
    currentLivingSituation: '',
    livingOther: '',
    inLtcFacility: false,
    currentCareLevel: '',
    facilityName: '',
    facilityAddress: '',
    facilityStartDate: '',
    receivesHomeHelp: false,
    homeHelpProviders: [],
    hoursOfHelpPerWeek: '',
    expectCareIncrease: '',
    careIncreaseExplanation: '',
    likelihoodOfLtcIn5Years: '',
    carePreference: '',
    carePreferenceOther: '',
    hasSpecificProvider: false,
    preferredProviderDetails: '',
    homeSupportsNeeded: [],
    geographicPreferences: '',
    primaryCaregivers: [],
    caregiversLimitedAbility: false,
    caregiversLimitedDetails: '',
    familyConflicts: '',
    medicareTypes: [],
    hasMedigap: false,
    medigapDetails: '',
    hasLtcInsurance: false,
    ltcInsuranceDetails: '',
    currentBenefits: [],
    previousMedicaidApplication: false,
    medicaidApplicationDetails: '',
    monthlyIncome: '',
    madeGiftsOver5Years: false,
    giftsDetails: '',
    expectingWindfall: false,
    windfallDetails: '',
    careSettingImportance: {
      stayWithSpouse: '',
      nearFamily: '',
      religiousCultural: '',
      petFriendly: '',
      privateRoom: '',
      socialActivities: '',
      onSiteMedicalStaff: '',
    },
    endOfLifePreferences: '',
    importantTherapiesActivities: '',
  },
  spouseLongTermCare: {
    primaryGoalsConcerns: '',
    ltcConcernLevel: '',
    previouslyMetWithAdvisor: false,
    advisorMeetingDetails: '',
    overallHealth: '',
    diagnoses: [],
    diagnosesOther: '',
    recentHospitalizations: false,
    hospitalizationDetails: '',
    mobilityLimitations: [],
    adlHelp: [],
    adlAssistance: '',
    iadlHelp: [],
    hasDementia: false,
    dementiaStage: '',
    familyHistoryOfConditions: false,
    familyHistoryDetails: '',
    currentLivingSituation: '',
    livingOther: '',
    inLtcFacility: false,
    currentCareLevel: '',
    facilityName: '',
    facilityAddress: '',
    facilityStartDate: '',
    receivesHomeHelp: false,
    homeHelpProviders: [],
    hoursOfHelpPerWeek: '',
    expectCareIncrease: '',
    careIncreaseExplanation: '',
    likelihoodOfLtcIn5Years: '',
    carePreference: '',
    carePreferenceOther: '',
    hasSpecificProvider: false,
    preferredProviderDetails: '',
    homeSupportsNeeded: [],
    geographicPreferences: '',
    primaryCaregivers: [],
    caregiversLimitedAbility: false,
    caregiversLimitedDetails: '',
    familyConflicts: '',
    medicareTypes: [],
    hasMedigap: false,
    medigapDetails: '',
    hasLtcInsurance: false,
    ltcInsuranceDetails: '',
    currentBenefits: [],
    previousMedicaidApplication: false,
    medicaidApplicationDetails: '',
    monthlyIncome: '',
    madeGiftsOver5Years: false,
    giftsDetails: '',
    expectingWindfall: false,
    windfallDetails: '',
    careSettingImportance: {
      stayWithSpouse: '',
      nearFamily: '',
      religiousCultural: '',
      petFriendly: '',
      privateRoom: '',
      socialActivities: '',
      onSiteMedicalStaff: '',
    },
    endOfLifePreferences: '',
    importantTherapiesActivities: '',
  },
  clientCurrentEstatePlan: {
    hasWill: false,
    hasTrust: false,
    isJointTrust: false,
    hasFinancialPOA: false,
    hasHealthCarePOA: false,
    hasLivingWill: false,
    hasNone: false,
    willDateSigned: '',
    willStateSigned: '',
    trustDateSigned: '',
    trustStateSigned: '',
    financialPOADateSigned: '',
    financialPOAStateSigned: '',
    healthCarePOADateSigned: '',
    healthCarePOAStateSigned: '',
    livingWillDateSigned: '',
    livingWillStateSigned: '',
    documentState: '',
    documentDate: '',
    reviewOption: '',
    uploadedFiles: [],
    willUploadedFiles: [],
    trustUploadedFiles: [],
    financialPOAUploadedFiles: [],
    healthCarePOAUploadedFiles: [],
    livingWillUploadedFiles: [],
    willPersonalRep: '',
    willPersonalRepAlternate1: '',
    willPersonalRepAlternate2: '',
    willPrimaryBeneficiary: '',
    willSecondaryBeneficiaries: '',
    willSpecificRealEstateGifts: [],
    willSpecificAssetGifts: [],
    willGeneralMoneyGifts: [],
    trustTrustee: '',
    trustTrusteeAlternate1: '',
    trustTrusteeAlternate2: '',
    trustPrimaryBeneficiary: '',
    trustSecondaryBeneficiaries: '',
    trustSpecificRealEstateGifts: [],
    trustSpecificAssetGifts: [],
    trustGeneralMoneyGifts: [],
    financialPOAAgent1: '',
    financialPOAAgent2: '',
    financialPOAAgent3: '',
    healthCarePOAAgent1: '',
    healthCarePOAAgent2: '',
    healthCarePOAAgent3: '',
    isHIPAACompliant: false,
    hasDNROrder: false,
    hasLivingWillDocument: false,
    comments: '',
  },
  spouseCurrentEstatePlan: {
    hasWill: false,
    hasTrust: false,
    isJointTrust: false,
    hasFinancialPOA: false,
    hasHealthCarePOA: false,
    hasLivingWill: false,
    hasNone: false,
    willDateSigned: '',
    willStateSigned: '',
    trustDateSigned: '',
    trustStateSigned: '',
    financialPOADateSigned: '',
    financialPOAStateSigned: '',
    healthCarePOADateSigned: '',
    healthCarePOAStateSigned: '',
    livingWillDateSigned: '',
    livingWillStateSigned: '',
    documentState: '',
    documentDate: '',
    reviewOption: '',
    uploadedFiles: [],
    willUploadedFiles: [],
    trustUploadedFiles: [],
    financialPOAUploadedFiles: [],
    healthCarePOAUploadedFiles: [],
    livingWillUploadedFiles: [],
    willPersonalRep: '',
    willPersonalRepAlternate1: '',
    willPersonalRepAlternate2: '',
    willPrimaryBeneficiary: '',
    willSecondaryBeneficiaries: '',
    willSpecificRealEstateGifts: [],
    willSpecificAssetGifts: [],
    willGeneralMoneyGifts: [],
    trustTrustee: '',
    trustTrusteeAlternate1: '',
    trustTrusteeAlternate2: '',
    trustPrimaryBeneficiary: '',
    trustSecondaryBeneficiaries: '',
    trustSpecificRealEstateGifts: [],
    trustSpecificAssetGifts: [],
    trustGeneralMoneyGifts: [],
    financialPOAAgent1: '',
    financialPOAAgent2: '',
    financialPOAAgent3: '',
    healthCarePOAAgent1: '',
    healthCarePOAAgent2: '',
    healthCarePOAAgent3: '',
    isHIPAACompliant: false,
    hasDNROrder: false,
    hasLivingWillDocument: false,
    comments: '',
  },

  // Metadata
  createdAt: '',
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
      const savedVersion = localStorage.getItem(SCHEMA_VERSION_KEY);
      const storedVersion = savedVersion ? parseInt(savedVersion, 10) : 0;

      if (savedData) {
        const parsed = deserializeFormData(savedData);

        // Merge with initialFormData to handle any new fields added to the schema
        // Deep merge for nested objects like clientLongTermCare, spouseLongTermCare, clientCurrentEstatePlan, spouseCurrentEstatePlan
        const mergedData: FormData = {
          ...initialFormData,
          ...parsed,
          // Ensure nested objects are properly merged with defaults
          clientLongTermCare: {
            ...initialFormData.clientLongTermCare,
            ...(parsed.clientLongTermCare || {}),
          },
          spouseLongTermCare: {
            ...initialFormData.spouseLongTermCare,
            ...(parsed.spouseLongTermCare || {}),
          },
          clientCurrentEstatePlan: {
            ...initialFormData.clientCurrentEstatePlan,
            ...(parsed.clientCurrentEstatePlan || {}),
          },
          spouseCurrentEstatePlan: {
            ...initialFormData.spouseCurrentEstatePlan,
            ...(parsed.spouseCurrentEstatePlan || {}),
          },
          clientDistributionPlan: {
            ...initialFormData.clientDistributionPlan,
            ...(parsed.clientDistributionPlan || {}),
          },
          spouseDistributionPlan: {
            ...initialFormData.spouseDistributionPlan,
            ...(parsed.spouseDistributionPlan || {}),
          },
        };

        // Ensure createdAt is set if it doesn't exist
        if (!mergedData.createdAt) {
          mergedData.createdAt = new Date().toISOString();
        }

        setFormData(mergedData);

        // If schema version changed, save the migrated data back to localStorage
        if (storedVersion < CURRENT_SCHEMA_VERSION) {
          localStorage.setItem(STORAGE_KEY, serializeFormData(mergedData));
          localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION.toString());
          console.log(`Migrated form data from schema version ${storedVersion} to ${CURRENT_SCHEMA_VERSION}`);
        }
      }

      // Always ensure schema version is current
      if (storedVersion < CURRENT_SCHEMA_VERSION) {
        localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION.toString());
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
