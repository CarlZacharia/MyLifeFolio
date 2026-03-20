/**
 * Filters the full folio JSONB data to only include sections
 * the authorized user is permitted to view.
 */

import { maskSensitiveFields } from './maskSensitiveData';

// Maps each access section to the FormData field keys it grants access to
const SECTION_FIELD_MAP: Record<string, string[]> = {
  personal: [
    'name', 'aka', 'birthDate', 'maritalStatus', 'sex', 'email',
    'cellPhone', 'homePhone', 'workPhone', 'mailingAddress', 'stateOfDomicile',
    'lookingToChangeDomicile', 'newDomicileState',
    'spouseName', 'spouseAka', 'spouseBirthDate', 'spouseSex',
    'spouseEmail', 'spouseCellPhone', 'spouseHomePhone', 'spouseWorkPhone',
    'spouseMailingAddress',
    'clientServedMilitary', 'clientMilitaryBranch', 'clientMilitaryStartDate', 'clientMilitaryEndDate',
    'spouseServedMilitary', 'spouseMilitaryBranch', 'spouseMilitaryStartDate', 'spouseMilitaryEndDate',
    'hasSafeDepositBox', 'safeDepositBoxBank', 'safeDepositBoxNumber',
    'safeDepositBoxLocation', 'safeDepositBoxAccess', 'safeDepositBoxContents',
    'dateMarried', 'placeOfMarriage', 'numberOfChildren', 'childrenTogether',
  ],

  medical: [
    'clientMedicalInsurance', 'spouseMedicalInsurance',
    'medicalProviders', 'medicalInsurancePolicies',
    'clientLongTermCare', 'spouseLongTermCare',
    'carePreferences',
  ],

  financial: [
    'bankAccounts', 'nonQualifiedInvestments', 'retirementAccounts',
    'lifeInsurance', 'realEstate', 'vehicles', 'otherAssets',
    'businessInterests', 'digitalAssets',
    'clientIncomeSources', 'spouseIncomeSources',
    'expenses', 'royalties',
  ],

  legal: [
    'clientCurrentEstatePlan', 'spouseCurrentEstatePlan',
    'executorFirst', 'executorFirstOther', 'executorAlternate', 'executorAlternateOther',
    'executorSecondAlternate', 'executorSecondAlternateOther',
    'spouseExecutorFirst', 'spouseExecutorFirstOther',
    'spouseExecutorAlternate', 'spouseExecutorAlternateOther',
    'spouseExecutorSecondAlternate', 'spouseExecutorSecondAlternateOther',
    'trusteeFirst', 'trusteeFirstOther', 'trusteeAlternate', 'trusteeAlternateOther',
    'trusteeSecondAlternate', 'trusteeSecondAlternateOther',
    'spouseTrusteeFirst', 'spouseTrusteeFirstOther',
    'spouseTrusteeAlternate', 'spouseTrusteeAlternateOther',
    'spouseTrusteeSecondAlternate', 'spouseTrusteeSecondAlternateOther',
    'irrevocableTrusteeFirst', 'irrevocableTrusteeFirstOther',
    'irrevocableTrusteeAlternate', 'irrevocableTrusteeAlternateOther',
    'irrevocableTrusteeSecondAlternate', 'irrevocableTrusteeSecondAlternateOther',
    'spouseIrrevocableTrusteeFirst', 'spouseIrrevocableTrusteeFirstOther',
    'spouseIrrevocableTrusteeAlternate', 'spouseIrrevocableTrusteeAlternateOther',
    'spouseIrrevocableTrusteeSecondAlternate', 'spouseIrrevocableTrusteeSecondAlternateOther',
    'guardianFirst', 'guardianFirstOther', 'guardianAlternate', 'guardianAlternateOther',
    'spouseGuardianFirst', 'spouseGuardianFirstOther',
    'spouseGuardianAlternate', 'spouseGuardianAlternateOther',
    'healthCareAgentName', 'healthCareAgentNameOther',
    'healthCareAlternateName', 'healthCareAlternateNameOther',
    'healthCareSecondAlternateName', 'healthCareSecondAlternateNameOther',
    'spouseHealthCareAgentName', 'spouseHealthCareAgentNameOther',
    'spouseHealthCareAlternateName', 'spouseHealthCareAlternateNameOther',
    'spouseHealthCareSecondAlternateName', 'spouseHealthCareSecondAlternateNameOther',
    'financialAgentName', 'financialAgentNameOther',
    'financialAlternateName', 'financialAlternateNameOther',
    'financialSecondAlternateName', 'financialSecondAlternateNameOther',
    'spouseFinancialAgentName', 'spouseFinancialAgentNameOther',
    'spouseFinancialAlternateName', 'spouseFinancialAlternateNameOther',
    'spouseFinancialSecondAlternateName', 'spouseFinancialSecondAlternateNameOther',
    'withdrawArtificialFoodFluid', 'spouseWithdrawArtificialFoodFluid',
    'clientDistributionPlan', 'spouseDistributionPlan', 'mirrorDistributionPlans',
    'clientHasLivingTrust', 'clientLivingTrustName', 'clientLivingTrustDate',
    'clientHasIrrevocableTrust', 'clientIrrevocableTrustName', 'clientIrrevocableTrustDate',
    'clientConsideringTrust', 'spouseHasLivingTrust', 'spouseHasIrrevocableTrust',
    'spouseLivingTrustName', 'spouseLivingTrustDate',
    'spouseIrrevocableTrustName', 'spouseIrrevocableTrustDate', 'spouseConsideringTrust',
  ],

  advisors: [
    'advisors', 'friendsNeighbors',
  ],

  end_of_life: [
    'endOfLife',
    'clientHasPrepaidFuneral', 'clientPrepaidFuneralDetails',
    'clientPreferredFuneralHome', 'clientBurialOrCremation', 'clientPreferredChurch',
    'spouseHasPrepaidFuneral', 'spousePrepaidFuneralDetails',
    'spousePreferredFuneralHome', 'spouseBurialOrCremation', 'spousePreferredChurch',
  ],

  insurance: [
    'medicalInsurancePolicies', 'insurancePolicies',
  ],

  family: [
    'children', 'otherBeneficiaries', 'charities',
    'anyBeneficiariesMinors', 'beneficiaryMinorsExplanation',
    'anyBeneficiariesDisabled', 'beneficiaryDisabledExplanation',
    'anyBeneficiariesMaritalProblems', 'beneficiaryMaritalProblemsExplanation',
    'anyBeneficiariesReceivingSSI', 'beneficiarySSIExplanation',
    'anyBeneficiaryDrugAddiction', 'beneficiaryDrugAddictionExplanation',
    'anyBeneficiaryAlcoholism', 'beneficiaryAlcoholismExplanation',
    'anyBeneficiaryFinancialProblems', 'beneficiaryFinancialProblemsExplanation',
    'hasOtherBeneficiaryConcerns', 'beneficiaryOtherConcerns', 'beneficiaryNotes',
    'provideForSpouseThenChildren', 'treatAllChildrenEqually',
    'childrenEqualityExplanation', 'distributionAge',
    'hasPetsForCare', 'pets', 'dependents',
    'numberOfChildren', 'childrenTogether',
    'priorMarriage', 'childrenFromPriorMarriage',
    'clientHasChildrenFromPrior', 'clientChildrenFromPrior',
    'spouseHasChildrenFromPrior', 'spouseChildrenFromPrior',
  ],
};

export interface FilteredFolio {
  data: Record<string, unknown>;
  ownerName: string;
  sectionsIncluded: string[];
}

/**
 * Filter folio data to only include fields allowed by the given access sections.
 * Also masks sensitive data unless full_sensitive is granted.
 */
export function filterFolioByAccess(
  folioData: Record<string, unknown>,
  accessSections: string[]
): FilteredFolio {
  const hasFullSensitive = accessSections.includes('full_sensitive');
  const allowedFields = new Set<string>();

  for (const section of accessSections) {
    const fields = SECTION_FIELD_MAP[section];
    if (fields) {
      fields.forEach((f) => allowedFields.add(f));
    }
  }

  const filtered: Record<string, unknown> = {};
  allowedFields.forEach((field) => {
    if (field in folioData) {
      filtered[field] = folioData[field];
    }
  });

  const masked = maskSensitiveFields(filtered, hasFullSensitive);

  return {
    data: masked,
    ownerName: (folioData.name as string) || 'Unknown',
    sectionsIncluded: accessSections.filter((s) => s !== 'full_sensitive'),
  };
}
