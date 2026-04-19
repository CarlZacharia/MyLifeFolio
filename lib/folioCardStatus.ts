import { useEffect, useState } from 'react';
import { FormData } from './FormContext';
import { supabase } from './supabase';

export type FolioCardId =
  | 'personal-information'
  | 'family-dependents'
  | 'financial-life'
  | 'people-advisors'
  | 'insurance-coverage'
  | 'emergency-care'
  | 'care-decisions'
  | 'end-of-life'
  | 'legacy-life-story'
  | 'legal-documents'
  | 'document-uploads'
  | 'digital-life';

const isFilled = (v: unknown): boolean => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'boolean') return v === true;
  if (typeof v === 'number') return v !== 0;
  if (v instanceof Date) return !isNaN(v.getTime());
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

const anyFieldFilled = (obj: Record<string, unknown> | undefined | null): boolean => {
  if (!obj) return false;
  return Object.values(obj).some(isFilled);
};

const countRowsByKey = <T>(
  arr: T[] | undefined,
  ...keyFields: (keyof T)[]
): number => {
  if (!arr) return 0;
  return arr.filter((row) => keyFields.some((k) => isFilled(row[k]))).length;
};

// Personal Information card — count filled sub-sections
const countPersonalInformation = (f: FormData): number => {
  let n = 0;
  // Client
  if (isFilled(f.name) && isFilled(f.birthDate)) n += 1;
  if (isFilled(f.mailingAddress) || isFilled(f.mailingCity)) n += 1;
  if (isFilled(f.cellPhone) || isFilled(f.homePhone) || isFilled(f.email) || isFilled(f.workPhone)) n += 1;
  if (isFilled(f.clientServedMilitary)) n += 1;
  if (anyFieldFilled(f.clientMedicalInsurance as unknown as Record<string, unknown>)) n += 1;
  if (isFilled(f.hasSafeDepositBox) || isFilled(f.safeDepositBoxBank) || isFilled(f.safeDepositBoxNumber)) n += 1;
  if (isFilled(f.stateOfDomicile)) n += 1;
  // Spouse (only if married)
  if (f.maritalStatus === 'Married' || f.maritalStatus === 'Second Marriage') {
    if (isFilled(f.spouseName) && isFilled(f.spouseBirthDate)) n += 1;
    if (isFilled(f.spouseMailingAddress) || isFilled(f.spouseMailingCity)) n += 1;
    if (isFilled(f.spouseCellPhone) || isFilled(f.spouseHomePhone) || isFilled(f.spouseEmail)) n += 1;
    if (isFilled(f.spouseServedMilitary)) n += 1;
    if (anyFieldFilled(f.spouseMedicalInsurance as unknown as Record<string, unknown>)) n += 1;
  }
  return n;
};

const countFamilyDependents = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.children, 'name');
  n += countRowsByKey(f.otherBeneficiaries, 'name');
  n += countRowsByKey(f.charities, 'name');
  n += countRowsByKey(f.dependents, 'name');
  if (f.pets) n += f.pets.length;
  return n;
};

const countFinancialLife = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.realEstate, 'street', 'city');
  n += countRowsByKey(f.bankAccounts, 'institution');
  n += countRowsByKey(f.retirementAccounts, 'institution');
  n += countRowsByKey(f.nonQualifiedInvestments, 'institution');
  n += countRowsByKey(f.lifeInsurance, 'company');
  n += countRowsByKey(f.vehicles, 'yearMakeModel');
  n += countRowsByKey(f.otherAssets, 'description');
  n += countRowsByKey(f.businessInterests, 'businessName');
  n += countRowsByKey(f.debts, 'amount', 'description');
  n += countRowsByKey(f.expenses, 'expenseType', 'paidTo');
  n += countRowsByKey(f.royalties, 'type', 'payor');
  // Income sources — filter out the empty default rows
  n += countRowsByKey(f.clientIncomeSources, 'amount');
  n += countRowsByKey(f.spouseIncomeSources, 'amount');
  return n;
};

const countPeopleAdvisors = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.advisors, 'name');
  n += countRowsByKey(f.friendsNeighbors, 'name');
  return n;
};

const countInsuranceCoverage = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.insurancePolicies, 'provider', 'policyNo');
  n += countRowsByKey(f.medicalInsurancePolicies, 'provider', 'policyNo');
  if (anyFieldFilled(f.clientMedicalInsurance as unknown as Record<string, unknown>)) n += 1;
  if (anyFieldFilled(f.spouseMedicalInsurance as unknown as Record<string, unknown>)) n += 1;
  return n;
};

const countMedicalData = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.medicalProviders, 'name');
  n += countRowsByKey(f.medications, 'medicationName');
  n += countRowsByKey(f.medicalEquipment, 'equipmentName');
  n += countRowsByKey(f.pharmacies, 'pharmacyName');
  n += countRowsByKey(f.medicalConditions, 'conditionName');
  n += countRowsByKey(f.allergies, 'allergen');
  n += countRowsByKey(f.surgeries, 'procedureName');
  if (anyFieldFilled(f.basicVitals as unknown as Record<string, unknown>)) n += 1;
  return n;
};

const countCareDecisions = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.carePreferences, 'response');
  if (anyFieldFilled(f.clientLongTermCare as unknown as Record<string, unknown>)) n += 1;
  if (f.maritalStatus && anyFieldFilled(f.spouseLongTermCare as unknown as Record<string, unknown>)) n += 1;
  return n;
};

const countEndOfLife = (f: FormData): number => {
  let n = 0;
  // Client funeral preferences
  if (f.clientHasPrepaidFuneral || isFilled(f.clientPrepaidFuneralDetails)) n += 1;
  if (isFilled(f.clientPreferredFuneralHome)) n += 1;
  if (isFilled(f.clientBurialOrCremation)) n += 1;
  if (isFilled(f.clientPreferredChurch)) n += 1;
  // Spouse funeral preferences
  if (f.spouseHasPrepaidFuneral || isFilled(f.spousePrepaidFuneralDetails)) n += 1;
  if (isFilled(f.spousePreferredFuneralHome)) n += 1;
  if (isFilled(f.spouseBurialOrCremation)) n += 1;
  if (isFilled(f.spousePreferredChurch)) n += 1;
  // endOfLife rows (each row has category + dynamic keys)
  if (f.endOfLife) {
    n += f.endOfLife.filter((row) => {
      const keys = Object.keys(row).filter((k) => k !== 'category');
      return keys.some((k) => isFilled((row as Record<string, unknown>)[k]));
    }).length;
  }
  return n;
};

const countLegacyLifeStory = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.legacyLetters, 'letterBody', 'subject');
  n += countRowsByKey(f.legacyStories, 'storyBody', 'storyTitle');
  n += countRowsByKey(f.legacyVideos, 'videoTitle');
  n += countRowsByKey(f.legacyMemories, 'memoryTitle');
  n += countRowsByKey(f.legacyCharityOrganizations, 'organizationName');
  if (f.legacyObituary && isFilled(f.legacyObituary.preferredName)) n += 1;
  if (f.legacyObituarySpouse && isFilled(f.legacyObituarySpouse.preferredName)) n += 1;
  if (anyFieldFilled(f.legacyPersonalHistory as unknown as Record<string, unknown>)) n += 1;
  if (anyFieldFilled(f.legacyReflections as unknown as Record<string, unknown>)) n += 1;
  if (anyFieldFilled(f.legacySurprises as unknown as Record<string, unknown>)) n += 1;
  if (anyFieldFilled(f.legacyFavorites as unknown as Record<string, unknown>)) n += 1;
  if (anyFieldFilled(f.legacyCharityPreferences as unknown as Record<string, unknown>)) n += 1;
  return n;
};

const countLegalDocuments = (f: FormData): number => {
  let n = 0;
  if (f.clientHasLivingTrust) n += 1;
  if (f.clientHasIrrevocableTrust) n += 1;
  if (f.spouseHasLivingTrust) n += 1;
  if (f.spouseHasIrrevocableTrust) n += 1;
  if (isFilled(f.healthCareAgentName)) n += 1;
  if (isFilled(f.financialAgentName)) n += 1;
  if (isFilled(f.spouseHealthCareAgentName)) n += 1;
  if (isFilled(f.spouseFinancialAgentName)) n += 1;
  if (isFilled(f.executorFirst)) n += 1;
  if (isFilled(f.spouseExecutorFirst)) n += 1;
  if (anyFieldFilled(f.clientCurrentEstatePlan as unknown as Record<string, unknown>)) n += 1;
  if (anyFieldFilled(f.spouseCurrentEstatePlan as unknown as Record<string, unknown>)) n += 1;
  return n;
};

const countDigitalLife = (f: FormData): number => {
  let n = 0;
  n += countRowsByKey(f.digitalAssets, 'platform', 'assetType');
  n += countRowsByKey(f.digitalSubscriptions, 'serviceName');
  n += countRowsByKey(f.subscriptions, 'serviceName');
  n += countRowsByKey(f.socialMediaAccounts, 'platform', 'usernameHandle');
  n += countRowsByKey(f.domainsDigitalBusiness, 'name');
  return n;
};

export const getFolioCardCounts = (
  formData: FormData,
): Record<Exclude<FolioCardId, 'document-uploads'>, number> => ({
  'personal-information': countPersonalInformation(formData),
  'family-dependents': countFamilyDependents(formData),
  'financial-life': countFinancialLife(formData),
  'people-advisors': countPeopleAdvisors(formData),
  'insurance-coverage': countInsuranceCoverage(formData),
  'emergency-care': countMedicalData(formData),
  'care-decisions': countCareDecisions(formData),
  'end-of-life': countEndOfLife(formData),
  'legacy-life-story': countLegacyLifeStory(formData),
  'legal-documents': countLegalDocuments(formData),
  'digital-life': countDigitalLife(formData),
});

// Documents Vault lives in Supabase, so count via query
export const useVaultDocumentCount = (userId: string | undefined): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    let cancelled = false;
    (async () => {
      const { count: n } = await supabase
        .from('vault_documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (!cancelled && typeof n === 'number') setCount(n);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return count;
};
