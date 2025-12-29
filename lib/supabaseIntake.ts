/**
 * Supabase Intake CRUD Functions
 *
 * This module provides functions for saving and retrieving estate planning intake data
 * from Supabase. It supports both raw JSON storage and normalized table storage.
 */

import { supabase } from './supabase';
import { FormData } from './FormContext';

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
    const jsonFormData = serializeFormDataForJson(formData);

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
 */
export async function getIntakeRaw(id: string): Promise<IntakeRawRecord | null> {
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

    // Parse the form_data back to FormData type
    return {
      ...data,
      form_data: deserializeFormDataFromJson(data.form_data),
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
      specificGiftsResult,
      cashGiftsResult,
      ltcResult,
      cepResult,
      distPlansResult,
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
      saveSpecificGifts(formData.specificGifts, intakeId, user.id),
      saveCashGifts(formData.cashGiftsToBeneficiaries, intakeId, user.id),
      saveLongTermCare(formData, intakeId, user.id),
      saveCurrentEstatePlan(formData, intakeId, user.id),
      saveDistributionPlans(formData, intakeId, user.id),
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
      specificGiftsResult,
      cashGiftsResult,
      ltcResult,
      cepResult,
      distPlansResult,
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
      .from('estate_planning_intakes')
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
      .from('estate_planning_intakes')
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

  return deleteAndInsertRecords('estate_planning_children', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_beneficiaries', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_charities', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_dependents', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_real_estate', intakeId, userId, records);
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
    has_beneficiaries: ba.hasBeneficiaries,
    primary_beneficiaries: ba.primaryBeneficiaries || [],
    primary_distribution_type: ba.primaryDistributionType || null,
    secondary_beneficiaries: ba.secondaryBeneficiaries || [],
    secondary_distribution_type: ba.secondaryDistributionType || null,
    notes: ba.notes || null,
  }));

  return deleteAndInsertRecords('estate_planning_bank_accounts', intakeId, userId, records);
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
    has_beneficiaries: inv.hasBeneficiaries,
    primary_beneficiaries: inv.primaryBeneficiaries || [],
    primary_distribution_type: inv.primaryDistributionType || null,
    secondary_beneficiaries: inv.secondaryBeneficiaries || [],
    secondary_distribution_type: inv.secondaryDistributionType || null,
    notes: inv.notes || null,
  }));

  return deleteAndInsertRecords('estate_planning_investments', intakeId, userId, records);
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
    has_beneficiaries: acc.hasBeneficiaries,
    primary_beneficiaries: acc.primaryBeneficiaries || [],
    primary_distribution_type: acc.primaryDistributionType || null,
    secondary_beneficiaries: acc.secondaryBeneficiaries || [],
    secondary_distribution_type: acc.secondaryDistributionType || null,
    notes: acc.notes || null,
  }));

  return deleteAndInsertRecords('estate_planning_retirement_accounts', intakeId, userId, records);
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
    has_beneficiaries: pol.hasBeneficiaries,
    primary_beneficiaries: pol.primaryBeneficiaries || [],
    primary_distribution_type: pol.primaryDistributionType || null,
    secondary_beneficiaries: pol.secondaryBeneficiaries || [],
    secondary_distribution_type: pol.secondaryDistributionType || null,
    notes: pol.notes || null,
  }));

  return deleteAndInsertRecords('estate_planning_life_insurance', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_vehicles', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_other_assets', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_business_interests', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_digital_assets', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_specific_gifts', intakeId, userId, records);
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

  return deleteAndInsertRecords('estate_planning_cash_gifts', intakeId, userId, records);
}

async function saveLongTermCare(
  formData: FormData,
  intakeId: string,
  userId: string
): Promise<SaveResult> {
  // Delete existing records
  await supabase.from('estate_planning_long_term_care').delete().eq('intake_id', intakeId);

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

  const { error } = await supabase.from('estate_planning_long_term_care').insert(records);

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
  await supabase.from('estate_planning_current_estate_plan').delete().eq('intake_id', intakeId);

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

  const { error } = await supabase.from('estate_planning_current_estate_plan').insert(records);

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
  await supabase.from('estate_planning_distribution_plans').delete().eq('intake_id', intakeId);

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

  const { error } = await supabase.from('estate_planning_distribution_plans').insert(records);

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
export async function loadIntakeFromRaw(id: string): Promise<FormData | null> {
  const intake = await getIntakeRaw(id);
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
