/**
 * Supabase Intake CRUD Functions
 *
 * This module provides functions for saving and retrieving estate planning intake data
 * from Supabase. It supports both raw JSON storage and normalized table storage.
 */

import { supabase } from './supabase';
import { FormData } from './FormContext';
import { encryptSensitiveData, decryptSensitiveData, hasSensitiveData } from './encryption';

// Types for intake operations
export type IntakeType =
  | 'EstatePlanning'
  | 'Probate'
  | 'Trust'
  | 'ElderLaw'
  | 'Medicaid'
  | 'RealEstate'
  | 'BusinessFormation'
  | 'Other';

export interface IntakeRawRecord {
  id: string;
  user_id: string;
  intake_type: IntakeType;
  form_data: FormData;
  client_name: string | null;
  spouse_name: string | null; 
  created_at: string;
  updated_at: string;
}

export interface IntakeListItem {
  id: string;
  client_name: string | null;
  spouse_name: string | null;
  intake_type: IntakeType;
  created_at: string;
  updated_at: string;
}

export interface SaveIntakeResult {
  success: boolean;
  intakeRawId?: string;
  intakeId?: string;
  error?: string;
}

// ============================================================================
// RAW JSON INTAKE FUNCTIONS
// ============================================================================

/**
 * Save form data as raw JSON to the intakes_raw table
 */
export async function saveIntakeRaw(
  formData: FormData,
  intakeType: IntakeType = 'EstatePlanning',
  existingId?: string
): Promise<SaveIntakeResult> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Prepare the data - convert Date objects to ISO strings for JSON storage
    let jsonFormData = serializeFormDataForJson(formData);

    // Encrypt sensitive fields (SSNs, etc.) before saving — only if sensitive data is present
    if (hasSensitiveData(jsonFormData)) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const isSessionValid = session &&
                              session.access_token &&
                              session.expires_at &&
                              session.expires_at > Math.floor(Date.now() / 1000);

        if (!sessionError && isSessionValid) {
          jsonFormData = await encryptSensitiveData(jsonFormData);
        }
      } catch (encryptError: any) {
        console.error('Encryption failed — aborting save to prevent plaintext storage:', encryptError);
        return { success: false, error: 'Unable to encrypt sensitive data. Please try again.' };
      }
    }

    if (existingId) {
      // Update existing record
      const { data, error } = await supabase
        .from('intakes_raw')
        .update({
          form_data: jsonFormData,
          intake_type: intakeType,
          submission_comments: formData.submissionComments || null,
          office_id: formData.officeId || null,
          attorney_id: formData.attorneyId || null,
        })
        .eq('id', existingId)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (error) {
        console.error('Error updating intake_raw:', error);
        return { success: false, error: error.message };
      }

      return { success: true, intakeRawId: data.id };
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('intakes_raw')
        .insert({
          user_id: user.id,
          intake_type: intakeType,
          form_data: jsonFormData,
          submission_comments: formData.submissionComments || null,
          office_id: formData.officeId || null,
          attorney_id: formData.attorneyId || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error inserting intake_raw:', error);
        return { success: false, error: error.message };
      }

      return { success: true, intakeRawId: data.id };
    }
  } catch (err) {
    console.error('Error in saveIntakeRaw:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get a single raw intake by ID
 * @param skipDecryption - If true, skip decrypting sensitive fields (useful for preview/sync checks)
 */
export async function getIntakeRaw(id: string, skipDecryption = false): Promise<IntakeRawRecord | null> {
  try {
    const { data, error } = await supabase
      .from('intakes_raw')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching intake_raw:', error);
      return null;
    }

    // Decrypt sensitive fields (SSNs, etc.) unless skipDecryption is true
    let formData = data.form_data;
    if (!skipDecryption && hasSensitiveData(formData as any)) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const isSessionValid = session &&
                              session.access_token &&
                              session.expires_at &&
                              session.expires_at > Math.floor(Date.now() / 1000);

        if (!sessionError && isSessionValid) {
          formData = await decryptSensitiveData(formData as any) as any;
        }
      } catch (decryptError: any) {
        // Continue with encrypted data if decryption fails
        console.warn('Decryption failed, displaying encrypted data:', decryptError);
      }
    }

    // Parse the form_data back to FormData type (convert date strings to Date objects)
    formData = deserializeFormDataFromJson(formData);

    return {
      ...data,
      form_data: formData,
    } as IntakeRawRecord;
  } catch (err) {
    console.error('Error in getIntakeRaw:', err);
    return null;
  }
}

/**
 * List all raw intakes for the current user
 */
export async function listIntakesRaw(
  intakeType?: IntakeType
): Promise<IntakeListItem[]> {
  try {
    let query = supabase
      .from('intakes_raw')
      .select('id, client_name, spouse_name, intake_type, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (intakeType) {
      query = query.eq('intake_type', intakeType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing intakes_raw:', error);
      return [];
    }

    return data as IntakeListItem[];
  } catch (err) {
    console.error('Error in listIntakesRaw:', err);
    return [];
  }
}

/**
 * Delete a raw intake by ID
 */
export async function deleteIntakeRaw(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('intakes_raw').delete().eq('id', id);

    if (error) {
      console.error('Error deleting intake_raw:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteIntakeRaw:', err);
    return false;
  }
}

// ============================================================================
// NORMALIZED TABLE FUNCTIONS
// ============================================================================

/**
 * Save form data to normalized tables
 * This creates/updates records in all the related tables
 */
export async function saveIntakeNormalized(
  formData: FormData,
  existingIntakeId?: string,
  intakeRawId?: string
): Promise<SaveIntakeResult> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Start by saving or updating the main intake record
    const intakeResult = await saveMainIntake(formData, user.id, existingIntakeId, intakeRawId);
    if (!intakeResult.success || !intakeResult.intakeId) {
      return intakeResult;
    }

    const intakeId = intakeResult.intakeId;

    // Save all related records in parallel
    const [
      childrenResult,
      beneficiariesResult,
      charitiesResult,
      dependentsResult,
      realEstateResult,
      bankAccountsResult,
      investmentsResult,
      retirementResult,
      lifeInsuranceResult,
      vehiclesResult,
      otherAssetsResult,
      businessResult,
      digitalAssetsResult,
      medicalProvidersResult,
      pharmaciesResult,
      medicationsResult,
      medicalEquipmentResult,
      medicalConditionsResult,
      allergiesResult,
      surgeriesResult,
      basicVitalsResult,
      medicalInsuranceResult,
      insuranceCoverageResult,
      advisorsResult,
      expensesResult,
      subscriptionsResult,
      digitalSubscriptionsResult,
      carePreferencesResult,
      endOfLifeResult,
      friendsNeighborsResult,
      specificGiftsResult,
      cashGiftsResult,
      ltcResult,
      cepResult,
      distPlansResult,
      legacyObituaryResult,
      legacyObituarySpouseResult,
      legacyCharityOrgsResult,
      legacyCharityPrefsResult,
      legacyLettersResult,
      legacyPersonalHistoryResult,
      legacyStoriesResult,
      legacyReflectionsResult,
      legacySurprisesResult,
      legacyFavoritesResult,
      legacyVideosResult,
      legacyMemoriesResult,
    ] = await Promise.all([
      saveChildren(formData.children, intakeId, user.id),
      saveBeneficiaries(formData.otherBeneficiaries, intakeId, user.id),
      saveCharities(formData.charities, intakeId, user.id),
      saveDependents(formData.dependents, intakeId, user.id),
      saveRealEstate(formData.realEstate, intakeId, user.id),
      saveBankAccounts(formData.bankAccounts, intakeId, user.id),
      saveInvestments(formData.nonQualifiedInvestments, intakeId, user.id),
      saveRetirementAccounts(formData.retirementAccounts, intakeId, user.id),
      saveLifeInsurance(formData.lifeInsurance, intakeId, user.id),
      saveVehicles(formData.vehicles, intakeId, user.id),
      saveOtherAssets(formData.otherAssets, intakeId, user.id),
      saveBusinessInterests(formData.businessInterests, intakeId, user.id),
      saveDigitalAssets(formData.digitalAssets, intakeId, user.id),
      saveMedicalProviders(formData.medicalProviders, intakeId, user.id),
      savePharmacies(formData.pharmacies, intakeId, user.id),
      saveMedications(formData.medications, intakeId, user.id),
      saveMedicalEquipment(formData.medicalEquipment, intakeId, user.id),
      saveMedicalConditions(formData.medicalConditions, intakeId, user.id),
      saveAllergies(formData.allergies, intakeId, user.id),
      saveSurgeries(formData.surgeries, intakeId, user.id),
      saveBasicVitals(formData.basicVitals, intakeId, user.id),
      saveMedicalInsurance(formData.medicalInsurancePolicies, intakeId, user.id),
      saveInsuranceCoverage(formData.insurancePolicies, intakeId, user.id),
      saveAdvisors(formData.advisors, intakeId, user.id),
      saveExpenses(formData.expenses, intakeId, user.id),
      saveSubscriptions(formData.subscriptions, intakeId, user.id),
      saveDigitalSubscriptions(formData.digitalSubscriptions, intakeId, user.id),
      saveCarePreferences(formData.carePreferences, intakeId, user.id),
      saveEndOfLife(formData.endOfLife, intakeId, user.id),
      saveFriendsNeighbors(formData.friendsNeighbors, intakeId, user.id),
      saveSpecificGifts(formData.specificGifts, intakeId, user.id),
      saveCashGifts(formData.cashGiftsToBeneficiaries, intakeId, user.id),
      saveLongTermCare(formData, intakeId, user.id),
      saveCurrentEstatePlan(formData, intakeId, user.id),
      saveDistributionPlans(formData, intakeId, user.id),
      saveLegacyObituary(formData.legacyObituary, intakeId, user.id),
      saveLegacyObituarySpouse(formData.legacyObituarySpouse, intakeId, user.id),
      saveLegacyCharityOrganizations(formData.legacyCharityOrganizations, intakeId, user.id),
      saveLegacyCharityPreferences(formData.legacyCharityPreferences, intakeId, user.id),
      saveLegacyLetters(formData.legacyLetters, intakeId, user.id),
      saveLegacyPersonalHistory(formData.legacyPersonalHistory, intakeId, user.id),
      saveLegacyStories(formData.legacyStories, intakeId, user.id),
      saveLegacyReflections(formData.legacyReflections, intakeId, user.id),
      saveLegacySurprises(formData.legacySurprises, intakeId, user.id),
      saveLegacyFavorites(formData.legacyFavorites, intakeId, user.id),
      saveLegacyVideos(formData.legacyVideos, intakeId, user.id),
      saveLegacyMemories(formData.legacyMemories, intakeId, user.id),
    ]);

    // Check for any errors
    const errors = [
      childrenResult,
      beneficiariesResult,
      charitiesResult,
      dependentsResult,
      realEstateResult,
      bankAccountsResult,
      investmentsResult,
      retirementResult,
      lifeInsuranceResult,
      vehiclesResult,
      otherAssetsResult,
      businessResult,
      digitalAssetsResult,
      medicalProvidersResult,
      pharmaciesResult,
      medicationsResult,
      medicalEquipmentResult,
      medicalConditionsResult,
      allergiesResult,
      surgeriesResult,
      basicVitalsResult,
      medicalInsuranceResult,
      insuranceCoverageResult,
      advisorsResult,
      expensesResult,
      subscriptionsResult,
      digitalSubscriptionsResult,
      carePreferencesResult,
      endOfLifeResult,
      friendsNeighborsResult,
      specificGiftsResult,
      cashGiftsResult,
      ltcResult,
      cepResult,
      distPlansResult,
      legacyObituaryResult,
      legacyObituarySpouseResult,
      legacyCharityOrgsResult,
      legacyCharityPrefsResult,
      legacyLettersResult,
      legacyPersonalHistoryResult,
      legacyStoriesResult,
      legacyReflectionsResult,
      legacySurprisesResult,
      legacyFavoritesResult,
      legacyVideosResult,
      legacyMemoriesResult,
    ].filter((r) => !r.success);

    if (errors.length > 0) {
      console.warn('Some related records failed to save:', errors);
    }

    return { success: true, intakeId };
  } catch (err) {
    console.error('Error in saveIntakeNormalized:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Save the main intake record
 */
async function saveMainIntake(
  formData: FormData,
  userId: string,
  existingId?: string,
  intakeRawId?: string
): Promise<SaveIntakeResult> {
  const mainIntakeData = {
    user_id: userId,
    intake_raw_id: intakeRawId || null,
    intake_date: formData.date || null,
    appointment_date: formData.appointmentDate || null,
    client_name: formData.name || '',
    client_aka: formData.aka || null,
    client_sex: formData.sex || null,
    client_birth_date: formData.birthDate ? formatDateForDb(formData.birthDate) : null,
    client_mailing_address: formData.mailingAddress || null,
    client_state_of_domicile: formData.stateOfDomicile || null,
    client_looking_to_change_domicile: formData.lookingToChangeDomicile,
    client_new_domicile_state: formData.newDomicileState || null,
    client_cell_phone: formData.cellPhone || null,
    client_home_phone: formData.homePhone || null,
    client_work_phone: formData.workPhone || null,
    client_email: formData.email || null,
    client_served_military: formData.clientServedMilitary,
    client_military_branch: formData.clientMilitaryBranch || null,
    client_military_start_date: formData.clientMilitaryStartDate || null,
    client_military_end_date: formData.clientMilitaryEndDate || null,
    client_has_prepaid_funeral: formData.clientHasPrepaidFuneral,
    client_prepaid_funeral_details: formData.clientPrepaidFuneralDetails || null,
    client_preferred_funeral_home: formData.clientPreferredFuneralHome || null,
    client_burial_or_cremation: formData.clientBurialOrCremation || null,
    client_preferred_church: formData.clientPreferredChurch || null,
    client_has_living_trust: formData.clientHasLivingTrust,
    client_living_trust_name: formData.clientLivingTrustName || null,
    client_living_trust_date: formData.clientLivingTrustDate
      ? formatDateForDb(formData.clientLivingTrustDate)
      : null,
    client_has_irrevocable_trust: formData.clientHasIrrevocableTrust,
    client_irrevocable_trust_name: formData.clientIrrevocableTrustName || null,
    client_irrevocable_trust_date: formData.clientIrrevocableTrustDate
      ? formatDateForDb(formData.clientIrrevocableTrustDate)
      : null,
    client_considering_trust: formData.clientConsideringTrust,
    marital_status: formData.maritalStatus || null,
    date_married: formData.dateMarried ? formatDateForDb(formData.dateMarried) : null,
    place_of_marriage: formData.placeOfMarriage || null,
    prior_marriage: formData.priorMarriage,
    children_from_prior_marriage: formData.childrenFromPriorMarriage,
    number_of_children: formData.numberOfChildren,
    client_has_children_from_prior: formData.clientHasChildrenFromPrior,
    client_children_from_prior: formData.clientChildrenFromPrior,
    children_together: formData.childrenTogether,
    spouse_name: formData.spouseName || null,
    spouse_aka: formData.spouseAka || null,
    spouse_sex: formData.spouseSex || null,
    spouse_birth_date: formData.spouseBirthDate
      ? formatDateForDb(formData.spouseBirthDate)
      : null,
    spouse_mailing_address: formData.spouseMailingAddress || null,
    spouse_cell_phone: formData.spouseCellPhone || null,
    spouse_home_phone: formData.spouseHomePhone || null,
    spouse_work_phone: formData.spouseWorkPhone || null,
    spouse_email: formData.spouseEmail || null,
    spouse_has_children_from_prior: formData.spouseHasChildrenFromPrior,
    spouse_children_from_prior: formData.spouseChildrenFromPrior,
    spouse_served_military: formData.spouseServedMilitary,
    spouse_military_branch: formData.spouseMilitaryBranch || null,
    spouse_military_start_date: formData.spouseMilitaryStartDate || null,
    spouse_military_end_date: formData.spouseMilitaryEndDate || null,
    spouse_has_prepaid_funeral: formData.spouseHasPrepaidFuneral,
    spouse_prepaid_funeral_details: formData.spousePrepaidFuneralDetails || null,
    spouse_preferred_funeral_home: formData.spousePreferredFuneralHome || null,
    spouse_burial_or_cremation: formData.spouseBurialOrCremation || null,
    spouse_preferred_church: formData.spousePreferredChurch || null,
    spouse_has_living_trust: formData.spouseHasLivingTrust,
    spouse_living_trust_name: formData.spouseLivingTrustName || null,
    spouse_living_trust_date: formData.spouseLivingTrustDate
      ? formatDateForDb(formData.spouseLivingTrustDate)
      : null,
    spouse_has_irrevocable_trust: formData.spouseHasIrrevocableTrust,
    spouse_irrevocable_trust_name: formData.spouseIrrevocableTrustName || null,
    spouse_irrevocable_trust_date: formData.spouseIrrevocableTrustDate
      ? formatDateForDb(formData.spouseIrrevocableTrustDate)
      : null,
    spouse_considering_trust: formData.spouseConsideringTrust,
    any_beneficiaries_minors: formData.anyBeneficiariesMinors,
    beneficiary_minors_explanation: formData.beneficiaryMinorsExplanation || null,
    any_beneficiaries_disabled: formData.anyBeneficiariesDisabled,
    beneficiary_disabled_explanation: formData.beneficiaryDisabledExplanation || null,
    any_beneficiaries_marital_problems: formData.anyBeneficiariesMaritalProblems,
    beneficiary_marital_problems_explanation:
      formData.beneficiaryMaritalProblemsExplanation || null,
    any_beneficiaries_receiving_ssi: formData.anyBeneficiariesReceivingSSI,
    beneficiary_ssi_explanation: formData.beneficiarySSIExplanation || null,
    any_beneficiary_drug_addiction: formData.anyBeneficiaryDrugAddiction,
    beneficiary_drug_addiction_explanation:
      formData.beneficiaryDrugAddictionExplanation || null,
    any_beneficiary_alcoholism: formData.anyBeneficiaryAlcoholism,
    beneficiary_alcoholism_explanation: formData.beneficiaryAlcoholismExplanation || null,
    any_beneficiary_financial_problems: formData.anyBeneficiaryFinancialProblems,
    beneficiary_financial_problems_explanation:
      formData.beneficiaryFinancialProblemsExplanation || null,
    has_other_beneficiary_concerns: formData.hasOtherBeneficiaryConcerns,
    beneficiary_other_concerns: formData.beneficiaryOtherConcerns || null,
    beneficiary_notes: formData.beneficiaryNotes || null,
    provide_for_spouse_then_children: formData.provideForSpouseThenChildren,
    treat_all_children_equally: formData.treatAllChildrenEqually,
    include_client_stepchildren_in_spouse_will: formData.includeClientStepchildrenInSpouseWill,
    include_spouse_stepchildren_in_client_will: formData.includeSpouseStepchildrenInClientWill,
    children_equality_explanation: formData.childrenEqualityExplanation || null,
    distribution_age: formData.distributionAge || null,
    children_predeceased_beneficiaries: formData.childrenPredeceasedBeneficiaries,
    leave_to_grandchildren: formData.leaveToGrandchildren,
    treat_all_grandchildren_equally: formData.treatAllGrandchildrenEqually,
    grandchildren_equality_explanation: formData.grandchildrenEqualityExplanation || null,
    grandchildren_amount: formData.grandchildrenAmount || null,
    grandchildren_distribution_age: formData.grandchildrenDistributionAge || null,
    has_specific_devises: formData.hasSpecificDevises,
    specific_devises_description: formData.specificDevisesDescription || null,
    has_general_bequests: formData.hasGeneralBequests,
    general_bequests_description: formData.generalBequestsDescription || null,
    cash_bequest_timing: formData.cashBequestTiming || 'atSurvivorDeath',
    dispositive_intentions_comments: formData.dispositiveIntentionsComments || null,
    leave_to_charity: formData.leaveToCharity,
    mirror_distribution_plans: formData.mirrorDistributionPlans,
    executor_first: formData.executorFirst || null,
    executor_first_other: formData.executorFirstOther || null,
    executor_alternate: formData.executorAlternate || null,
    executor_alternate_other: formData.executorAlternateOther || null,
    executor_second_alternate: formData.executorSecondAlternate || null,
    executor_second_alternate_other: formData.executorSecondAlternateOther || null,
    trustee_first: formData.trusteeFirst || null,
    trustee_first_other: formData.trusteeFirstOther || null,
    trustee_alternate: formData.trusteeAlternate || null,
    trustee_alternate_other: formData.trusteeAlternateOther || null,
    trustee_second_alternate: formData.trusteeSecondAlternate || null,
    trustee_second_alternate_other: formData.trusteeSecondAlternateOther || null,
    guardian_first: formData.guardianFirst || null,
    guardian_first_other: formData.guardianFirstOther || null,
    guardian_alternate: formData.guardianAlternate || null,
    guardian_alternate_other: formData.guardianAlternateOther || null,
    spouse_executor_first: formData.spouseExecutorFirst || null,
    spouse_executor_first_other: formData.spouseExecutorFirstOther || null,
    spouse_executor_alternate: formData.spouseExecutorAlternate || null,
    spouse_executor_alternate_other: formData.spouseExecutorAlternateOther || null,
    spouse_executor_second_alternate: formData.spouseExecutorSecondAlternate || null,
    spouse_executor_second_alternate_other: formData.spouseExecutorSecondAlternateOther || null,
    spouse_trustee_first: formData.spouseTrusteeFirst || null,
    spouse_trustee_first_other: formData.spouseTrusteeFirstOther || null,
    spouse_trustee_alternate: formData.spouseTrusteeAlternate || null,
    spouse_trustee_alternate_other: formData.spouseTrusteeAlternateOther || null,
    spouse_trustee_second_alternate: formData.spouseTrusteeSecondAlternate || null,
    spouse_trustee_second_alternate_other: formData.spouseTrusteeSecondAlternateOther || null,
    spouse_guardian_first: formData.spouseGuardianFirst || null,
    spouse_guardian_first_other: formData.spouseGuardianFirstOther || null,
    spouse_guardian_alternate: formData.spouseGuardianAlternate || null,
    spouse_guardian_alternate_other: formData.spouseGuardianAlternateOther || null,
    health_care_agent_name: formData.healthCareAgentName || null,
    health_care_agent_name_other: formData.healthCareAgentNameOther || null,
    health_care_alternate_name: formData.healthCareAlternateName || null,
    health_care_alternate_name_other: formData.healthCareAlternateNameOther || null,
    health_care_second_alternate_name: formData.healthCareSecondAlternateName || null,
    health_care_second_alternate_name_other: formData.healthCareSecondAlternateNameOther || null,
    withdraw_artificial_food_fluid: formData.withdrawArtificialFoodFluid,
    spouse_health_care_agent_name: formData.spouseHealthCareAgentName || null,
    spouse_health_care_agent_name_other: formData.spouseHealthCareAgentNameOther || null,
    spouse_health_care_alternate_name: formData.spouseHealthCareAlternateName || null,
    spouse_health_care_alternate_name_other: formData.spouseHealthCareAlternateNameOther || null,
    spouse_health_care_second_alternate_name: formData.spouseHealthCareSecondAlternateName || null,
    spouse_health_care_second_alternate_name_other:
      formData.spouseHealthCareSecondAlternateNameOther || null,
    spouse_withdraw_artificial_food_fluid: formData.spouseWithdrawArtificialFoodFluid,
    financial_agent_name: formData.financialAgentName || null,
    financial_agent_name_other: formData.financialAgentNameOther || null,
    financial_alternate_name: formData.financialAlternateName || null,
    financial_alternate_name_other: formData.financialAlternateNameOther || null,
    financial_second_alternate_name: formData.financialSecondAlternateName || null,
    financial_second_alternate_name_other: formData.financialSecondAlternateNameOther || null,
    spouse_financial_agent_name: formData.spouseFinancialAgentName || null,
    spouse_financial_agent_name_other: formData.spouseFinancialAgentNameOther || null,
    spouse_financial_alternate_name: formData.spouseFinancialAlternateName || null,
    spouse_financial_alternate_name_other: formData.spouseFinancialAlternateNameOther || null,
    spouse_financial_second_alternate_name: formData.spouseFinancialSecondAlternateName || null,
    spouse_financial_second_alternate_name_other:
      formData.spouseFinancialSecondAlternateNameOther || null,
    legal_issues: formData.legalIssues || null,
    spouse_legal_issues: formData.spouseLegalIssues || null,
    important_papers_location: formData.importantPapersLocation || null,
    has_safe_deposit_box: formData.hasSafeDepositBox,
    safe_deposit_box_bank: formData.safeDepositBoxBank || null,
    safe_deposit_box_number: formData.safeDepositBoxNumber || null,
    safe_deposit_box_location: formData.safeDepositBoxLocation || null,
    safe_deposit_box_access: formData.safeDepositBoxAccess || null,
    safe_deposit_box_contents: formData.safeDepositBoxContents || null,
    additional_comments: formData.additionalComments || null,
    client_notes: formData.clientNotes || null,
  };

  if (existingId) {
    const { data, error } = await supabase
      .from('folio_intakes')
      .update(mainIntakeData)
      .eq('id', existingId)
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, intakeId: data.id };
  } else {
    const { data, error } = await supabase
      .from('folio_intakes')
      .insert(mainIntakeData)
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, intakeId: data.id };
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR SAVING RELATED RECORDS
// ============================================================================

interface SaveResult {
  success: boolean;
  error?: string;
}

async function deleteAndInsertRecords(
  tableName: string,
  intakeId: string,
  userId: string,
  records: Record<string, unknown>[]
): Promise<SaveResult> {
  if (records.length === 0) {
    // Just delete existing records if array is empty
    await supabase.from(tableName).delete().eq('intake_id', intakeId);
    return { success: true };
  }

  // Delete existing records
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq('intake_id', intakeId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // Insert new records with intake_id and user_id
  const recordsWithIds = records.map((record, index) => ({
    ...record,
    intake_id: intakeId,
    user_id: userId,
    sort_order: index,
  }));

  const { error: insertError } = await supabase.from(tableName).insert(recordsWithIds);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true };
}

async function saveChildren(
  children: FormData['children'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = children.map((child) => ({
    name: child.name,
    address: child.address || null,
    birth_date: child.birthDate || null,
    age: child.age || null,
    relationship: child.relationship || null,
    marital_status: child.maritalStatus || null,
    has_children: child.hasChildren,
    number_of_children: child.numberOfChildren,
    has_minor_children: child.hasMinorChildren,
    distribution_type: child.distributionType || null,
    disinherit: child.disinherit,
    comments: child.comments || null,
  }));

  return deleteAndInsertRecords('folio_children', intakeId, userId, records);
}

async function saveBeneficiaries(
  beneficiaries: FormData['otherBeneficiaries'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = beneficiaries.map((b) => ({
    name: b.name,
    address: b.address || null,
    relationship: b.relationship || null,
    relationship_other: b.relationshipOther || null,
    age: b.age || null,
    distribution_type: b.distributionType || null,
    notes: b.notes || null,
  }));

  return deleteAndInsertRecords('folio_beneficiaries', intakeId, userId, records);
}

async function saveCharities(
  charities: FormData['charities'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = charities.map((c) => ({
    name: c.name,
    address: c.address || null,
    amount: c.amount || null,
  }));

  return deleteAndInsertRecords('folio_charities', intakeId, userId, records);
}

async function saveDependents(
  dependents: FormData['dependents'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = dependents.map((d) => ({
    name: d.name,
    relationship: d.relationship || null,
  }));

  return deleteAndInsertRecords('folio_dependents', intakeId, userId, records);
}

async function saveRealEstate(
  realEstate: FormData['realEstate'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = realEstate.map((re) => ({
    owner: re.owner || null,
    ownership_form: re.ownershipForm || null,
    category: re.category || null,
    show_beneficiaries: re.showBeneficiaries,
    show_other: re.showOther,
    joint_owner_beneficiaries: re.jointOwnerBeneficiaries || [],
    joint_owner_other: re.jointOwnerOther || null,
    street: re.street || null,
    city: re.city || null,
    state: re.state || null,
    zip: re.zip || null,
    value: parseDecimal(re.value),
    mortgage_balance: parseDecimal(re.mortgageBalance),
    cost_basis: parseDecimal(re.costBasis),
    primary_beneficiaries: re.primaryBeneficiaries || [],
    remainder_interest_other: re.remainderInterestOther || null,
    client_ownership_percentage: re.clientOwnershipPercentage || null,
    spouse_ownership_percentage: re.spouseOwnershipPercentage || null,
    client_spouse_joint_type: re.clientSpouseJointType || null,
    client_spouse_combined_percentage: re.clientSpouseCombinedPercentage || null,
    notes: re.notes || null,
  }));

  return deleteAndInsertRecords('folio_real_estate', intakeId, userId, records);
}

async function saveBankAccounts(
  bankAccounts: FormData['bankAccounts'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = bankAccounts.map((ba) => ({
    owner: ba.owner || null,
    account_type: ba.accountType || null,
    institution: ba.institution || null,
    amount: parseDecimal(ba.amount),
    has_tod: ba.hasTOD ?? null,
    tod_primary_beneficiary: ba.todPrimaryBeneficiary || null,
    tod_secondary_beneficiary: ba.todSecondaryBeneficiary || null,
    has_beneficiaries: ba.hasBeneficiaries,
    primary_beneficiaries: ba.primaryBeneficiaries || [],
    primary_distribution_type: ba.primaryDistributionType || null,
    secondary_beneficiaries: ba.secondaryBeneficiaries || [],
    secondary_distribution_type: ba.secondaryDistributionType || null,
    notes: ba.notes || null,
  }));

  return deleteAndInsertRecords('folio_bank_accounts', intakeId, userId, records);
}

async function saveInvestments(
  investments: FormData['nonQualifiedInvestments'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = investments.map((inv) => ({
    owner: inv.owner || null,
    institution: inv.institution || null,
    description: inv.description || null,
    value: parseDecimal(inv.value),
    has_tod: inv.hasTOD ?? null,
    tod_primary_beneficiary: inv.todPrimaryBeneficiary || null,
    tod_secondary_beneficiary: inv.todSecondaryBeneficiary || null,
    has_beneficiaries: inv.hasBeneficiaries,
    primary_beneficiaries: inv.primaryBeneficiaries || [],
    primary_distribution_type: inv.primaryDistributionType || null,
    secondary_beneficiaries: inv.secondaryBeneficiaries || [],
    secondary_distribution_type: inv.secondaryDistributionType || null,
    notes: inv.notes || null,
  }));

  return deleteAndInsertRecords('folio_investments', intakeId, userId, records);
}

async function saveRetirementAccounts(
  accounts: FormData['retirementAccounts'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = accounts.map((acc) => ({
    owner: acc.owner || null,
    institution: acc.institution || null,
    account_type: acc.accountType || null,
    value: parseDecimal(acc.value),
    has_tod: acc.hasTOD ?? null,
    tod_primary_beneficiary: acc.todPrimaryBeneficiary || null,
    tod_secondary_beneficiary: acc.todSecondaryBeneficiary || null,
    has_beneficiaries: acc.hasBeneficiaries,
    primary_beneficiaries: acc.primaryBeneficiaries || [],
    primary_distribution_type: acc.primaryDistributionType || null,
    secondary_beneficiaries: acc.secondaryBeneficiaries || [],
    secondary_distribution_type: acc.secondaryDistributionType || null,
    notes: acc.notes || null,
  }));

  return deleteAndInsertRecords('folio_retirement_accounts', intakeId, userId, records);
}

async function saveLifeInsurance(
  policies: FormData['lifeInsurance'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = policies.map((pol) => ({
    owner: pol.owner || null,
    company: pol.company || null,
    policy_type: pol.policyType || null,
    face_amount: parseDecimal(pol.faceAmount),
    death_benefit: parseDecimal(pol.deathBenefit),
    cash_value: parseDecimal(pol.cashValue),
    insured: pol.insured || null,
    primary_beneficiary: pol.primaryBeneficiary || null,
    secondary_beneficiary: pol.secondaryBeneficiary || null,
    has_beneficiaries: pol.hasBeneficiaries,
    primary_beneficiaries: pol.primaryBeneficiaries || [],
    primary_distribution_type: pol.primaryDistributionType || null,
    secondary_beneficiaries: pol.secondaryBeneficiaries || [],
    secondary_distribution_type: pol.secondaryDistributionType || null,
    notes: pol.notes || null,
  }));

  return deleteAndInsertRecords('folio_life_insurance', intakeId, userId, records);
}

async function saveVehicles(
  vehicles: FormData['vehicles'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = vehicles.map((v) => ({
    owner: v.owner || null,
    year_make_model: v.yearMakeModel || null,
    value: parseDecimal(v.value),
    has_beneficiaries: v.hasBeneficiaries,
    primary_beneficiaries: v.primaryBeneficiaries || [],
    primary_distribution_type: v.primaryDistributionType || null,
    secondary_beneficiaries: v.secondaryBeneficiaries || [],
    secondary_distribution_type: v.secondaryDistributionType || null,
    notes: v.notes || null,
  }));

  return deleteAndInsertRecords('folio_vehicles', intakeId, userId, records);
}

async function saveOtherAssets(
  assets: FormData['otherAssets'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = assets.map((a) => ({
    owner: a.owner || null,
    description: a.description || null,
    value: parseDecimal(a.value),
    has_beneficiaries: a.hasBeneficiaries,
    primary_beneficiaries: a.primaryBeneficiaries || [],
    primary_distribution_type: a.primaryDistributionType || null,
    secondary_beneficiaries: a.secondaryBeneficiaries || [],
    secondary_distribution_type: a.secondaryDistributionType || null,
    add_to_personal_property_memo: a.addToPersonalPropertyMemo,
    notes: a.notes || null,
  }));

  return deleteAndInsertRecords('folio_other_assets', intakeId, userId, records);
}

async function saveBusinessInterests(
  businesses: FormData['businessInterests'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = businesses.map((b) => ({
    owner: b.owner || null,
    business_name: b.businessName || null,
    entity_type: b.entityType || null,
    ownership_percentage: b.ownershipPercentage || null,
    full_value: parseDecimal(b.fullValue),
    co_owners: b.coOwners || null,
    has_buy_sell_agreement: b.hasBuySellAgreement,
    notes: b.notes || null,
  }));

  return deleteAndInsertRecords('folio_business_interests', intakeId, userId, records);
}

async function saveDigitalAssets(
  assets: FormData['digitalAssets'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = assets.map((a) => ({
    owner: a.owner || null,
    asset_type: a.assetType || null,
    platform: a.platform || null,
    description: a.description || null,
    value: parseDecimal(a.value),
    notes: a.notes || null,
  }));

  return deleteAndInsertRecords('folio_digital_assets', intakeId, userId, records);
}

async function saveMedicalProviders(
  providers: FormData['medicalProviders'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = providers.map((p) => ({
    provider_category: p.providerCategory || null,
    specialist_type: p.specialistType || null,
    name: p.name || null,
    firm_name: p.firmName || null,
    phone: p.phone || null,
    email: p.email || null,
    address: p.address || null,
    notes: p.notes || null,
  }));

  return deleteAndInsertRecords('folio_medical_providers', intakeId, userId, records);
}

async function savePharmacies(
  pharmacies: FormData['pharmacies'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = pharmacies.map((p) => ({
    pharmacy_name: p.pharmacyName || null,
    pharmacy_chain: p.pharmacyChain || null,
    phone: p.phone || null,
    fax: p.fax || null,
    address: p.address || null,
    city: p.city || null,
    state: p.state || null,
    zip: p.zip || null,
    hours: p.hours || null,
    pharmacist_name: p.pharmacistName || null,
    account_number: p.accountNumber || null,
    specialty: p.specialty,
    mail_order: p.mailOrder,
    notes: p.notes || null,
    is_primary: p.isPrimary,
    is_active: p.isActive,
  }));

  return deleteAndInsertRecords('folio_pharmacies', intakeId, userId, records);
}

async function saveMedications(
  medications: FormData['medications'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = medications.map((m) => ({
    medication_name: m.medicationName || null,
    dosage: m.dosage || null,
    form: m.form || null,
    frequency: m.frequency || null,
    frequency_notes: m.frequencyNotes || null,
    prescribing_physician: m.prescribingPhysician || null,
    condition_treated: m.conditionTreated || null,
    pharmacy_index: m.pharmacyIndex,
    rx_number: m.rxNumber || null,
    refills_remaining: m.refillsRemaining ? parseInt(m.refillsRemaining, 10) : null,
    last_filled_date: m.lastFilledDate || null,
    start_date: m.startDate || null,
    end_date: m.endDate || null,
    is_active: m.isActive,
    ndc_number: m.ndcNumber || null,
    requires_refrigeration: m.requiresRefrigeration,
    controlled_substance: m.controlledSubstance,
    notes: m.notes || null,
  }));

  return deleteAndInsertRecords('folio_medications', intakeId, userId, records);
}

async function saveMedicalEquipment(
  equipment: FormData['medicalEquipment'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = equipment.map((e) => ({
    equipment_name: e.equipmentName || null,
    equipment_type: e.equipmentType || null,
    make_model: e.makeModel || null,
    serial_number: e.serialNumber || null,
    prescribing_physician: e.prescribingPhysician || null,
    supplier_name: e.supplierName || null,
    supplier_phone: e.supplierPhone || null,
    supplier_address: e.supplierAddress || null,
    supplier_website: e.supplierWebsite || null,
    date_obtained: e.dateObtained || null,
    warranty_expiration: e.warrantyExpiration || null,
    next_service_date: e.nextServiceDate || null,
    maintenance_notes: e.maintenanceNotes || null,
    battery_type: e.batteryType || null,
    insurance_covers: e.insuranceCovers,
    insurance_info: e.insuranceInfo || null,
    replacement_cost: e.replacementCost || null,
    is_active: e.isActive,
    notes: e.notes || null,
  }));

  return deleteAndInsertRecords('folio_medical_equipment', intakeId, userId, records);
}

async function saveMedicalConditions(
  conditions: FormData['medicalConditions'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = conditions.map((c) => ({
    condition_name: c.conditionName || null,
    diagnosed_date: c.diagnosedDate || null,
    treating_physician: c.treatingPhysician || null,
    status: c.status || null,
    notes: c.notes || null,
  }));

  return deleteAndInsertRecords('folio_medical_conditions', intakeId, userId, records);
}

async function saveAllergies(
  allergies: FormData['allergies'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = allergies.map((a) => ({
    allergen: a.allergen || null,
    allergy_type: a.allergyType || null,
    reaction: a.reaction || null,
    severity: a.severity || null,
  }));

  return deleteAndInsertRecords('folio_allergies', intakeId, userId, records);
}

async function saveSurgeries(
  surgeries: FormData['surgeries'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = surgeries.map((s) => ({
    procedure_name: s.procedureName || null,
    procedure_type: s.procedureType || null,
    procedure_date: s.procedureDate || null,
    facility: s.facility || null,
    surgeon_physician: s.surgeonPhysician || null,
    notes: s.notes || null,
  }));

  return deleteAndInsertRecords('folio_surgeries', intakeId, userId, records);
}

async function saveBasicVitals(
  vitals: FormData['basicVitals'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = vitals.bloodType || vitals.height || vitals.weight;
  if (!hasData) {
    await supabase.from('folio_basic_vitals').delete().eq('intake_id', intakeId);
    return { success: true };
  }

  const records = [{
    blood_type: vitals.bloodType || null,
    height: vitals.height || null,
    weight: vitals.weight || null,
    as_of_date: vitals.asOfDate || null,
  }];

  return deleteAndInsertRecords('folio_basic_vitals', intakeId, userId, records);
}

async function saveMedicalInsurance(
  policies: FormData['medicalInsurancePolicies'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = policies.map((p) => ({
    person: p.person || null,
    insurance_type: p.insuranceType || null,
    policy_no: p.policyNo || null,
    provider: p.provider || null,
    paid_by: p.paidBy || null,
    monthly_cost: parseDecimal(p.monthlyCost),
    contact_name: p.contactName || null,
    contact_address: p.contactAddress || null,
    contact_phone: p.contactPhone || null,
    contact_email: p.contactEmail || null,
    notes: p.notes || null,
  }));

  return deleteAndInsertRecords('folio_medical_insurance', intakeId, userId, records);
}

async function saveInsuranceCoverage(
  policies: FormData['insurancePolicies'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = policies.map((p) => ({
    person: p.person || null,
    coverage_type: p.coverageType || null,
    policy_no: p.policyNo || null,
    provider: p.provider || null,
    annual_cost: parseDecimal(p.annualCost),
    contact_name: p.contactName || null,
    contact_address: p.contactAddress || null,
    contact_phone: p.contactPhone || null,
    contact_email: p.contactEmail || null,
    notes: p.notes || null,
    // Vehicle-specific fields
    liability_limits: p.liabilityLimits || null,
    has_collision: p.hasCollision || false,
    has_comprehensive: p.hasComprehensive || false,
    comprehensive_deductible: parseDecimal(p.comprehensiveDeductible || ''),
    uninsured_amount: p.uninsuredAmount || null,
    underinsured_amount: p.underinsuredAmount || null,
    medical_payments_amount: p.medicalPaymentsAmount || null,
    has_rental_insurance: p.hasRentalInsurance || false,
    // Homeowner's-specific fields
    ho_policy_type: p.hoPolicyType || null,
    effective_date: p.effectiveDate || null,
    expiration_date: p.expirationDate || null,
    auto_renewal: p.autoRenewal || false,
    property_covered: p.propertyCovered || null,
    coverage_amounts: p.coverageAmounts || null,
    deductibles: p.deductibles || null,
    hurricane_wind_deductible: p.hurricaneWindDeductible || null,
    has_scheduled_personal_property: p.hasScheduledPersonalProperty || false,
    scheduled_personal_property_limit: p.scheduledPersonalPropertyLimit || null,
    has_fine_arts_rider: p.hasFineArtsRider || false,
    has_home_business_endorsement: p.hasHomeBusinessEndorsement || false,
    has_water_backup: p.hasWaterBackup || false,
    water_backup_limit: p.waterBackupLimit || null,
    has_service_line_coverage: p.hasServiceLineCoverage || false,
    has_equipment_breakdown: p.hasEquipmentBreakdown || false,
    has_identity_theft_coverage: p.hasIdentityTheftCoverage || false,
    // Long-Term Care-specific fields
    ltc_insured_name: p.ltcInsuredName || null,
    ltc_issue_date: p.ltcIssueDate || null,
    ltc_policy_status: p.ltcPolicyStatus || null,
    ltc_daily_benefit_amount: parseDecimal(p.ltcDailyBenefitAmount || ''),
    ltc_monthly_benefit_amount: parseDecimal(p.ltcMonthlyBenefitAmount || ''),
    ltc_benefit_period: p.ltcBenefitPeriod || null,
    ltc_max_lifetime_benefit_pool: parseDecimal(p.ltcMaxLifetimeBenefitPool || ''),
    ltc_inflation_protection_type: p.ltcInflationProtectionType || null,
    ltc_current_benefit_after_inflation: p.ltcCurrentBenefitAfterInflation || null,
    ltc_shared_care_rider: p.ltcSharedCareRider || false,
    ltc_elimination_period: p.ltcEliminationPeriod || null,
    ltc_covers_nursing_facility: p.ltcCoversNursingFacility || false,
    ltc_covers_assisted_living: p.ltcCoversAssistedLiving || false,
    ltc_covers_memory_care: p.ltcCoversMemoryCare || false,
    ltc_covers_adult_day_care: p.ltcCoversAdultDayCare || false,
    ltc_covers_home_health_care: p.ltcCoversHomeHealthCare || false,
    ltc_covers_hospice: p.ltcCoversHospice || false,
    ltc_covers_family_caregiver: p.ltcCoversFamilyCaregiver || false,
    ltc_has_bed_reservation: p.ltcHasBedReservation || false,
    ltc_bed_reservation_days: p.ltcBedReservationDays ? parseInt(p.ltcBedReservationDays) : null,
    ltc_annual_premium: parseDecimal(p.ltcAnnualPremium || ''),
    // Umbrella-specific fields
    umb_policy_type: p.umbPolicyType || null,
    umb_effective_date: p.umbEffectiveDate || null,
    umb_expiration_date: p.umbExpirationDate || null,
    umb_limit: p.umbLimit || null,
    umb_limit_other: p.umbLimitOther || null,
    umb_self_insured_retention: p.umbSelfInsuredRetention || null,
    umb_auto_liability_required: p.umbAutoLiabilityRequired || null,
    umb_homeowners_liability_required: p.umbHomeownersLiabilityRequired || null,
    umb_has_watercraft_required: p.umbHasWatercraftRequired || false,
    umb_watercraft_limit: p.umbWatercraftLimit || null,
    umb_has_rental_property_required: p.umbHasRentalPropertyRequired || false,
    umb_rental_property_limit: p.umbRentalPropertyLimit || null,
    umb_other_underlying_policies: p.umbOtherUnderlyingPolicies || null,
    umb_all_same_carrier: p.umbAllSameCarrier || false,
    umb_named_insured: p.umbNamedInsured || null,
    umb_additional_insureds: p.umbAdditionalInsureds || null,
    umb_annual_premium: parseDecimal(p.umbAnnualPremium || ''),
  }));

  return deleteAndInsertRecords('folio_insurance_coverage', intakeId, userId, records);
}

async function saveAdvisors(
  advisors: FormData['advisors'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = advisors.map((a) => ({
    advisor_type: a.advisorType || null,
    name: a.name || null,
    firm_name: a.firmName || null,
    phone: a.phone || null,
    email: a.email || null,
    address: a.address || null,
    notes: a.notes || null,
  }));

  return deleteAndInsertRecords('folio_advisors', intakeId, userId, records);
}

async function saveExpenses(
  expenses: FormData['expenses'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = expenses.map((e) => ({
    category: e.category || null,
    expense_type: e.expenseType || null,
    paid_to: e.paidTo || null,
    frequency: e.frequency || null,
    amount: parseDecimal(e.amount),
    notes: e.notes || null,
  }));

  return deleteAndInsertRecords('folio_expenses', intakeId, userId, records);
}

async function saveSubscriptions(
  subscriptions: FormData['subscriptions'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = subscriptions.map((s) => ({
    service_name: s.serviceName || null,
    category: s.category || null,
    frequency: s.frequency || null,
    amount: s.amount || null,
    payment_method: s.paymentMethod || null,
    account_holder: s.accountHolder || null,
    login_email: s.loginEmail || null,
    auto_renew: s.autoRenew,
    renewal_date: s.renewalDate || null,
    is_active: s.isActive,
    notes: s.notes || null,
  }));

  return deleteAndInsertRecords('folio_subscriptions', intakeId, userId, records);
}

async function saveDigitalSubscriptions(
  subscriptions: FormData['digitalSubscriptions'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = subscriptions.map((s) => ({
    service_name: s.serviceName || null,
    category: s.category || null,
    frequency: s.frequency || null,
    amount: s.amount || null,
    payment_method: s.paymentMethod || null,
    account_holder: s.accountHolder || null,
    login_email: s.loginEmail || null,
    auto_renew: s.autoRenew,
    renewal_date: s.renewalDate || null,
    is_active: s.isActive,
    notes: s.notes || null,
  }));

  return deleteAndInsertRecords('folio_digital_subscriptions', intakeId, userId, records);
}

// ============================================================================
// LEGACY SECTION SAVE FUNCTIONS
// ============================================================================

async function saveLegacyObituary(
  obit: FormData['legacyObituary'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = Object.values(obit).some((v) => typeof v === 'string' && v.trim());
  if (!hasData) {
    await supabase.from('legacy_obituary').delete().eq('intake_id', intakeId);
    return { success: true };
  }
  const records = [{
    // The Basics
    preferred_name: obit.preferredName || null,
    nicknames: obit.nicknames || null,
    date_of_birth: obit.dateOfBirth || null,
    place_of_birth: obit.placeOfBirth || null,
    date_of_death: obit.dateOfDeath || null,
    place_of_death: obit.placeOfDeath || null,
    // Life Story
    hometowns: obit.hometowns || null,
    religious_affiliation: obit.religiousAffiliation || null,
    military_service: obit.militaryService || null,
    education: obit.education || null,
    career_highlights: obit.careerHighlights || null,
    community_involvement: obit.communityInvolvement || null,
    awards_honors: obit.awardsHonors || null,
    // Family
    spouses: obit.spouses || null,
    children: obit.children || null,
    grandchildren: obit.grandchildren || null,
    siblings: obit.siblings || null,
    parents: obit.parents || null,
    others_to_mention: obit.othersToMention || null,
    preceded_in_death: obit.precededInDeath || null,
    // Your Voice
    tone: obit.tone || null,
    quotes_to_include: obit.quotesToInclude || null,
    what_to_remember: obit.whatToRemember || null,
    personal_message: obit.personalMessage || null,
    // Final Arrangements
    preferred_funeral_home: obit.preferredFuneralHome || null,
    burial_or_cremation: obit.burialOrCremation || null,
    service_preferences: obit.servicePreferences || null,
    charitable_donations: obit.charitableDonations || null,
  }];
  return deleteAndInsertRecords('legacy_obituary', intakeId, userId, records);
}

async function saveLegacyObituarySpouse(
  obit: FormData['legacyObituarySpouse'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = Object.values(obit).some((v) => typeof v === 'string' && v.trim());
  if (!hasData) {
    await supabase.from('legacy_obituary_spouse').delete().eq('intake_id', intakeId);
    return { success: true };
  }
  const records = [{
    preferred_name: obit.preferredName || null,
    nicknames: obit.nicknames || null,
    date_of_birth: obit.dateOfBirth || null,
    place_of_birth: obit.placeOfBirth || null,
    date_of_death: obit.dateOfDeath || null,
    place_of_death: obit.placeOfDeath || null,
    hometowns: obit.hometowns || null,
    religious_affiliation: obit.religiousAffiliation || null,
    military_service: obit.militaryService || null,
    education: obit.education || null,
    career_highlights: obit.careerHighlights || null,
    community_involvement: obit.communityInvolvement || null,
    awards_honors: obit.awardsHonors || null,
    spouses: obit.spouses || null,
    children: obit.children || null,
    grandchildren: obit.grandchildren || null,
    siblings: obit.siblings || null,
    parents: obit.parents || null,
    others_to_mention: obit.othersToMention || null,
    preceded_in_death: obit.precededInDeath || null,
    tone: obit.tone || null,
    quotes_to_include: obit.quotesToInclude || null,
    what_to_remember: obit.whatToRemember || null,
    personal_message: obit.personalMessage || null,
    preferred_funeral_home: obit.preferredFuneralHome || null,
    burial_or_cremation: obit.burialOrCremation || null,
    service_preferences: obit.servicePreferences || null,
    charitable_donations: obit.charitableDonations || null,
  }];
  return deleteAndInsertRecords('legacy_obituary_spouse', intakeId, userId, records);
}

async function saveLegacyCharityOrganizations(
  orgs: FormData['legacyCharityOrganizations'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = orgs.map((o) => ({
    organization_name: o.organizationName || null,
    website: o.website || null,
    contact_info: o.contactInfo || null,
    notes: o.notes || null,
  }));
  return deleteAndInsertRecords('legacy_charity_organizations', intakeId, userId, records);
}

async function saveLegacyCharityPreferences(
  prefs: FormData['legacyCharityPreferences'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = prefs.scholarshipFund || prefs.religiousDonations || prefs.legacyGivingNotes || prefs.whyTheseCauses || prefs.donationsInLieuOfFlowers;
  if (!hasData) {
    await supabase.from('legacy_charity_preferences').delete().eq('intake_id', intakeId);
    return { success: true };
  }
  const records = [{
    donations_in_lieu_of_flowers: prefs.donationsInLieuOfFlowers,
    scholarship_fund: prefs.scholarshipFund || null,
    religious_donations: prefs.religiousDonations || null,
    legacy_giving_notes: prefs.legacyGivingNotes || null,
    why_these_causes: prefs.whyTheseCauses || null,
  }];
  return deleteAndInsertRecords('legacy_charity_preferences', intakeId, userId, records);
}

async function saveLegacyLetters(
  letters: FormData['legacyLetters'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = letters.map((l) => ({
    recipient_type: l.recipientType || null,
    recipient_name: l.recipientName || null,
    subject: l.subject || null,
    letter_body: l.letterBody || null,
    format: l.format || null,
    media_url: l.mediaUrl || null,
    is_private: l.isPrivate,
  }));
  return deleteAndInsertRecords('legacy_letters', intakeId, userId, records);
}

async function saveLegacyPersonalHistory(
  hist: FormData['legacyPersonalHistory'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = Object.values(hist).some((v) => typeof v === 'string' && v.trim());
  if (!hasData) {
    await supabase.from('legacy_personal_history').delete().eq('intake_id', intakeId);
    return { success: true };
  }
  const records = [{
    birthplace: hist.birthplace || null,
    childhood_memories: hist.childhoodMemories || null,
    parents_background: hist.parentsBackground || null,
    schools_attended: hist.schoolsAttended || null,
    education_memories: hist.educationMemories || null,
    first_job: hist.firstJob || null,
    career_milestones: hist.careerMilestones || null,
    proudest_professional: hist.proudestProfessional || null,
    how_we_met: hist.howWeMet || null,
    wedding_story: hist.weddingStory || null,
    raising_children: hist.raisingChildren || null,
    important_decisions: hist.importantDecisions || null,
    biggest_challenges: hist.biggestChallenges || null,
    risks_taken: hist.risksTaken || null,
  }];
  return deleteAndInsertRecords('legacy_personal_history', intakeId, userId, records);
}

async function saveLegacyStories(
  stories: FormData['legacyStories'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = stories.map((s) => ({
    story_title: s.storyTitle || null,
    story_body: s.storyBody || null,
    people_involved: s.peopleInvolved || null,
    approximate_date: s.approximateDate || null,
    location: s.location || null,
    lessons_learned: s.lessonsLearned || null,
  }));
  return deleteAndInsertRecords('legacy_stories', intakeId, userId, records);
}

async function saveLegacyReflections(
  refl: FormData['legacyReflections'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = refl.whatMattersMost || refl.adviceToYounger || refl.coreBeliefs ||
    refl.greatestRegrets || refl.greatestJoys || refl.howRemembered ||
    (refl.personalValues && refl.personalValues.length > 0);
  if (!hasData) {
    await supabase.from('legacy_reflections').delete().eq('intake_id', intakeId);
    return { success: true };
  }
  const records = [{
    what_matters_most: refl.whatMattersMost || null,
    advice_to_younger: refl.adviceToYounger || null,
    core_beliefs: refl.coreBeliefs || null,
    greatest_regrets: refl.greatestRegrets || null,
    greatest_joys: refl.greatestJoys || null,
    how_remembered: refl.howRemembered || null,
    personal_values: refl.personalValues?.join(',') || null,
  }];
  return deleteAndInsertRecords('legacy_reflections', intakeId, userId, records);
}

async function saveLegacySurprises(
  surp: FormData['legacySurprises'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = Object.values(surp).some((v) => typeof v === 'string' && v.trim());
  if (!hasData) {
    await supabase.from('legacy_surprises').delete().eq('intake_id', intakeId);
    return { success: true };
  }
  const records = [{
    hidden_talents: surp.hiddenTalents || null,
    unusual_experiences: surp.unusualExperiences || null,
    fun_facts: surp.funFacts || null,
    adventures: surp.adventures || null,
    untold_stories: surp.untoldStories || null,
  }];
  return deleteAndInsertRecords('legacy_surprises', intakeId, userId, records);
}

async function saveLegacyFavorites(
  favs: FormData['legacyFavorites'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const hasData = Object.values(favs).some((v) => typeof v === 'string' && v.trim());
  if (!hasData) {
    await supabase.from('legacy_favorites').delete().eq('intake_id', intakeId);
    return { success: true };
  }
  const records = [{
    favorite_music: favs.favoriteMusic || null,
    favorite_books: favs.favoriteBooks || null,
    favorite_movies: favs.favoriteMovies || null,
    favorite_foods: favs.favoriteFoods || null,
    favorite_restaurants: favs.favoriteRestaurants || null,
    favorite_vacation_destinations: favs.favoriteVacationDestinations || null,
    favorite_quotes_sayings: favs.favoriteQuotesSayings || null,
    other_favorites: favs.otherFavorites || null,
  }];
  return deleteAndInsertRecords('legacy_favorites', intakeId, userId, records);
}

async function saveLegacyVideos(
  videos: FormData['legacyVideos'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = videos.map((v) => ({
    video_title: v.videoTitle || null,
    recording_date: v.recordingDate || null,
    description: v.description || null,
    cloud_link: v.cloudLink || null,
    is_private: v.isPrivate,
    transcript: v.transcript || null,
  }));
  return deleteAndInsertRecords('legacy_videos', intakeId, userId, records);
}

async function saveLegacyMemories(
  memories: FormData['legacyMemories'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = memories.map((m) => ({
    memory_title: m.memoryTitle || null,
    description: m.description || null,
    people_in_photo: m.peopleInPhoto || null,
    approximate_year: m.approximateYear || null,
    location: m.location || null,
    tags: m.tags || null,
    media_url: m.mediaUrl || null,
  }));
  return deleteAndInsertRecords('legacy_memories', intakeId, userId, records);
}

async function saveCarePreferences(
  carePreferences: FormData['carePreferences'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = carePreferences.map((p) => ({
    category: p.category || null,
    preference_item: p.preferenceItem || null,
    response: p.response || null,
    notes: p.notes || null,
  }));

  return deleteAndInsertRecords('folio_care_preferences', intakeId, userId, records);
}

async function saveEndOfLife(
  endOfLife: FormData['endOfLife'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = endOfLife.map((e) => ({
    category: e.category || null,
    field_data: Object.fromEntries(
      Object.entries(e).filter(([k]) => k !== 'category')
    ),
  }));

  return deleteAndInsertRecords('folio_end_of_life', intakeId, userId, records);
}

async function saveFriendsNeighbors(
  contacts: FormData['friendsNeighbors'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = contacts.map((c) => ({
    name: c.name || null,
    relationship: c.relationship || null,
    address: c.address || null,
    phone: c.phone || null,
    email: c.email || null,
    notes: c.notes || null,
  }));

  return deleteAndInsertRecords('folio_friends_neighbors', intakeId, userId, records);
}

async function saveSpecificGifts(
  gifts: FormData['specificGifts'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = gifts.map((g) => ({
    recipient_name: g.recipientName,
    relationship: g.relationship || null,
    description: g.description || null,
    notes: g.notes || null,
  }));

  return deleteAndInsertRecords('folio_specific_gifts', intakeId, userId, records);
}

async function saveCashGifts(
  gifts: FormData['cashGiftsToBeneficiaries'],
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  const records = gifts.map((g) => ({
    beneficiary_id: g.beneficiaryId || null,
    beneficiary_name: g.beneficiaryName,
    relationship: g.relationship || null,
    amount: g.amount || null,
  }));

  return deleteAndInsertRecords('folio_cash_gifts', intakeId, userId, records);
}

async function saveLongTermCare(
  formData: FormData,
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  // Delete existing records
  await supabase.from('folio_long_term_care').delete().eq('intake_id', intakeId);

  const records = [];

  // Client LTC
  if (formData.clientLongTermCare) {
    records.push({
      intake_id: intakeId,
      user_id: userId,
      person_type: 'client',
      ...mapLongTermCareData(formData.clientLongTermCare),
    });
  }

  // Spouse LTC (only if married)
  if (formData.spouseName && formData.spouseLongTermCare) {
    records.push({
      intake_id: intakeId,
      user_id: userId,
      person_type: 'spouse',
      ...mapLongTermCareData(formData.spouseLongTermCare),
    });
  }

  if (records.length === 0) {
    return { success: true };
  }

  const { error } = await supabase.from('folio_long_term_care').insert(records);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

function mapLongTermCareData(ltc: FormData['clientLongTermCare']) {
  return {
    primary_goals_concerns: ltc.primaryGoalsConcerns || null,
    ltc_concern_level: ltc.ltcConcernLevel || null,
    previously_met_with_advisor: ltc.previouslyMetWithAdvisor,
    advisor_meeting_details: ltc.advisorMeetingDetails || null,
    overall_health: ltc.overallHealth || null,
    diagnoses: ltc.diagnoses || [],
    diagnoses_other: ltc.diagnosesOther || null,
    recent_hospitalizations: ltc.recentHospitalizations,
    hospitalization_details: ltc.hospitalizationDetails || null,
    mobility_limitations: ltc.mobilityLimitations || [],
    adl_help: ltc.adlHelp || [],
    adl_assistance: ltc.adlAssistance || null,
    iadl_help: ltc.iadlHelp || [],
    has_dementia: ltc.hasDementia,
    dementia_stage: ltc.dementiaStage || null,
    family_history_of_conditions: ltc.familyHistoryOfConditions,
    family_history_details: ltc.familyHistoryDetails || null,
    current_living_situation: ltc.currentLivingSituation || null,
    living_other: ltc.livingOther || null,
    in_ltc_facility: ltc.inLtcFacility,
    current_care_level: ltc.currentCareLevel || null,
    facility_name: ltc.facilityName || null,
    facility_address: ltc.facilityAddress || null,
    facility_start_date: ltc.facilityStartDate || null,
    receives_home_help: ltc.receivesHomeHelp,
    home_help_providers: ltc.homeHelpProviders || [],
    hours_of_help_per_week: ltc.hoursOfHelpPerWeek || null,
    expect_care_increase: ltc.expectCareIncrease || null,
    care_increase_explanation: ltc.careIncreaseExplanation || null,
    likelihood_of_ltc_in_5_years: ltc.likelihoodOfLtcIn5Years || null,
    care_preference: ltc.carePreference || null,
    care_preference_other: ltc.carePreferenceOther || null,
    has_specific_provider: ltc.hasSpecificProvider,
    preferred_provider_details: ltc.preferredProviderDetails || null,
    home_supports_needed: ltc.homeSupportsNeeded || [],
    geographic_preferences: ltc.geographicPreferences || null,
    primary_caregivers: ltc.primaryCaregivers || [],
    caregivers_limited_ability: ltc.caregiversLimitedAbility,
    caregivers_limited_details: ltc.caregiversLimitedDetails || null,
    family_conflicts: ltc.familyConflicts || null,
    medicare_types: ltc.medicareTypes || [],
    has_medigap: ltc.hasMedigap,
    medigap_details: ltc.medigapDetails || null,
    has_ltc_insurance: ltc.hasLtcInsurance,
    ltc_insurance_details: ltc.ltcInsuranceDetails || null,
    ltc_insurance_company: ltc.ltcInsuranceCompany || null,
    ltc_insurance_daily_benefit: ltc.ltcInsuranceDailyBenefit || null,
    ltc_insurance_term: ltc.ltcInsuranceTerm || null,
    ltc_insurance_maximum: ltc.ltcInsuranceMaximum || null,
    ltc_insurance_care_level: ltc.ltcInsuranceCareLevel || null,
    current_benefits: ltc.currentBenefits || [],
    previous_medicaid_application: ltc.previousMedicaidApplication,
    medicaid_application_details: ltc.medicaidApplicationDetails || null,
    monthly_income: ltc.monthlyIncome || null,
    made_gifts_over_5_years: ltc.madeGiftsOver5Years,
    gifts_details: ltc.giftsDetails || null,
    expecting_windfall: ltc.expectingWindfall,
    windfall_details: ltc.windfallDetails || null,
    care_setting_importance: ltc.careSettingImportance || null,
    end_of_life_preferences: ltc.endOfLifePreferences || null,
    important_therapies_activities: ltc.importantTherapiesActivities || null,
  };
}

async function saveCurrentEstatePlan(
  formData: FormData,
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  // Delete existing records
  await supabase.from('folio_current_estate_plan').delete().eq('intake_id', intakeId);

  const records = [];

  // Client current estate plan
  if (formData.clientCurrentEstatePlan) {
    records.push({
      intake_id: intakeId,
      user_id: userId,
      person_type: 'client',
      ...mapCurrentEstatePlanData(formData.clientCurrentEstatePlan),
    });
  }

  // Spouse current estate plan (only if married)
  if (formData.spouseName && formData.spouseCurrentEstatePlan) {
    records.push({
      intake_id: intakeId,
      user_id: userId,
      person_type: 'spouse',
      ...mapCurrentEstatePlanData(formData.spouseCurrentEstatePlan),
    });
  }

  if (records.length === 0) {
    return { success: true };
  }

  const { error } = await supabase.from('folio_current_estate_plan').insert(records);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

function mapCurrentEstatePlanData(cep: FormData['clientCurrentEstatePlan']) {
  return {
    has_will: cep.hasWill,
    has_trust: cep.hasTrust,
    is_joint_trust: cep.isJointTrust,
    has_irrevocable_trust: cep.hasIrrevocableTrust,
    is_joint_irrevocable_trust: cep.isJointIrrevocableTrust,
    has_financial_poa: cep.hasFinancialPOA,
    has_health_care_poa: cep.hasHealthCarePOA,
    has_living_will: cep.hasLivingWill,
    has_none: cep.hasNone,
    will_date_signed: cep.willDateSigned || null,
    will_state_signed: cep.willStateSigned || null,
    will_storage_location: cep.willStorageLocation || null,
    will_storage_location_other: cep.willStorageLocationOther || null,
    will_storage_notes: cep.willStorageNotes || null,
    will_attorney_name: cep.willAttorneyName || null,
    will_attorney_firm: cep.willAttorneyFirm || null,
    will_attorney_email: cep.willAttorneyEmail || null,
    will_attorney_phone: cep.willAttorneyPhone || null,
    will_attorney_address: cep.willAttorneyAddress || null,
    trust_storage_location: cep.trustStorageLocation || null,
    trust_storage_location_other: cep.trustStorageLocationOther || null,
    trust_storage_notes: cep.trustStorageNotes || null,
    trust_attorney_name: cep.trustAttorneyName || null,
    trust_attorney_firm: cep.trustAttorneyFirm || null,
    trust_attorney_email: cep.trustAttorneyEmail || null,
    trust_attorney_phone: cep.trustAttorneyPhone || null,
    trust_attorney_address: cep.trustAttorneyAddress || null,
    irrevocable_trust_storage_location: cep.irrevocableTrustStorageLocation || null,
    irrevocable_trust_storage_location_other: cep.irrevocableTrustStorageLocationOther || null,
    irrevocable_trust_storage_notes: cep.irrevocableTrustStorageNotes || null,
    irrevocable_trust_attorney_name: cep.irrevocableTrustAttorneyName || null,
    irrevocable_trust_attorney_firm: cep.irrevocableTrustAttorneyFirm || null,
    irrevocable_trust_attorney_email: cep.irrevocableTrustAttorneyEmail || null,
    irrevocable_trust_attorney_phone: cep.irrevocableTrustAttorneyPhone || null,
    irrevocable_trust_attorney_address: cep.irrevocableTrustAttorneyAddress || null,
    financial_poa_storage_location: cep.financialPOAStorageLocation || null,
    financial_poa_storage_location_other: cep.financialPOAStorageLocationOther || null,
    financial_poa_storage_notes: cep.financialPOAStorageNotes || null,
    financial_poa_attorney_name: cep.financialPOAAttorneyName || null,
    financial_poa_attorney_firm: cep.financialPOAAttorneyFirm || null,
    financial_poa_attorney_email: cep.financialPOAAttorneyEmail || null,
    financial_poa_attorney_phone: cep.financialPOAAttorneyPhone || null,
    financial_poa_attorney_address: cep.financialPOAAttorneyAddress || null,
    health_care_poa_storage_location: cep.healthCarePOAStorageLocation || null,
    health_care_poa_storage_location_other: cep.healthCarePOAStorageLocationOther || null,
    health_care_poa_storage_notes: cep.healthCarePOAStorageNotes || null,
    health_care_poa_attorney_name: cep.healthCarePOAAttorneyName || null,
    health_care_poa_attorney_firm: cep.healthCarePOAAttorneyFirm || null,
    health_care_poa_attorney_email: cep.healthCarePOAAttorneyEmail || null,
    health_care_poa_attorney_phone: cep.healthCarePOAAttorneyPhone || null,
    health_care_poa_attorney_address: cep.healthCarePOAAttorneyAddress || null,
    living_will_storage_location: cep.livingWillStorageLocation || null,
    living_will_storage_location_other: cep.livingWillStorageLocationOther || null,
    living_will_storage_notes: cep.livingWillStorageNotes || null,
    living_will_attorney_name: cep.livingWillAttorneyName || null,
    living_will_attorney_firm: cep.livingWillAttorneyFirm || null,
    living_will_attorney_email: cep.livingWillAttorneyEmail || null,
    living_will_attorney_phone: cep.livingWillAttorneyPhone || null,
    living_will_attorney_address: cep.livingWillAttorneyAddress || null,
    trust_date_signed: cep.trustDateSigned || null,
    trust_state_signed: cep.trustStateSigned || null,
    trust_name: cep.trustName || null,
    trust_state_resided: cep.trustStateResided || null,
    irrevocable_trust_name: cep.irrevocableTrustName || null,
    irrevocable_trust_date_signed: cep.irrevocableTrustDateSigned || null,
    irrevocable_trust_state_resided: cep.irrevocableTrustStateResided || null,
    irrevocable_trust_reason: cep.irrevocableTrustReason || null,
    financial_poa_date_signed: cep.financialPOADateSigned || null,
    financial_poa_state_signed: cep.financialPOAStateSigned || null,
    health_care_poa_date_signed: cep.healthCarePOADateSigned || null,
    health_care_poa_state_signed: cep.healthCarePOAStateSigned || null,
    living_will_date_signed: cep.livingWillDateSigned || null,
    living_will_state_signed: cep.livingWillStateSigned || null,
    document_state: cep.documentState || null,
    document_date: cep.documentDate || null,
    review_option: cep.reviewOption || null,
    uploaded_files: cep.uploadedFiles || [],
    will_uploaded_files: cep.willUploadedFiles || [],
    trust_uploaded_files: cep.trustUploadedFiles || [],
    irrevocable_trust_uploaded_files: cep.irrevocableTrustUploadedFiles || [],
    financial_poa_uploaded_files: cep.financialPOAUploadedFiles || [],
    health_care_poa_uploaded_files: cep.healthCarePOAUploadedFiles || [],
    living_will_uploaded_files: cep.livingWillUploadedFiles || [],
    will_personal_rep: cep.willPersonalRep || null,
    will_personal_rep_alternate1: cep.willPersonalRepAlternate1 || null,
    will_personal_rep_alternate2: cep.willPersonalRepAlternate2 || null,
    will_primary_beneficiary: cep.willPrimaryBeneficiary || null,
    will_secondary_beneficiaries: cep.willSecondaryBeneficiaries || null,
    trust_trustee: cep.trustTrustee || null,
    trust_trustee_alternate1: cep.trustTrusteeAlternate1 || null,
    trust_trustee_alternate2: cep.trustTrusteeAlternate2 || null,
    trust_primary_beneficiary: cep.trustPrimaryBeneficiary || null,
    trust_secondary_beneficiaries: cep.trustSecondaryBeneficiaries || null,
    financial_poa_agent1: cep.financialPOAAgent1 || null,
    financial_poa_agent2: cep.financialPOAAgent2 || null,
    financial_poa_agent3: cep.financialPOAAgent3 || null,
    health_care_poa_agent1: cep.healthCarePOAAgent1 || null,
    health_care_poa_agent2: cep.healthCarePOAAgent2 || null,
    health_care_poa_agent3: cep.healthCarePOAAgent3 || null,
    is_hipaa_compliant: cep.isHIPAACompliant,
    has_dnr_order: cep.hasDNROrder,
    has_living_will_document: cep.hasLivingWillDocument,
    will_specific_real_estate_gifts: cep.willSpecificRealEstateGifts || [],
    will_specific_asset_gifts: cep.willSpecificAssetGifts || [],
    will_general_money_gifts: cep.willGeneralMoneyGifts || [],
    trust_specific_real_estate_gifts: cep.trustSpecificRealEstateGifts || [],
    trust_specific_asset_gifts: cep.trustSpecificAssetGifts || [],
    trust_general_money_gifts: cep.trustGeneralMoneyGifts || [],
    comments: cep.comments || null,
  };
}

async function saveDistributionPlans(
  formData: FormData,
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  // Delete existing records
  await supabase.from('folio_distribution_plans').delete().eq('intake_id', intakeId);

  const records = [];

  // Client distribution plan
  if (formData.clientDistributionPlan) {
    records.push({
      intake_id: intakeId,
      user_id: userId,
      person_type: 'client',
      distribution_type: formData.clientDistributionPlan.distributionType || null,
      is_sweetheart_plan: formData.clientDistributionPlan.isSweetheartPlan,
      has_specific_gifts: formData.clientDistributionPlan.hasSpecificGifts,
      specific_asset_gifts: formData.clientDistributionPlan.specificAssetGifts || [],
      cash_gifts: formData.clientDistributionPlan.cashGifts || [],
      residuary_beneficiaries: formData.clientDistributionPlan.residuaryBeneficiaries || [],
      residuary_share_type: formData.clientDistributionPlan.residuaryShareType || 'equal',
      notes: formData.clientDistributionPlan.notes || null,
    });
  }

  // Spouse distribution plan (only if married)
  if (formData.spouseName && formData.spouseDistributionPlan) {
    records.push({
      intake_id: intakeId,
      user_id: userId,
      person_type: 'spouse',
      distribution_type: formData.spouseDistributionPlan.distributionType || null,
      is_sweetheart_plan: formData.spouseDistributionPlan.isSweetheartPlan,
      has_specific_gifts: formData.spouseDistributionPlan.hasSpecificGifts,
      specific_asset_gifts: formData.spouseDistributionPlan.specificAssetGifts || [],
      cash_gifts: formData.spouseDistributionPlan.cashGifts || [],
      residuary_beneficiaries: formData.spouseDistributionPlan.residuaryBeneficiaries || [],
      residuary_share_type: formData.spouseDistributionPlan.residuaryShareType || 'equal',
      notes: formData.spouseDistributionPlan.notes || null,
    });
  }

  if (records.length === 0) {
    return { success: true };
  }

  const { error } = await supabase.from('folio_distribution_plans').insert(records);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// FULL SAVE FUNCTION (SAVES TO BOTH RAW AND NORMALIZED)
// ============================================================================

/**
 * Save form data to both raw JSON and normalized tables
 */
export async function saveIntakeFull(
  formData: FormData,
  intakeType: IntakeType = 'EstatePlanning',
  existingRawId?: string,
  existingIntakeId?: string
): Promise<SaveIntakeResult> {
  // First save to raw table
  const rawResult = await saveIntakeRaw(formData, intakeType, existingRawId);
  if (!rawResult.success) {
    return rawResult;
  }

  // Then save to normalized tables
  const normalizedResult = await saveIntakeNormalized(
    formData,
    existingIntakeId,
    rawResult.intakeRawId
  );

  return {
    success: normalizedResult.success,
    intakeRawId: rawResult.intakeRawId,
    intakeId: normalizedResult.intakeId,
    error: normalizedResult.error,
  };
}

// ============================================================================
// LOAD FUNCTIONS
// ============================================================================

/**
 * Load a complete intake from the raw JSON table
 * This is the recommended way to load data as it preserves the exact structure
 */
export async function loadIntakeFromRaw(id: string, skipDecryption = false): Promise<FormData | null> {
  const intake = await getIntakeRaw(id, skipDecryption);
  if (!intake) return null;
  return intake.form_data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDateForDb(date: Date | null): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function parseDecimal(value: string | undefined | null): number | null {
  if (!value) return null;
  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// Fields that contain Date objects
const DATE_FIELDS = [
  'birthDate',
  'spouseBirthDate',
  'clientLivingTrustDate',
  'clientIrrevocableTrustDate',
  'spouseLivingTrustDate',
  'spouseIrrevocableTrustDate',
  'dateMarried',
];

function serializeFormDataForJson(data: FormData): Record<string, unknown> {
  const serialized = { ...data } as Record<string, unknown>;
  DATE_FIELDS.forEach((field) => {
    const value = serialized[field];
    if (value instanceof Date && !isNaN(value.getTime())) {
      serialized[field] = value.toISOString();
    } else if (value instanceof Date) {
      serialized[field] = null;
    }
  });
  return serialized;
}

function deserializeFormDataFromJson(data: Record<string, unknown>): FormData {
  DATE_FIELDS.forEach((field) => {
    const value = data[field];
    if (typeof value === 'string' && value) {
      data[field] = new Date(value);
    }
  });
  return data as unknown as FormData;
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search intakes by client or spouse name
 */
export async function searchIntakes(
  searchTerm: string,
  intakeType?: IntakeType
): Promise<IntakeListItem[]> {
  try {
    let query = supabase
      .from('intakes_raw')
      .select('id, client_name, spouse_name, intake_type, created_at, updated_at')
      .or(`client_name.ilike.%${searchTerm}%,spouse_name.ilike.%${searchTerm}%`)
      .order('updated_at', { ascending: false });

    if (intakeType) {
      query = query.eq('intake_type', intakeType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching intakes:', error);
      return [];
    }

    return data as IntakeListItem[];
  } catch (err) {
    console.error('Error in searchIntakes:', err);
    return [];
  }
}

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

export interface CleanupResult {
  success: boolean;
  deletedRawCount: number;
  deletedIntakeCount: number;
  keptRecords: { userId: string; rawId: string; intakeId: string | null }[];
  error?: string;
}

/**
 * Clean up duplicate intake records, keeping only the most recent one per user.
 * This function will:
 * 1. Find all unique users with intake records
 * 2. For each user, keep only the most recently updated record
 * 3. Delete all older duplicate records
 *
 * WARNING: This permanently deletes data. Use with caution.
 *
 * @param dryRun - If true, only report what would be deleted without actually deleting
 */
export async function cleanupDuplicateIntakes(dryRun = true): Promise<CleanupResult> {
  try {
    const result: CleanupResult = {
      success: true,
      deletedRawCount: 0,
      deletedIntakeCount: 0,
      keptRecords: [],
    };

    // Step 1: Get all raw intake records grouped by user
    const { data: allRawIntakes, error: rawError } = await supabase
      .from('intakes_raw')
      .select('id, user_id, updated_at')
      .eq('intake_type', 'EstatePlanning')
      .order('updated_at', { ascending: false });

    if (rawError) {
      return { ...result, success: false, error: rawError.message };
    }

    if (!allRawIntakes || allRawIntakes.length === 0) {
      console.log('No intake records found');
      return result;
    }

    // Group by user_id
    const userIntakesMap = new Map<string, typeof allRawIntakes>();
    for (const intake of allRawIntakes) {
      const existing = userIntakesMap.get(intake.user_id) || [];
      existing.push(intake);
      userIntakesMap.set(intake.user_id, existing);
    }

    console.log(`Found ${userIntakesMap.size} unique users with intake records`);

    // Step 2: For each user, identify duplicates to delete
    const rawIdsToDelete: string[] = [];

    for (const [userId, intakes] of userIntakesMap) {
      if (intakes.length > 1) {
        // Keep the first one (most recent due to ordering), delete the rest
        const keepId = intakes[0].id;
        const deleteIds = intakes.slice(1).map(i => i.id);

        rawIdsToDelete.push(...deleteIds);

        console.log(`User ${userId}: keeping ${keepId}, deleting ${deleteIds.length} duplicates`);
      }

      // Track which record we're keeping
      result.keptRecords.push({
        userId,
        rawId: intakes[0].id,
        intakeId: null, // Will be filled below
      });
    }

    // Step 3: Get corresponding normalized intake records
    const { data: allNormalizedIntakes, error: normalizedError } = await supabase
      .from('folio_intakes')
      .select('id, user_id, updated_at')
      .order('updated_at', { ascending: false });

    if (normalizedError) {
      console.warn('Error fetching normalized intakes:', normalizedError.message);
    }

    const normalizedIdsToDelete: string[] = [];

    if (allNormalizedIntakes) {
      // Group by user_id
      const userNormalizedMap = new Map<string, typeof allNormalizedIntakes>();
      for (const intake of allNormalizedIntakes) {
        const existing = userNormalizedMap.get(intake.user_id) || [];
        existing.push(intake);
        userNormalizedMap.set(intake.user_id, existing);
      }

      for (const [userId, intakes] of userNormalizedMap) {
        if (intakes.length > 1) {
          // Keep the first one (most recent), delete the rest
          const deleteIds = intakes.slice(1).map(i => i.id);
          normalizedIdsToDelete.push(...deleteIds);

          console.log(`User ${userId} (normalized): keeping ${intakes[0].id}, deleting ${deleteIds.length} duplicates`);
        }

        // Update kept record with intake ID
        const keptRecord = result.keptRecords.find(r => r.userId === userId);
        if (keptRecord) {
          keptRecord.intakeId = intakes[0].id;
        }
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Raw records to delete: ${rawIdsToDelete.length}`);
    console.log(`- Normalized records to delete: ${normalizedIdsToDelete.length}`);
    console.log(`- Records to keep: ${result.keptRecords.length}`);

    if (dryRun) {
      console.log('\n[DRY RUN] No records were deleted. Set dryRun=false to actually delete.');
      result.deletedRawCount = rawIdsToDelete.length;
      result.deletedIntakeCount = normalizedIdsToDelete.length;
      return result;
    }

    // Step 4: Delete duplicates (if not dry run)
    if (rawIdsToDelete.length > 0) {
      const { error: deleteRawError } = await supabase
        .from('intakes_raw')
        .delete()
        .in('id', rawIdsToDelete);

      if (deleteRawError) {
        console.error('Error deleting raw intakes:', deleteRawError);
        return { ...result, success: false, error: deleteRawError.message };
      }
      result.deletedRawCount = rawIdsToDelete.length;
      console.log(`Deleted ${rawIdsToDelete.length} raw intake records`);
    }

    if (normalizedIdsToDelete.length > 0) {
      const { error: deleteNormalizedError } = await supabase
        .from('folio_intakes')
        .delete()
        .in('id', normalizedIdsToDelete);

      if (deleteNormalizedError) {
        console.error('Error deleting normalized intakes:', deleteNormalizedError);
        return { ...result, success: false, error: deleteNormalizedError.message };
      }
      result.deletedIntakeCount = normalizedIdsToDelete.length;
      console.log(`Deleted ${normalizedIdsToDelete.length} normalized intake records`);
    }

    console.log('\nCleanup completed successfully!');
    return result;

  } catch (err) {
    console.error('Error in cleanupDuplicateIntakes:', err);
    return {
      success: false,
      deletedRawCount: 0,
      deletedIntakeCount: 0,
      keptRecords: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
