'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

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

// Beneficiary Distribution Method - how assets are distributed to this beneficiary
export type BeneficiaryDistributionMethod = '' | 'Outright' | 'Trust for Term of Years' | 'Trust for Life' | 'Unsure';

// Income frequency options
export type IncomeFrequency = '' | 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually' | 'Weekly' | 'Bi-Weekly';

// Income source for client/spouse
export interface IncomeSource {
  description: string;
  amount: string;
  frequency: IncomeFrequency;
}

// Medicare coverage type options
export type MedicareCoverageType = '' | 'Medicare Advantage' | 'Medicare Supplement';

// Medical insurance information
export interface MedicalInsurance {
  medicarePartBDeduction: string;  // Monthly Medicare Part B deduction
  medicareCoverageType: MedicareCoverageType;
  medicarePlanName: string;  // Name of the Medicare plan
  medicareCoverageCost: string;  // Monthly cost for Medicare Advantage or Supplement
  privateInsuranceDescription: string;
  privateInsuranceCost: string;  // Monthly cost
  otherInsuranceDescription: string;
  otherInsuranceCost: string;  // Monthly cost
}

// Royalty types
export type RoyaltyCategory =
  | ''
  | 'Intellectual Property Royalties'
  | 'Digital & Online Income Streams'
  | 'Natural Resource Rights'
  | 'Real Property & Land-Based Streams'
  | 'Financial & Investment Streams'
  | 'Business & Commercial Streams'
  | 'Government & Settlement Streams';

export type PaymentFrequency = '' | 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually' | 'Weekly' | 'Bi-Weekly' | 'Irregular';

export type Transferability = '' | 'Assignable' | 'Heritable' | 'Assignable & Heritable' | 'Non-Transferable' | 'Unknown';

export interface RoyaltyItem {
  category: RoyaltyCategory;
  type: string;
  payor: string;
  paymentFrequency: PaymentFrequency;
  approximateAmount: string;
  amountPeriod: 'Monthly' | 'Annually';
  contractExpirationDate: string;
  underlyingAssetOrRight: string;
  transferability: Transferability;
  documentedInEstatePlan: '' | 'Yes' | 'No' | 'Unsure';
}

// Uploaded document metadata for Supabase Storage
export interface UploadedDocumentInfo {
  name: string;           // Unique filename in storage
  originalName: string;   // Original filename from user
  path: string;           // Full path in Supabase storage
  type: string;           // MIME type
  size: number;           // File size in bytes
  uploadedAt: string;     // ISO timestamp
}

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

// Pet Care Types
export interface PetData {
  // Basic Pet Information
  petName: string;
  petType: string; // Dog, Cat, Bird, Fish, Reptile, Other
  petTypeOther: string;
  breed: string;
  age: string;
  weight: string;
  color: string;
  sex: string; // Male, Female, Unknown
  spayedNeutered: boolean;
  microchipped: boolean;
  microchipNumber: string;
  registrationNumber: string;

  // Veterinary Care
  vetName: string;
  vetClinic: string;
  vetPhone: string;
  vetAddress: string;
  medications: string;
  allergies: string;
  medicalConditions: string;
  vaccinesDue: string;
  specialMedicalInstructions: string;

  // Daily Care Instructions
  feedingSchedule: string;
  foodBrand: string;
  foodAmount: string;
  dietaryRestrictions: string;
  exerciseNeeds: string;
  groomingNeeds: string;
  sleepingArrangements: string;

  // Behavioral Profile
  temperament: string;
  fears: string;
  triggers: string;
  socialWithPeople: string;
  socialWithAnimals: string;
  trainingLevel: string;
  specialCommands: string;

  // Care Preferences & Wishes
  preferredCaretaker: string;
  alternateCaretaker: string;
  caretakerInstructions: string;
  keepWithOtherPets: boolean;
  keepWithOtherPetsDetails: string;
  neverPlaceWith: string;
  rehomingPreferences: string;

  // Financial Provisions
  monthlyCareBudget: string;
  petInsurance: boolean;
  petInsuranceCompany: string;
  petInsurancePolicyNumber: string;
  petTrustFunding: string;
  petTrustDetails: string;

  // Emergency Instructions
  emergencyContact: string;
  emergencyContactPhone: string;
  emergencyVetClinic: string;
  emergencyVetPhone: string;
  additionalNotes: string;
}

export interface CurrentEstatePlanData {
  // Document existence
  hasWill: boolean;
  hasTrust: boolean;
  isJointTrust: boolean; // For married couples - is the trust joint with spouse?
  hasIrrevocableTrust: boolean;
  isJointIrrevocableTrust: boolean; // For married couples - is the irrevocable trust joint with spouse?
  hasFinancialPOA: boolean;
  hasHealthCarePOA: boolean;
  hasLivingWill: boolean;
  hasNone: boolean;

  // Per-document details: date signed and home state at signing
  willDateSigned: string;
  willStateSigned: string;
  trustDateSigned: string;
  trustStateSigned: string;
  trustName: string; // Name of the trust
  trustStateResided: string; // State where the person resided when trust was signed
  irrevocableTrustName: string;
  irrevocableTrustDateSigned: string;
  irrevocableTrustStateResided: string;
  irrevocableTrustReason: string; // Reason for the irrevocable trust
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

  // File uploads per document type (store file metadata from Supabase Storage)
  uploadedFiles: UploadedDocumentInfo[]; // Legacy - kept for backwards compatibility
  willUploadedFiles: UploadedDocumentInfo[];
  trustUploadedFiles: UploadedDocumentInfo[];
  irrevocableTrustUploadedFiles: UploadedDocumentInfo[];
  financialPOAUploadedFiles: UploadedDocumentInfo[];
  healthCarePOAUploadedFiles: UploadedDocumentInfo[];
  livingWillUploadedFiles: UploadedDocumentInfo[];

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
  ltcInsuranceDetails: string; // Legacy field, kept for backwards compatibility
  ltcInsuranceCompany: string;
  ltcInsuranceDailyBenefit: string;
  ltcInsuranceTerm: string; // e.g., "3 years", "5 years", "Lifetime"
  ltcInsuranceMaximum: string;
  ltcInsuranceCareLevel: string; // Level of care required to trigger benefits
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

// Office and Attorney selection
export interface OfficeInfo {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  telephone?: string;
  fax?: string;
}

export interface AttorneyInfo {
  id: string;
  name: string;
  email: string;
  primaryOfficeId?: string;
  clioId?: string;
}

export interface FormData {
  // Office and Attorney Assignment
  officeId: string;
  officeName: string;
  attorneyId: string;
  attorneyName: string;
  submissionComments: string;

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
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  stateOfDomicile: string;
  lookingToChangeDomicile: boolean;
  newDomicileState: string;
  cellPhone: string;
  homePhone: string;
  workPhone: string;
  email: string;
  birthDate: Date | null;
  socialSecurityNumber: string; // Client SSN (encrypted on server before storage)
  spouseName: string;
  spouseAka: string;
  spouseMailingAddress: string;
  spouseMailingCity: string;
  spouseMailingState: string;
  spouseMailingZip: string;
  spouseCellPhone: string;
  spouseHomePhone: string;
  spouseWorkPhone: string;
  spouseEmail: string;
  spouseBirthDate: Date | null;
  spouseSex: Sex;
  spouseSocialSecurityNumber: string; // Spouse SSN (encrypted on server before storage)
  childrenTogether: number;
  spouseHasChildrenFromPrior: boolean;
  spouseChildrenFromPrior: number;

  // Income Sources - Client (up to 4)
  clientIncomeSources: IncomeSource[];

  // Income Sources - Spouse (up to 4)
  spouseIncomeSources: IncomeSource[];

  // Medical Insurance - Client
  clientMedicalInsurance: MedicalInsurance;

  // Medical Insurance - Spouse
  spouseMedicalInsurance: MedicalInsurance;

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
    telephone: string;
    email: string;
    birthDate: string;
    age: string;
    relationship: string;
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | '';
    hasChildren: boolean;
    numberOfChildren: number;
    hasMinorChildren: boolean;
    disinherit: boolean;
    isDeceased: boolean;
    comments: string;
  }>;
  // Beneficiary Concerns (applies to all beneficiaries, not just children)
  anyBeneficiariesMinors: boolean;
  beneficiaryMinorsExplanation: string;
  anyBeneficiariesDisabled: boolean;
  beneficiaryDisabledExplanation: string;
  anyBeneficiariesMaritalProblems: boolean;
  beneficiaryMaritalProblemsExplanation: string;
  anyBeneficiariesReceivingSSI: boolean;
  beneficiarySSIExplanation: string;
  anyBeneficiaryDrugAddiction: boolean;
  beneficiaryDrugAddictionExplanation: string;
  anyBeneficiaryAlcoholism: boolean;
  beneficiaryAlcoholismExplanation: string;
  anyBeneficiaryFinancialProblems: boolean;
  beneficiaryFinancialProblemsExplanation: string;
  hasOtherBeneficiaryConcerns: boolean;
  beneficiaryOtherConcerns: string;
  beneficiaryNotes: string;

  // Dispositive Intentions
  provideForSpouseThenChildren: boolean;
  treatAllChildrenEqually: boolean;
  // For blended families: should stepchildren be included in Will distributions?
  includeClientStepchildrenInSpouseWill: boolean; // Should Spouse's Will include Client's children from prior relationship?
  includeSpouseStepchildrenInClientWill: boolean; // Should Client's Will include Spouse's children from prior relationship?
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
  // When should cash bequests be paid? Only relevant for married couples
  // 'atFirstDeath' = paid when the first spouse dies
  // 'atSurvivorDeath' = paid when the surviving spouse dies (after both deceased)
  cashBequestTiming: 'atFirstDeath' | 'atSurvivorDeath';
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
    telephone: string;
    email: string;
    relationship: string;
    relationshipOther: string;
    age: string;
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

  irrevocableTrusteeFirst: string;
  irrevocableTrusteeFirstOther: string;
  irrevocableTrusteeAlternate: string;
  irrevocableTrusteeAlternateOther: string;
  irrevocableTrusteeSecondAlternate: string;
  irrevocableTrusteeSecondAlternateOther: string;
  spouseIrrevocableTrusteeFirst: string;
  spouseIrrevocableTrusteeFirstOther: string;
  spouseIrrevocableTrusteeAlternate: string;
  spouseIrrevocableTrusteeAlternateOther: string;
  spouseIrrevocableTrusteeSecondAlternate: string;
  spouseIrrevocableTrusteeSecondAlternateOther: string;

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

  medicalProviders: Array<{
    providerCategory: 'clientPCP' | 'clientSpecialist' | 'spousePCP' | 'spouseSpecialist';
    specialistType: string;
    name: string;
    firmName: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  }>;

  pharmacies: Array<{
    pharmacyName: string;
    pharmacyChain: string;
    phone: string;
    fax: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    hours: string;
    pharmacistName: string;
    accountNumber: string;
    specialty: boolean;
    mailOrder: boolean;
    notes: string;
    isPrimary: boolean;
    isActive: boolean;
  }>;

  medications: Array<{
    medicationName: string;
    dosage: string;
    form: string;
    frequency: string;
    frequencyNotes: string;
    prescribingPhysician: string;
    conditionTreated: string;
    pharmacyIndex: number | null;
    rxNumber: string;
    refillsRemaining: string;
    lastFilledDate: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    ndcNumber: string;
    requiresRefrigeration: boolean;
    controlledSubstance: boolean;
    notes: string;
  }>;

  medicalEquipment: Array<{
    equipmentName: string;
    equipmentType: string;
    makeModel: string;
    serialNumber: string;
    prescribingPhysician: string;
    supplierName: string;
    supplierPhone: string;
    supplierAddress: string;
    supplierWebsite: string;
    dateObtained: string;
    warrantyExpiration: string;
    nextServiceDate: string;
    maintenanceNotes: string;
    batteryType: string;
    insuranceCovers: boolean;
    insuranceInfo: string;
    replacementCost: string;
    isActive: boolean;
    notes: string;
  }>;

  medicalConditions: Array<{
    conditionName: string;
    diagnosedDate: string;
    treatingPhysician: string;
    status: string;
    notes: string;
  }>;

  allergies: Array<{
    allergen: string;
    allergyType: string;
    reaction: string;
    severity: string;
  }>;

  surgeries: Array<{
    procedureName: string;
    procedureType: string;
    procedureDate: string;
    facility: string;
    surgeonPhysician: string;
    notes: string;
  }>;

  basicVitals: {
    bloodType: string;
    height: string;
    weight: string;
    asOfDate: string;
  };

  advisors: Array<{
    advisorType: string;
    name: string;
    firmName: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  }>;

  friendsNeighbors: Array<{
    name: string;
    relationship: string;
    address: string;
    phone: string;
    email: string;
    notes: string;
  }>;

  medicalInsurancePolicies: Array<{
    person: 'client' | 'spouse';
    insuranceType: string;
    policyNo: string;
    provider: string;
    paidBy: string;
    monthlyCost: string;
    contactName: string;
    contactAddress: string;
    contactPhone: string;
    contactEmail: string;
    notes: string;
  }>;

  insurancePolicies: Array<{
    person: 'client' | 'spouse';
    coverageType: string;
    policyNo: string;
    provider: string;
    annualCost: string;
    contactName: string;
    contactAddress: string;
    contactPhone: string;
    contactEmail: string;
    notes: string;
    liabilityLimits?: string;
    hasCollision?: boolean;
    hasComprehensive?: boolean;
    comprehensiveDeductible?: string;
    uninsuredAmount?: string;
    underinsuredAmount?: string;
    medicalPaymentsAmount?: string;
    hasRentalInsurance?: boolean;
    hoPolicyType?: string;
    effectiveDate?: string;
    expirationDate?: string;
    autoRenewal?: boolean;
    propertyCovered?: string;
    coverageAmounts?: string;
    deductibles?: string;
    hurricaneWindDeductible?: string;
    hasScheduledPersonalProperty?: boolean;
    scheduledPersonalPropertyLimit?: string;
    hasFineArtsRider?: boolean;
    hasHomeBusinessEndorsement?: boolean;
    hasWaterBackup?: boolean;
    waterBackupLimit?: string;
    hasServiceLineCoverage?: boolean;
    hasEquipmentBreakdown?: boolean;
    hasIdentityTheftCoverage?: boolean;
    ltcInsuredName?: string;
    ltcIssueDate?: string;
    ltcPolicyStatus?: string;
    ltcDailyBenefitAmount?: string;
    ltcMonthlyBenefitAmount?: string;
    ltcBenefitPeriod?: string;
    ltcMaxLifetimeBenefitPool?: string;
    ltcInflationProtectionType?: string;
    ltcCurrentBenefitAfterInflation?: string;
    ltcSharedCareRider?: boolean;
    ltcEliminationPeriod?: string;
    ltcCoversNursingFacility?: boolean;
    ltcCoversAssistedLiving?: boolean;
    ltcCoversMemoryCare?: boolean;
    ltcCoversAdultDayCare?: boolean;
    ltcCoversHomeHealthCare?: boolean;
    ltcCoversHospice?: boolean;
    ltcCoversFamilyCaregiver?: boolean;
    ltcHasBedReservation?: boolean;
    ltcBedReservationDays?: string;
    ltcAnnualPremium?: string;
    umbPolicyType?: string;
    umbEffectiveDate?: string;
    umbExpirationDate?: string;
    umbLimit?: string;
    umbLimitOther?: string;
    umbSelfInsuredRetention?: string;
    umbAutoLiabilityRequired?: string;
    umbHomeownersLiabilityRequired?: string;
    umbHasWatercraftRequired?: boolean;
    umbWatercraftLimit?: string;
    umbHasRentalPropertyRequired?: boolean;
    umbRentalPropertyLimit?: string;
    umbOtherUnderlyingPolicies?: string;
    umbAllSameCarrier?: boolean;
    umbNamedInsured?: string;
    umbAdditionalInsureds?: string;
    umbAnnualPremium?: string;
  }>;

  expenses: Array<{
    category: string;
    expenseType: string;
    paidTo: string;
    frequency: string;
    amount: string;
    notes: string;
  }>;

  subscriptions: Array<{
    serviceName: string;
    category: string;
    frequency: string;
    amount: string;
    paymentMethod: string;
    accountHolder: string;
    loginEmail: string;
    autoRenew: boolean;
    renewalDate: string;
    isActive: boolean;
    notes: string;
  }>;

  carePreferences: Array<{
    category: string;
    preferenceItem: string;
    response: string;
    notes: string;
  }>;

  endOfLife: Array<{
    category: string;
    [key: string]: string;
  }>;

  additionalComments: string;

  // Legacy section
  legacyObituary: {
    // The Basics
    preferredName: string;
    nicknames: string;
    dateOfBirth: string;
    placeOfBirth: string;
    dateOfDeath: string;
    placeOfDeath: string;
    // Life Story
    hometowns: string;
    religiousAffiliation: string;
    militaryService: string;
    education: string;
    careerHighlights: string;
    communityInvolvement: string;
    awardsHonors: string;
    // Family
    spouses: string;
    children: string;
    grandchildren: string;
    siblings: string;
    parents: string;
    othersToMention: string;
    precededInDeath: string;
    // Your Voice
    tone: string;
    quotesToInclude: string;
    whatToRemember: string;
    personalMessage: string;
    // Final Arrangements
    preferredFuneralHome: string;
    burialOrCremation: string;
    servicePreferences: string;
    charitableDonations: string;
    // Generation tracking
    obituaryGenerationCount: number;
  };

  legacyObituarySpouse: {
    // The Basics
    preferredName: string;
    nicknames: string;
    dateOfBirth: string;
    placeOfBirth: string;
    dateOfDeath: string;
    placeOfDeath: string;
    // Life Story
    hometowns: string;
    religiousAffiliation: string;
    militaryService: string;
    education: string;
    careerHighlights: string;
    communityInvolvement: string;
    awardsHonors: string;
    // Family
    spouses: string;
    children: string;
    grandchildren: string;
    siblings: string;
    parents: string;
    othersToMention: string;
    precededInDeath: string;
    // Your Voice
    tone: string;
    quotesToInclude: string;
    whatToRemember: string;
    personalMessage: string;
    // Final Arrangements
    preferredFuneralHome: string;
    burialOrCremation: string;
    servicePreferences: string;
    charitableDonations: string;
    // Generation tracking
    obituaryGenerationCount: number;
  };

  legacyCharityOrganizations: Array<{
    organizationName: string;
    website: string;
    contactInfo: string;
    notes: string;
  }>;

  legacyCharityPreferences: {
    donationsInLieuOfFlowers: boolean;
    scholarshipFund: string;
    religiousDonations: string;
    legacyGivingNotes: string;
    whyTheseCauses: string;
  };

  legacyLetters: Array<{
    recipientType: string;
    recipientName: string;
    letterBody: string;
    format: string;
    mediaUrl: string;
    isPrivate: boolean;
  }>;

  legacyPersonalHistory: {
    birthplace: string;
    childhoodMemories: string;
    parentsBackground: string;
    schoolsAttended: string;
    educationMemories: string;
    firstJob: string;
    careerMilestones: string;
    proudestProfessional: string;
    howWeMet: string;
    weddingStory: string;
    raisingChildren: string;
    importantDecisions: string;
    biggestChallenges: string;
    risksTaken: string;
  };

  legacyStories: Array<{
    storyTitle: string;
    storyBody: string;
    peopleInvolved: string;
    approximateDate: string;
    location: string;
    lessonsLearned: string;
  }>;

  legacyReflections: {
    whatMattersMost: string;
    adviceToYounger: string;
    coreBeliefs: string;
    greatestRegrets: string;
    greatestJoys: string;
    howRemembered: string;
    personalValues: string[];
  };

  legacySurprises: {
    hiddenTalents: string;
    unusualExperiences: string;
    funFacts: string;
    adventures: string;
    untoldStories: string;
  };

  legacyFavorites: {
    favoriteMusic: string;
    favoriteBooks: string;
    favoriteMovies: string;
    favoriteFoods: string;
    favoriteRestaurants: string;
    favoriteVacationDestinations: string;
    favoriteQuotesSayings: string;
    otherFavorites: string;
  };

  legacyVideos: Array<{
    videoTitle: string;
    recordingDate: string;
    description: string;
    cloudLink: string;
    isPrivate: boolean;
    transcript: string;
  }>;

  legacyMemories: Array<{
    memoryTitle: string;
    description: string;
    peopleInPhoto: string;
    approximateYear: string;
    location: string;
    tags: string;
    mediaUrl: string;
  }>;

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

  // Royalties & Income Streams
  royalties: RoyaltyItem[];

  // Pet Care
  hasPetsForCare: boolean;
  pets: PetData[];

  // Metadata
  createdAt: string; // ISO date string of when the questionnaire was started
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  loadFormData: (data: FormData, step?: number) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  clearFormData: () => void;
  intakeId: string | null;
  setIntakeId: (id: string | null) => void;
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
  // Office and Attorney Assignment
  officeId: '',
  officeName: '',
  attorneyId: '',
  attorneyName: '',
  submissionComments: '',

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
  mailingCity: '',
  mailingState: '',
  mailingZip: '',
  stateOfDomicile: '',
  lookingToChangeDomicile: false,
  newDomicileState: '',
  cellPhone: '',
  homePhone: '',
  workPhone: '',
  email: '',
  birthDate: null,
  socialSecurityNumber: '',
  spouseName: '',
  spouseAka: '',
  spouseMailingAddress: '',
  spouseMailingCity: '',
  spouseMailingState: '',
  spouseMailingZip: '',
  spouseCellPhone: '',
  spouseHomePhone: '',
  spouseWorkPhone: '',
  spouseEmail: '',
  spouseBirthDate: null,
  spouseSex: '',
  spouseSocialSecurityNumber: '',
  childrenTogether: 0,
  spouseHasChildrenFromPrior: false,
  spouseChildrenFromPrior: 0,
  // Default 4 income sources for client (first one defaults to Social Security)
  clientIncomeSources: [
    { description: 'Social Security', amount: '', frequency: '' },
    { description: '', amount: '', frequency: '' },
    { description: '', amount: '', frequency: '' },
    { description: '', amount: '', frequency: '' },
  ],
  // Default 4 income sources for spouse (first one defaults to Social Security)
  spouseIncomeSources: [
    { description: 'Social Security', amount: '', frequency: '' },
    { description: '', amount: '', frequency: '' },
    { description: '', amount: '', frequency: '' },
    { description: '', amount: '', frequency: '' },
  ],
  // Medical Insurance - Client
  clientMedicalInsurance: {
    medicarePartBDeduction: '',
    medicareCoverageType: '',
    medicarePlanName: '',
    medicareCoverageCost: '',
    privateInsuranceDescription: '',
    privateInsuranceCost: '',
    otherInsuranceDescription: '',
    otherInsuranceCost: '',
  },
  // Medical Insurance - Spouse
  spouseMedicalInsurance: {
    medicarePartBDeduction: '',
    medicareCoverageType: '',
    medicarePlanName: '',
    medicareCoverageCost: '',
    privateInsuranceDescription: '',
    privateInsuranceCost: '',
    otherInsuranceDescription: '',
    otherInsuranceCost: '',
  },
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
  // Beneficiary Concerns
  anyBeneficiariesMinors: false,
  beneficiaryMinorsExplanation: '',
  anyBeneficiariesDisabled: false,
  beneficiaryDisabledExplanation: '',
  anyBeneficiariesMaritalProblems: false,
  beneficiaryMaritalProblemsExplanation: '',
  anyBeneficiariesReceivingSSI: false,
  beneficiarySSIExplanation: '',
  anyBeneficiaryDrugAddiction: false,
  beneficiaryDrugAddictionExplanation: '',
  anyBeneficiaryAlcoholism: false,
  beneficiaryAlcoholismExplanation: '',
  anyBeneficiaryFinancialProblems: false,
  beneficiaryFinancialProblemsExplanation: '',
  hasOtherBeneficiaryConcerns: false,
  beneficiaryOtherConcerns: '',
  beneficiaryNotes: '',
  provideForSpouseThenChildren: true,
  treatAllChildrenEqually: true,
  includeClientStepchildrenInSpouseWill: false,
  includeSpouseStepchildrenInClientWill: false,
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
  cashBequestTiming: 'atSurvivorDeath', // Default: pay at survivor's death (most common for married couples)
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
  irrevocableTrusteeFirst: '',
  irrevocableTrusteeFirstOther: '',
  irrevocableTrusteeAlternate: '',
  irrevocableTrusteeAlternateOther: '',
  irrevocableTrusteeSecondAlternate: '',
  irrevocableTrusteeSecondAlternateOther: '',
  spouseIrrevocableTrusteeFirst: '',
  spouseIrrevocableTrusteeFirstOther: '',
  spouseIrrevocableTrusteeAlternate: '',
  spouseIrrevocableTrusteeAlternateOther: '',
  spouseIrrevocableTrusteeSecondAlternate: '',
  spouseIrrevocableTrusteeSecondAlternateOther: '',
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
  medicalProviders: [],
  pharmacies: [],
  medications: [],
  medicalEquipment: [],
  medicalConditions: [],
  allergies: [],
  surgeries: [],
  basicVitals: {
    bloodType: '',
    height: '',
    weight: '',
    asOfDate: '',
  },
  advisors: [],
  friendsNeighbors: [],
  medicalInsurancePolicies: [],
  insurancePolicies: [],
  expenses: [],
  subscriptions: [],
  carePreferences: [],
  endOfLife: [],
  additionalComments: '',
  legacyObituary: {
    preferredName: '', nicknames: '', dateOfBirth: '', placeOfBirth: '', dateOfDeath: '', placeOfDeath: '',
    hometowns: '', religiousAffiliation: '', militaryService: '', education: '', careerHighlights: '',
    communityInvolvement: '', awardsHonors: '',
    spouses: '', children: '', grandchildren: '', siblings: '', parents: '', othersToMention: '', precededInDeath: '',
    tone: '', quotesToInclude: '', whatToRemember: '', personalMessage: '',
    preferredFuneralHome: '', burialOrCremation: '', servicePreferences: '', charitableDonations: '',
    obituaryGenerationCount: 0,
  },
  legacyObituarySpouse: {
    preferredName: '', nicknames: '', dateOfBirth: '', placeOfBirth: '', dateOfDeath: '', placeOfDeath: '',
    hometowns: '', religiousAffiliation: '', militaryService: '', education: '', careerHighlights: '',
    communityInvolvement: '', awardsHonors: '',
    spouses: '', children: '', grandchildren: '', siblings: '', parents: '', othersToMention: '', precededInDeath: '',
    tone: '', quotesToInclude: '', whatToRemember: '', personalMessage: '',
    preferredFuneralHome: '', burialOrCremation: '', servicePreferences: '', charitableDonations: '',
    obituaryGenerationCount: 0,
  },
  legacyCharityOrganizations: [],
  legacyCharityPreferences: {
    donationsInLieuOfFlowers: false, scholarshipFund: '', religiousDonations: '',
    legacyGivingNotes: '', whyTheseCauses: '',
  },
  legacyLetters: [],
  legacyPersonalHistory: {
    birthplace: '', childhoodMemories: '', parentsBackground: '',
    schoolsAttended: '', educationMemories: '', firstJob: '',
    careerMilestones: '', proudestProfessional: '', howWeMet: '',
    weddingStory: '', raisingChildren: '', importantDecisions: '',
    biggestChallenges: '', risksTaken: '',
  },
  legacyStories: [],
  legacyReflections: {
    whatMattersMost: '', adviceToYounger: '', coreBeliefs: '',
    greatestRegrets: '', greatestJoys: '', howRemembered: '', personalValues: [],
  },
  legacySurprises: {
    hiddenTalents: '', unusualExperiences: '', funFacts: '',
    adventures: '', untoldStories: '',
  },
  legacyFavorites: {
    favoriteMusic: '', favoriteBooks: '', favoriteMovies: '', favoriteFoods: '',
    favoriteRestaurants: '', favoriteVacationDestinations: '',
    favoriteQuotesSayings: '', otherFavorites: '',
  },
  legacyVideos: [],
  legacyMemories: [],
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
    ltcInsuranceCompany: '',
    ltcInsuranceDailyBenefit: '',
    ltcInsuranceTerm: '',
    ltcInsuranceMaximum: '',
    ltcInsuranceCareLevel: '',
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
    ltcInsuranceCompany: '',
    ltcInsuranceDailyBenefit: '',
    ltcInsuranceTerm: '',
    ltcInsuranceMaximum: '',
    ltcInsuranceCareLevel: '',
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
    hasIrrevocableTrust: false,
    isJointIrrevocableTrust: false,
    hasFinancialPOA: false,
    hasHealthCarePOA: false,
    hasLivingWill: false,
    hasNone: false,
    willDateSigned: '',
    willStateSigned: '',
    trustDateSigned: '',
    trustStateSigned: '',
    trustName: '',
    trustStateResided: '',
    irrevocableTrustName: '',
    irrevocableTrustDateSigned: '',
    irrevocableTrustStateResided: '',
    irrevocableTrustReason: '',
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
    irrevocableTrustUploadedFiles: [],
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
    hasIrrevocableTrust: false,
    isJointIrrevocableTrust: false,
    hasFinancialPOA: false,
    hasHealthCarePOA: false,
    hasLivingWill: false,
    hasNone: false,
    willDateSigned: '',
    willStateSigned: '',
    trustDateSigned: '',
    trustStateSigned: '',
    trustName: '',
    trustStateResided: '',
    irrevocableTrustName: '',
    irrevocableTrustDateSigned: '',
    irrevocableTrustStateResided: '',
    irrevocableTrustReason: '',
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
    irrevocableTrustUploadedFiles: [],
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

  // Royalties & Income Streams
  royalties: [],

  // Pet Care
  hasPetsForCare: false,
  pets: [],

  // Metadata
  createdAt: '',
};

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  // Initialize on mount - data will be loaded from Supabase by parent component
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Auto-save will be handled by parent component via Supabase
  // No localStorage auto-save needed

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const loadFormData = (data: FormData, step: number = 0) => {
    setFormData({ ...initialFormData, ...data });
    setCurrentStep(step);
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        loadFormData,
        currentStep,
        setCurrentStep,
        clearFormData,
        intakeId,
        setIntakeId,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
