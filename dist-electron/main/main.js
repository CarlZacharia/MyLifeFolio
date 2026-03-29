"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const pdfLib = require("pdf-lib");
const is = {
  dev: !electron.app.isPackaged
};
({
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
});
const CURRENT_VERSION = 1;
function runMigrations(db2) {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS _schema_version (
      version INTEGER NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  const row = db2.prepare("SELECT MAX(version) as version FROM _schema_version").get();
  const currentVersion = row?.version ?? 0;
  if (currentVersion < CURRENT_VERSION) {
    db2.transaction(() => {
      if (currentVersion < 1) migration_001(db2);
      db2.prepare("INSERT INTO _schema_version (version) VALUES (?)").run(CURRENT_VERSION);
    })();
  }
}
function migration_001(db2) {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT,
      preferred_name TEXT,
      phone TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      date_of_birth TEXT,
      avatar_url TEXT,
      onboarding_completed INTEGER DEFAULT 0,
      spouse_name TEXT,
      gender TEXT,
      marital_status TEXT DEFAULT 'single',
      spouse_full_name TEXT,
      spouse_date_of_birth TEXT,
      spouse_phone TEXT,
      spouse_email TEXT,
      spouse_gender TEXT,
      vault_instructions TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_system_role INTEGER DEFAULT 0,
      role_type TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(owner_id, name)
    );

    CREATE TABLE IF NOT EXISTS persons (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      relationship TEXT,
      notes TEXT,
      is_emergency_contact INTEGER DEFAULT 0,
      emergency_override INTEGER DEFAULT 0,
      has_user_account INTEGER DEFAULT 0,
      user_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS person_roles (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(person_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(owner_id, slug)
    );

    CREATE TABLE IF NOT EXISTS category_role_access (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(category_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS folio_items (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      item_type TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      is_sensitive INTEGER DEFAULT 0,
      use_custom_access INTEGER DEFAULT 0,
      belongs_to TEXT DEFAULT 'self',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS item_role_access (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(item_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS file_attachments (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      storage_path TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT DEFAULT '{}',
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      phone TEXT,
      email TEXT,
      notes TEXT,
      parent_relationship TEXT DEFAULT 'both',
      sort_order INTEGER DEFAULT 0,
      distribution_method TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS intakes_raw (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      intake_type TEXT DEFAULT 'EstatePlanning',
      form_data TEXT NOT NULL,
      client_name TEXT,
      spouse_name TEXT,
      claude_analysis TEXT,
      claude_analysis_tokens TEXT,
      analysis_generated_at TEXT,
      storage_folder TEXT,
      uploaded_files TEXT DEFAULT '[]',
      report_files TEXT DEFAULT '[]',
      office_id TEXT,
      attorney_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_intakes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      intake_raw_id TEXT,
      intake_date TEXT,
      appointment_date TEXT,
      client_name TEXT NOT NULL,
      client_aka TEXT,
      client_sex TEXT,
      client_birth_date TEXT,
      client_mailing_address TEXT,
      client_state_of_domicile TEXT,
      client_looking_to_change_domicile INTEGER DEFAULT 0,
      client_new_domicile_state TEXT,
      client_cell_phone TEXT,
      client_home_phone TEXT,
      client_work_phone TEXT,
      client_email TEXT,
      client_served_military INTEGER DEFAULT 0,
      client_military_branch TEXT,
      client_military_start_date TEXT,
      client_military_end_date TEXT,
      client_has_prepaid_funeral INTEGER DEFAULT 0,
      client_prepaid_funeral_details TEXT,
      client_preferred_funeral_home TEXT,
      client_burial_or_cremation TEXT,
      client_preferred_church TEXT,
      client_has_living_trust INTEGER DEFAULT 0,
      client_living_trust_name TEXT,
      client_living_trust_date TEXT,
      client_has_irrevocable_trust INTEGER DEFAULT 0,
      client_irrevocable_trust_name TEXT,
      client_irrevocable_trust_date TEXT,
      client_considering_trust INTEGER DEFAULT 0,
      marital_status TEXT,
      date_married TEXT,
      place_of_marriage TEXT,
      prior_marriage INTEGER DEFAULT 0,
      children_from_prior_marriage INTEGER DEFAULT 0,
      number_of_children INTEGER DEFAULT 0,
      client_has_children_from_prior INTEGER DEFAULT 0,
      client_children_from_prior INTEGER DEFAULT 0,
      children_together INTEGER DEFAULT 0,
      spouse_name TEXT,
      spouse_aka TEXT,
      spouse_sex TEXT,
      spouse_birth_date TEXT,
      spouse_mailing_address TEXT,
      spouse_cell_phone TEXT,
      spouse_home_phone TEXT,
      spouse_work_phone TEXT,
      spouse_email TEXT,
      spouse_has_children_from_prior INTEGER DEFAULT 0,
      spouse_children_from_prior INTEGER DEFAULT 0,
      spouse_served_military INTEGER DEFAULT 0,
      spouse_military_branch TEXT,
      spouse_military_start_date TEXT,
      spouse_military_end_date TEXT,
      spouse_has_prepaid_funeral INTEGER DEFAULT 0,
      spouse_prepaid_funeral_details TEXT,
      spouse_preferred_funeral_home TEXT,
      spouse_burial_or_cremation TEXT,
      spouse_preferred_church TEXT,
      spouse_has_living_trust INTEGER DEFAULT 0,
      spouse_living_trust_name TEXT,
      spouse_living_trust_date TEXT,
      spouse_has_irrevocable_trust INTEGER DEFAULT 0,
      spouse_irrevocable_trust_name TEXT,
      spouse_irrevocable_trust_date TEXT,
      spouse_considering_trust INTEGER DEFAULT 0,
      any_beneficiaries_minors INTEGER DEFAULT 0,
      beneficiary_minors_explanation TEXT,
      any_beneficiaries_disabled INTEGER DEFAULT 0,
      beneficiary_disabled_explanation TEXT,
      any_beneficiaries_marital_problems INTEGER DEFAULT 0,
      beneficiary_marital_problems_explanation TEXT,
      any_beneficiaries_receiving_ssi INTEGER DEFAULT 0,
      beneficiary_ssi_explanation TEXT,
      any_beneficiary_drug_addiction INTEGER DEFAULT 0,
      beneficiary_drug_addiction_explanation TEXT,
      any_beneficiary_alcoholism INTEGER DEFAULT 0,
      beneficiary_alcoholism_explanation TEXT,
      any_beneficiary_financial_problems INTEGER DEFAULT 0,
      beneficiary_financial_problems_explanation TEXT,
      has_other_beneficiary_concerns INTEGER DEFAULT 0,
      beneficiary_other_concerns TEXT,
      beneficiary_notes TEXT,
      provide_for_spouse_then_children INTEGER DEFAULT 1,
      treat_all_children_equally INTEGER DEFAULT 1,
      include_client_stepchildren_in_spouse_will INTEGER DEFAULT 0,
      include_spouse_stepchildren_in_client_will INTEGER DEFAULT 0,
      children_equality_explanation TEXT,
      distribution_age TEXT,
      children_predeceased_beneficiaries INTEGER DEFAULT 1,
      leave_to_grandchildren INTEGER DEFAULT 0,
      treat_all_grandchildren_equally INTEGER DEFAULT 1,
      grandchildren_equality_explanation TEXT,
      grandchildren_amount TEXT,
      grandchildren_distribution_age TEXT,
      has_specific_devises INTEGER DEFAULT 0,
      specific_devises_description TEXT,
      has_general_bequests INTEGER DEFAULT 0,
      general_bequests_description TEXT,
      cash_bequest_timing TEXT DEFAULT 'atSurvivorDeath',
      dispositive_intentions_comments TEXT,
      leave_to_charity INTEGER DEFAULT 0,
      mirror_distribution_plans INTEGER DEFAULT 0,
      executor_first TEXT,
      executor_first_other TEXT,
      executor_alternate TEXT,
      executor_alternate_other TEXT,
      executor_second_alternate TEXT,
      executor_second_alternate_other TEXT,
      trustee_first TEXT,
      trustee_first_other TEXT,
      trustee_alternate TEXT,
      trustee_alternate_other TEXT,
      trustee_second_alternate TEXT,
      trustee_second_alternate_other TEXT,
      guardian_first TEXT,
      guardian_first_other TEXT,
      guardian_alternate TEXT,
      guardian_alternate_other TEXT,
      spouse_executor_first TEXT,
      spouse_executor_first_other TEXT,
      spouse_executor_alternate TEXT,
      spouse_executor_alternate_other TEXT,
      spouse_executor_second_alternate TEXT,
      spouse_executor_second_alternate_other TEXT,
      spouse_trustee_first TEXT,
      spouse_trustee_first_other TEXT,
      spouse_trustee_alternate TEXT,
      spouse_trustee_alternate_other TEXT,
      spouse_trustee_second_alternate TEXT,
      spouse_trustee_second_alternate_other TEXT,
      spouse_guardian_first TEXT,
      spouse_guardian_first_other TEXT,
      spouse_guardian_alternate TEXT,
      spouse_guardian_alternate_other TEXT,
      health_care_agent_name TEXT,
      health_care_agent_name_other TEXT,
      health_care_alternate_name TEXT,
      health_care_alternate_name_other TEXT,
      health_care_second_alternate_name TEXT,
      health_care_second_alternate_name_other TEXT,
      withdraw_artificial_food_fluid INTEGER DEFAULT 0,
      spouse_health_care_agent_name TEXT,
      spouse_health_care_agent_name_other TEXT,
      spouse_health_care_alternate_name TEXT,
      spouse_health_care_alternate_name_other TEXT,
      spouse_health_care_second_alternate_name TEXT,
      spouse_health_care_second_alternate_name_other TEXT,
      spouse_withdraw_artificial_food_fluid INTEGER DEFAULT 0,
      financial_agent_name TEXT,
      financial_agent_name_other TEXT,
      financial_alternate_name TEXT,
      financial_alternate_name_other TEXT,
      financial_second_alternate_name TEXT,
      financial_second_alternate_name_other TEXT,
      spouse_financial_agent_name TEXT,
      spouse_financial_agent_name_other TEXT,
      spouse_financial_alternate_name TEXT,
      spouse_financial_alternate_name_other TEXT,
      spouse_financial_second_alternate_name TEXT,
      spouse_financial_second_alternate_name_other TEXT,
      legal_issues TEXT,
      spouse_legal_issues TEXT,
      important_papers_location TEXT,
      has_safe_deposit_box INTEGER DEFAULT 0,
      safe_deposit_box_bank TEXT,
      safe_deposit_box_number TEXT,
      safe_deposit_box_location TEXT,
      safe_deposit_box_access TEXT,
      safe_deposit_box_contents TEXT,
      additional_comments TEXT,
      client_notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_children (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      birth_date TEXT,
      age TEXT,
      relationship TEXT,
      marital_status TEXT,
      has_children INTEGER DEFAULT 0,
      number_of_children INTEGER DEFAULT 0,
      has_minor_children INTEGER DEFAULT 0,
      distribution_type TEXT,
      disinherit INTEGER DEFAULT 0,
      comments TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_beneficiaries (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      relationship TEXT,
      relationship_other TEXT,
      age TEXT,
      distribution_type TEXT,
      distribution_method TEXT DEFAULT '',
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_charities (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      amount TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_dependents (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_real_estate (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      ownership_form TEXT,
      category TEXT,
      show_beneficiaries INTEGER DEFAULT 0,
      show_other INTEGER DEFAULT 0,
      joint_owner_beneficiaries TEXT,
      joint_owner_other TEXT,
      street TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      value REAL,
      mortgage_balance REAL,
      cost_basis REAL,
      primary_beneficiaries TEXT,
      remainder_interest_other TEXT,
      client_ownership_percentage TEXT,
      spouse_ownership_percentage TEXT,
      client_spouse_joint_type TEXT,
      client_spouse_combined_percentage TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_bank_accounts (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      account_type TEXT,
      institution TEXT,
      amount REAL,
      has_beneficiaries INTEGER DEFAULT 0,
      primary_beneficiaries TEXT,
      primary_distribution_type TEXT,
      secondary_beneficiaries TEXT,
      secondary_distribution_type TEXT,
      has_tod INTEGER DEFAULT 0,
      tod_primary_beneficiary TEXT,
      tod_secondary_beneficiary TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_investments (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      institution TEXT,
      description TEXT,
      value REAL,
      has_beneficiaries INTEGER DEFAULT 0,
      primary_beneficiaries TEXT,
      primary_distribution_type TEXT,
      secondary_beneficiaries TEXT,
      secondary_distribution_type TEXT,
      has_tod INTEGER DEFAULT 0,
      tod_primary_beneficiary TEXT,
      tod_secondary_beneficiary TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_retirement_accounts (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      institution TEXT,
      account_type TEXT,
      value REAL,
      has_beneficiaries INTEGER DEFAULT 0,
      primary_beneficiaries TEXT,
      primary_distribution_type TEXT,
      secondary_beneficiaries TEXT,
      secondary_distribution_type TEXT,
      has_tod INTEGER DEFAULT 0,
      tod_primary_beneficiary TEXT,
      tod_secondary_beneficiary TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_life_insurance (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      company TEXT,
      policy_type TEXT,
      face_amount REAL,
      death_benefit REAL,
      cash_value REAL,
      insured TEXT,
      has_beneficiaries INTEGER DEFAULT 0,
      primary_beneficiaries TEXT,
      primary_distribution_type TEXT,
      secondary_beneficiaries TEXT,
      secondary_distribution_type TEXT,
      primary_beneficiary TEXT,
      secondary_beneficiary TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_vehicles (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      year_make_model TEXT,
      value REAL,
      has_beneficiaries INTEGER DEFAULT 0,
      primary_beneficiaries TEXT,
      primary_distribution_type TEXT,
      secondary_beneficiaries TEXT,
      secondary_distribution_type TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_other_assets (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      description TEXT,
      value REAL,
      has_beneficiaries INTEGER DEFAULT 0,
      primary_beneficiaries TEXT,
      primary_distribution_type TEXT,
      secondary_beneficiaries TEXT,
      secondary_distribution_type TEXT,
      add_to_personal_property_memo INTEGER DEFAULT 0,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_business_interests (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      business_name TEXT,
      entity_type TEXT,
      ownership_percentage TEXT,
      full_value REAL,
      co_owners TEXT,
      has_buy_sell_agreement INTEGER DEFAULT 0,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_digital_assets (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner TEXT,
      asset_type TEXT,
      platform TEXT,
      description TEXT,
      value REAL,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_specific_gifts (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      relationship TEXT,
      description TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_cash_gifts (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      beneficiary_id TEXT,
      beneficiary_name TEXT NOT NULL,
      relationship TEXT,
      amount TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_long_term_care (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      person_type TEXT NOT NULL,
      primary_goals_concerns TEXT,
      ltc_concern_level TEXT,
      previously_met_with_advisor INTEGER DEFAULT 0,
      advisor_meeting_details TEXT,
      overall_health TEXT,
      diagnoses TEXT,
      diagnoses_other TEXT,
      recent_hospitalizations INTEGER DEFAULT 0,
      hospitalization_details TEXT,
      mobility_limitations TEXT,
      adl_help TEXT,
      adl_assistance TEXT,
      iadl_help TEXT,
      has_dementia INTEGER DEFAULT 0,
      dementia_stage TEXT,
      family_history_of_conditions INTEGER DEFAULT 0,
      family_history_details TEXT,
      current_living_situation TEXT,
      living_other TEXT,
      in_ltc_facility INTEGER DEFAULT 0,
      current_care_level TEXT,
      facility_name TEXT,
      facility_address TEXT,
      facility_start_date TEXT,
      receives_home_help INTEGER DEFAULT 0,
      home_help_providers TEXT,
      hours_of_help_per_week TEXT,
      expect_care_increase TEXT,
      care_increase_explanation TEXT,
      likelihood_of_ltc_in_5_years TEXT,
      care_preference TEXT,
      care_preference_other TEXT,
      has_specific_provider INTEGER DEFAULT 0,
      preferred_provider_details TEXT,
      home_supports_needed TEXT,
      geographic_preferences TEXT,
      primary_caregivers TEXT,
      caregivers_limited_ability INTEGER DEFAULT 0,
      caregivers_limited_details TEXT,
      family_conflicts TEXT,
      medicare_types TEXT,
      has_medigap INTEGER DEFAULT 0,
      medigap_details TEXT,
      has_ltc_insurance INTEGER DEFAULT 0,
      ltc_insurance_details TEXT,
      ltc_insurance_company TEXT,
      ltc_insurance_daily_benefit TEXT,
      ltc_insurance_term TEXT,
      ltc_insurance_maximum TEXT,
      ltc_insurance_care_level TEXT,
      current_benefits TEXT,
      previous_medicaid_application INTEGER DEFAULT 0,
      medicaid_application_details TEXT,
      monthly_income TEXT,
      made_gifts_over_5_years INTEGER DEFAULT 0,
      gifts_details TEXT,
      expecting_windfall INTEGER DEFAULT 0,
      windfall_details TEXT,
      care_setting_importance TEXT,
      end_of_life_preferences TEXT,
      important_therapies_activities TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(intake_id, person_type)
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_current_estate_plan (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      person_type TEXT NOT NULL,
      has_will INTEGER DEFAULT 0,
      has_trust INTEGER DEFAULT 0,
      is_joint_trust INTEGER DEFAULT 0,
      has_irrevocable_trust INTEGER DEFAULT 0,
      is_joint_irrevocable_trust INTEGER DEFAULT 0,
      has_financial_poa INTEGER DEFAULT 0,
      has_health_care_poa INTEGER DEFAULT 0,
      has_living_will INTEGER DEFAULT 0,
      has_none INTEGER DEFAULT 0,
      will_date_signed TEXT,
      will_state_signed TEXT,
      trust_date_signed TEXT,
      trust_state_signed TEXT,
      trust_name TEXT,
      trust_state_resided TEXT,
      irrevocable_trust_name TEXT,
      irrevocable_trust_date_signed TEXT,
      irrevocable_trust_state_resided TEXT,
      irrevocable_trust_reason TEXT,
      financial_poa_date_signed TEXT,
      financial_poa_state_signed TEXT,
      health_care_poa_date_signed TEXT,
      health_care_poa_state_signed TEXT,
      living_will_date_signed TEXT,
      living_will_state_signed TEXT,
      document_state TEXT,
      document_date TEXT,
      review_option TEXT,
      uploaded_files TEXT,
      will_uploaded_files TEXT,
      trust_uploaded_files TEXT,
      irrevocable_trust_uploaded_files TEXT,
      financial_poa_uploaded_files TEXT,
      health_care_poa_uploaded_files TEXT,
      living_will_uploaded_files TEXT,
      will_personal_rep TEXT,
      will_personal_rep_alternate1 TEXT,
      will_personal_rep_alternate2 TEXT,
      will_primary_beneficiary TEXT,
      will_secondary_beneficiaries TEXT,
      trust_trustee TEXT,
      trust_trustee_alternate1 TEXT,
      trust_trustee_alternate2 TEXT,
      trust_primary_beneficiary TEXT,
      trust_secondary_beneficiaries TEXT,
      financial_poa_agent1 TEXT,
      financial_poa_agent2 TEXT,
      financial_poa_agent3 TEXT,
      health_care_poa_agent1 TEXT,
      health_care_poa_agent2 TEXT,
      health_care_poa_agent3 TEXT,
      is_hipaa_compliant INTEGER DEFAULT 0,
      has_dnr_order INTEGER DEFAULT 0,
      has_living_will_document INTEGER DEFAULT 0,
      will_specific_real_estate_gifts TEXT,
      will_specific_asset_gifts TEXT,
      will_general_money_gifts TEXT,
      trust_specific_real_estate_gifts TEXT,
      trust_specific_asset_gifts TEXT,
      trust_general_money_gifts TEXT,
      comments TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(intake_id, person_type)
    );

    CREATE TABLE IF NOT EXISTS folio_distribution_plans (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      person_type TEXT NOT NULL,
      distribution_type TEXT,
      is_sweetheart_plan INTEGER DEFAULT 1,
      has_specific_gifts INTEGER DEFAULT 0,
      specific_asset_gifts TEXT,
      cash_gifts TEXT,
      residuary_beneficiaries TEXT,
      residuary_share_type TEXT DEFAULT 'equal',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(intake_id, person_type)
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS offices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      telephone TEXT,
      fax TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attorneys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      primary_office_id TEXT,
      clio_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_client_income (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      description TEXT DEFAULT '',
      amount TEXT DEFAULT '',
      frequency TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_spouse_income (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      description TEXT DEFAULT '',
      amount TEXT DEFAULT '',
      frequency TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_client_medical_insurance (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      medicare_part_b_deduction TEXT DEFAULT '',
      medicare_coverage_type TEXT DEFAULT '',
      medicare_plan_name TEXT DEFAULT '',
      medicare_coverage_cost TEXT DEFAULT '',
      private_insurance_description TEXT DEFAULT '',
      private_insurance_cost TEXT DEFAULT '',
      other_insurance_description TEXT DEFAULT '',
      other_insurance_cost TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_spouse_medical_insurance (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      medicare_part_b_deduction TEXT DEFAULT '',
      medicare_coverage_type TEXT DEFAULT '',
      medicare_plan_name TEXT DEFAULT '',
      medicare_coverage_cost TEXT DEFAULT '',
      private_insurance_description TEXT DEFAULT '',
      private_insurance_cost TEXT DEFAULT '',
      other_insurance_description TEXT DEFAULT '',
      other_insurance_cost TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ira_rmds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      age INTEGER NOT NULL UNIQUE,
      distribution_period REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_advisors (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      advisor_type TEXT,
      name TEXT,
      firm_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_friends_neighbors (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT,
      relationship TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_medical_providers (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      provider_category TEXT NOT NULL,
      specialist_type TEXT,
      name TEXT,
      firm_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_care_preferences (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      preference_item TEXT NOT NULL,
      response TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_end_of_life (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      field_data TEXT DEFAULT '{}',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_expenses (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      expense_type TEXT NOT NULL,
      paid_to TEXT,
      frequency TEXT,
      amount REAL,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_insurance_coverage (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      person TEXT NOT NULL,
      coverage_type TEXT NOT NULL,
      policy_no TEXT,
      provider TEXT,
      annual_cost REAL,
      contact_name TEXT,
      contact_address TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      notes TEXT,
      liability_limits TEXT,
      has_collision INTEGER DEFAULT 0,
      has_comprehensive INTEGER DEFAULT 0,
      comprehensive_deductible REAL,
      uninsured_amount TEXT,
      underinsured_amount TEXT,
      medical_payments_amount TEXT,
      has_rental_insurance INTEGER DEFAULT 0,
      ho_policy_type TEXT,
      effective_date TEXT,
      expiration_date TEXT,
      auto_renewal INTEGER DEFAULT 0,
      property_covered TEXT,
      coverage_amounts TEXT,
      deductibles TEXT,
      hurricane_wind_deductible TEXT,
      has_scheduled_personal_property INTEGER DEFAULT 0,
      scheduled_personal_property_limit TEXT,
      has_fine_arts_rider INTEGER DEFAULT 0,
      has_home_business_endorsement INTEGER DEFAULT 0,
      has_water_backup INTEGER DEFAULT 0,
      water_backup_limit TEXT,
      has_service_line_coverage INTEGER DEFAULT 0,
      has_equipment_breakdown INTEGER DEFAULT 0,
      has_identity_theft_coverage INTEGER DEFAULT 0,
      ltc_insured_name TEXT,
      ltc_issue_date TEXT,
      ltc_policy_status TEXT,
      ltc_daily_benefit_amount REAL,
      ltc_monthly_benefit_amount REAL,
      ltc_benefit_period TEXT,
      ltc_max_lifetime_benefit_pool REAL,
      ltc_inflation_protection_type TEXT,
      ltc_current_benefit_after_inflation TEXT,
      ltc_shared_care_rider INTEGER DEFAULT 0,
      ltc_elimination_period TEXT,
      ltc_covers_nursing_facility INTEGER DEFAULT 0,
      ltc_covers_assisted_living INTEGER DEFAULT 0,
      ltc_covers_memory_care INTEGER DEFAULT 0,
      ltc_covers_adult_day_care INTEGER DEFAULT 0,
      ltc_covers_home_health_care INTEGER DEFAULT 0,
      ltc_covers_hospice INTEGER DEFAULT 0,
      ltc_covers_family_caregiver INTEGER DEFAULT 0,
      ltc_has_bed_reservation INTEGER DEFAULT 0,
      ltc_bed_reservation_days INTEGER,
      ltc_annual_premium REAL,
      umb_policy_type TEXT,
      umb_effective_date TEXT,
      umb_expiration_date TEXT,
      umb_limit TEXT,
      umb_limit_other TEXT,
      umb_self_insured_retention TEXT,
      umb_auto_liability_required TEXT,
      umb_homeowners_liability_required TEXT,
      umb_has_watercraft_required INTEGER DEFAULT 0,
      umb_watercraft_limit TEXT,
      umb_has_rental_property_required INTEGER DEFAULT 0,
      umb_rental_property_limit TEXT,
      umb_other_underlying_policies TEXT,
      umb_all_same_carrier INTEGER DEFAULT 0,
      umb_named_insured TEXT,
      umb_additional_insureds TEXT,
      umb_annual_premium REAL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_medical_insurance (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      person TEXT NOT NULL,
      insurance_type TEXT,
      policy_no TEXT,
      provider TEXT,
      paid_by TEXT,
      monthly_cost REAL,
      contact_name TEXT,
      contact_address TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      contact_website TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_authorized_users (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      authorized_email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      access_sections TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      vault_instructions TEXT DEFAULT '',
      allowed_reports TEXT DEFAULT '[]',
      allowed_custom_reports TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(owner_id, authorized_email)
    );

    CREATE TABLE IF NOT EXISTS folio_access_log (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      accessor_email TEXT NOT NULL,
      accessor_name TEXT NOT NULL,
      access_type TEXT NOT NULL,
      query_text TEXT,
      report_name TEXT,
      sections_queried TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_documents (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      description TEXT DEFAULT '',
      visible_to TEXT DEFAULT '[]',
      uploaded_at TEXT DEFAULT (datetime('now')),
      storage_bucket TEXT DEFAULT 'folio-documents',
      source_vault_document_id TEXT
    );

    CREATE TABLE IF NOT EXISTS vault_documents (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      document_name TEXT NOT NULL,
      description TEXT,
      document_date TEXT,
      expiration_date TEXT,
      sensitivity TEXT DEFAULT 'normal',
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      file_type TEXT DEFAULT '',
      system_generated INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS legacy_obituary (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      preferred_name TEXT,
      nicknames TEXT,
      date_of_birth TEXT,
      place_of_birth TEXT,
      date_of_death TEXT,
      place_of_death TEXT,
      hometowns TEXT,
      religious_affiliation TEXT,
      military_service TEXT,
      education TEXT,
      career_highlights TEXT,
      community_involvement TEXT,
      awards_honors TEXT,
      spouses TEXT,
      children TEXT,
      grandchildren TEXT,
      siblings TEXT,
      parents TEXT,
      others_to_mention TEXT,
      preceded_in_death TEXT,
      tone TEXT,
      quotes_to_include TEXT,
      what_to_remember TEXT,
      personal_message TEXT,
      preferred_funeral_home TEXT,
      burial_or_cremation TEXT,
      service_preferences TEXT,
      charitable_donations TEXT,
      sort_order INTEGER DEFAULT 0,
      generation_count INTEGER DEFAULT 0,
      last_generated_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_obituary_spouse (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      preferred_name TEXT,
      nicknames TEXT,
      date_of_birth TEXT,
      place_of_birth TEXT,
      date_of_death TEXT,
      place_of_death TEXT,
      hometowns TEXT,
      religious_affiliation TEXT,
      military_service TEXT,
      education TEXT,
      career_highlights TEXT,
      community_involvement TEXT,
      awards_honors TEXT,
      spouses TEXT,
      children TEXT,
      grandchildren TEXT,
      siblings TEXT,
      parents TEXT,
      others_to_mention TEXT,
      preceded_in_death TEXT,
      tone TEXT,
      quotes_to_include TEXT,
      what_to_remember TEXT,
      personal_message TEXT,
      preferred_funeral_home TEXT,
      burial_or_cremation TEXT,
      service_preferences TEXT,
      charitable_donations TEXT,
      sort_order INTEGER DEFAULT 0,
      generation_count INTEGER DEFAULT 0,
      last_generated_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_obituary_drafts (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      draft_text TEXT NOT NULL,
      tone TEXT,
      person_name TEXT,
      generation_number INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_charity_organizations (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      organization_name TEXT NOT NULL,
      website TEXT,
      contact_info TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_charity_preferences (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      donations_in_lieu_of_flowers INTEGER DEFAULT 0,
      scholarship_fund TEXT,
      religious_donations TEXT,
      legacy_giving_notes TEXT,
      why_these_causes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_letters (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      recipient_type TEXT,
      recipient_name TEXT,
      letter_body TEXT,
      format TEXT,
      media_url TEXT,
      is_private INTEGER DEFAULT 0,
      subject TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_personal_history (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      birthplace TEXT,
      childhood_memories TEXT,
      parents_background TEXT,
      schools_attended TEXT,
      education_memories TEXT,
      first_job TEXT,
      career_milestones TEXT,
      proudest_professional TEXT,
      how_we_met TEXT,
      wedding_story TEXT,
      raising_children TEXT,
      important_decisions TEXT,
      biggest_challenges TEXT,
      risks_taken TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS legacy_stories (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      story_title TEXT NOT NULL,
      story_body TEXT,
      people_involved TEXT,
      approximate_date TEXT,
      location TEXT,
      lessons_learned TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_reflections (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      what_matters_most TEXT,
      advice_to_younger TEXT,
      core_beliefs TEXT,
      greatest_regrets TEXT,
      greatest_joys TEXT,
      how_remembered TEXT,
      personal_values TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_surprises (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      hidden_talents TEXT,
      unusual_experiences TEXT,
      fun_facts TEXT,
      adventures TEXT,
      untold_stories TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_favorites (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      favorite_music TEXT,
      favorite_books TEXT,
      favorite_movies TEXT,
      favorite_foods TEXT,
      favorite_restaurants TEXT,
      favorite_vacation_destinations TEXT,
      favorite_quotes_sayings TEXT,
      other_favorites TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_videos (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      video_title TEXT NOT NULL,
      recording_date TEXT,
      description TEXT,
      cloud_link TEXT,
      is_private INTEGER DEFAULT 0,
      transcript TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_memories (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      memory_title TEXT NOT NULL,
      description TEXT,
      people_in_photo TEXT,
      approximate_year TEXT,
      location TEXT,
      tags TEXT,
      media_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_medical_conditions (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      condition_name TEXT NOT NULL,
      diagnosed_date TEXT,
      treating_physician TEXT,
      status TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_allergies (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      allergen TEXT NOT NULL,
      allergy_type TEXT,
      reaction TEXT,
      severity TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_surgeries (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      procedure_name TEXT NOT NULL,
      procedure_type TEXT,
      procedure_date TEXT,
      facility TEXT,
      surgeon_physician TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_basic_vitals (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      blood_type TEXT,
      height TEXT,
      weight TEXT,
      as_of_date TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_pharmacies (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      pharmacy_name TEXT NOT NULL,
      pharmacy_chain TEXT,
      phone TEXT,
      fax TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      hours TEXT,
      pharmacist_name TEXT,
      account_number TEXT,
      specialty INTEGER DEFAULT 0,
      mail_order INTEGER DEFAULT 0,
      notes TEXT,
      is_primary INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_medications (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT,
      form TEXT,
      frequency TEXT,
      frequency_notes TEXT,
      prescribing_physician TEXT,
      condition_treated TEXT,
      pharmacy_index INTEGER,
      rx_number TEXT,
      refills_remaining INTEGER,
      last_filled_date TEXT,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER DEFAULT 1,
      ndc_number TEXT,
      requires_refrigeration INTEGER DEFAULT 0,
      controlled_substance INTEGER DEFAULT 0,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_medical_equipment (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      equipment_name TEXT NOT NULL,
      equipment_type TEXT,
      make_model TEXT,
      serial_number TEXT,
      prescribing_physician TEXT,
      supplier_name TEXT,
      supplier_phone TEXT,
      supplier_address TEXT,
      supplier_website TEXT,
      date_obtained TEXT,
      warranty_expiration TEXT,
      next_service_date TEXT,
      maintenance_notes TEXT,
      battery_type TEXT,
      insurance_covers INTEGER DEFAULT 0,
      insurance_info TEXT,
      replacement_cost TEXT,
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS folio_subscriptions (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      category TEXT,
      frequency TEXT,
      amount TEXT,
      payment_method TEXT,
      account_holder TEXT,
      login_email TEXT,
      auto_renew INTEGER DEFAULT 1,
      renewal_date TEXT,
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folio_digital_subscriptions (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      category TEXT,
      frequency TEXT,
      amount TEXT,
      payment_method TEXT,
      account_holder TEXT,
      login_email TEXT,
      auto_renew INTEGER DEFAULT 1,
      renewal_date TEXT,
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS credential_vault_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      salt TEXT NOT NULL,
      recovery_key_ciphertext TEXT NOT NULL,
      vault_enabled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS credential_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_nickname TEXT,
      account_type TEXT,
      platform_name TEXT NOT NULL,
      account_url TEXT,
      login_email TEXT,
      two_factor_enabled INTEGER DEFAULT 0,
      two_factor_method TEXT,
      phone_on_account TEXT,
      on_death_action TEXT,
      on_incapacity_action TEXT,
      special_notes TEXT,
      poa_can_access INTEGER DEFAULT 0,
      executor_can_access INTEGER DEFAULT 0,
      importance_tier TEXT DEFAULT 'moderate',
      linked_payment_method TEXT,
      last_verified_at TEXT,
      enc_password TEXT,
      enc_pin TEXT,
      enc_security_qa TEXT,
      enc_backup_codes TEXT,
      enc_authenticator_note TEXT,
      enc_recovery_email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      tier TEXT DEFAULT 'trial',
      status TEXT DEFAULT 'active',
      trial_started_at TEXT,
      trial_ends_at TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      stripe_price_id TEXT,
      current_period_start TEXT,
      current_period_end TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_report_configs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      config TEXT DEFAULT '{}',
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      created_by TEXT,
      invited_email TEXT,
      plan_type TEXT NOT NULL,
      trial_months INTEGER DEFAULT 12,
      used_at TEXT,
      used_by TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS signup_attempts (
      id TEXT PRIMARY KEY,
      ip_address TEXT NOT NULL,
      email TEXT,
      attempted_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scheduled_emails (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email_type TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_at TEXT,
      error TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS physical_document_locations (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_item TEXT NOT NULL,
      sub_item_ref_table TEXT,
      sub_item_ref_id TEXT,
      location TEXT DEFAULT '',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legacy_entries (
      id TEXT PRIMARY KEY,
      intake_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      content TEXT DEFAULT '{}',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Local tracking of published reports (cloud metadata cached locally)
    CREATE TABLE IF NOT EXISTS published_reports (
      id TEXT PRIMARY KEY,
      report_type TEXT NOT NULL UNIQUE,
      report_label TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      published_at TEXT NOT NULL,
      access_list TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
let db = null;
function openDatabase() {
  if (db) return db;
  const userDataPath = electron.app.getPath("userData");
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  const dbPath = path.join(userDataPath, "mylifefolio.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  runMigrations(db);
  return db;
}
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
function getDb() {
  return db;
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  closeDatabase,
  getDb,
  openDatabase
}, Symbol.toStringTag, { value: "Module" }));
function safeName(name) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}
function buildWhereClause(filters) {
  if (!filters || filters.length === 0) return { sql: "", params: [] };
  const clauses = [];
  const params = [];
  for (const f of filters) {
    const col = safeName(f.column);
    switch (f.op) {
      case "eq":
        clauses.push(`${col} = ?`);
        params.push(f.value);
        break;
      case "neq":
        clauses.push(`${col} != ?`);
        params.push(f.value);
        break;
      case "gt":
        clauses.push(`${col} > ?`);
        params.push(f.value);
        break;
      case "gte":
        clauses.push(`${col} >= ?`);
        params.push(f.value);
        break;
      case "lt":
        clauses.push(`${col} < ?`);
        params.push(f.value);
        break;
      case "lte":
        clauses.push(`${col} <= ?`);
        params.push(f.value);
        break;
      case "like":
        clauses.push(`${col} LIKE ?`);
        params.push(f.value);
        break;
      case "ilike":
        clauses.push(`LOWER(${col}) LIKE ?`);
        params.push(String(f.value).toLowerCase());
        break;
      case "in": {
        const arr = f.value;
        if (arr.length === 0) {
          clauses.push("1 = 0");
        } else {
          const placeholders = arr.map(() => "?").join(", ");
          clauses.push(`${col} IN (${placeholders})`);
          params.push(...arr);
        }
        break;
      }
      case "is":
        if (f.value === null) {
          clauses.push(`${col} IS NULL`);
        } else {
          clauses.push(`${col} = ?`);
          params.push(f.value);
        }
        break;
    }
  }
  return { sql: ` WHERE ${clauses.join(" AND ")}`, params };
}
function buildOrderClause(orders) {
  if (!orders || orders.length === 0) return "";
  const parts = orders.map((o) => `${safeName(o.column)} ${o.ascending ? "ASC" : "DESC"}`);
  return ` ORDER BY ${parts.join(", ")}`;
}
function executeQuery(db2, table, params) {
  const tableName = safeName(table);
  try {
    switch (params.method) {
      case "select": {
        const columns = params.columns === "*" ? "*" : params.columns.split(",").map((c) => safeName(c.trim())).join(", ");
        const where = buildWhereClause(params.filters || []);
        const order = buildOrderClause(params.orders || []);
        const limit = params.limit ? ` LIMIT ${Number(params.limit)}` : "";
        const sql = `SELECT ${columns} FROM ${tableName}${where.sql}${order}${limit}`;
        const stmt = db2.prepare(sql);
        if (params.single) {
          const row = stmt.get(...where.params);
          if (!row) {
            return { data: null, error: { message: `No rows found in ${tableName}` } };
          }
          return { data: parseRow(row), error: null };
        }
        const rows = stmt.all(...where.params);
        return { data: rows.map(parseRow), error: null };
      }
      case "insert": {
        const rows = Array.isArray(params.body) ? params.body : [params.body];
        const results = [];
        for (const row of rows) {
          const data = row;
          if (!data.id) data.id = crypto.randomUUID();
          const now = (/* @__PURE__ */ new Date()).toISOString();
          if (!data.created_at) data.created_at = now;
          if (!data.updated_at) data.updated_at = now;
          const processedData = serializeRow(data);
          const cols = Object.keys(processedData).map(safeName);
          const placeholders = cols.map(() => "?").join(", ");
          const sql = `INSERT INTO ${tableName} (${cols.join(", ")}) VALUES (${placeholders})`;
          db2.prepare(sql).run(...Object.values(processedData));
          if (params.returning) {
            const inserted = db2.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(data.id);
            if (inserted) results.push(parseRow(inserted));
          }
        }
        if (params.returning) {
          return {
            data: params.single || !Array.isArray(params.body) ? results[0] ?? null : results,
            error: null
          };
        }
        return { data: null, error: null };
      }
      case "update": {
        const data = serializeRow(params.body);
        if (!data.updated_at) data.updated_at = (/* @__PURE__ */ new Date()).toISOString();
        const setClauses = Object.keys(data).map((k) => `${safeName(k)} = ?`);
        const setValues = Object.values(data);
        const where = buildWhereClause(params.filters || []);
        const sql = `UPDATE ${tableName} SET ${setClauses.join(", ")}${where.sql}`;
        db2.prepare(sql).run(...setValues, ...where.params);
        if (params.returning) {
          const selectSql = `SELECT * FROM ${tableName}${where.sql}`;
          const rows = db2.prepare(selectSql).all(...where.params);
          const parsed = rows.map(parseRow);
          return { data: params.single ? parsed[0] ?? null : parsed, error: null };
        }
        return { data: null, error: null };
      }
      case "delete": {
        const where = buildWhereClause(params.filters || []);
        const sql = `DELETE FROM ${tableName}${where.sql}`;
        db2.prepare(sql).run(...where.params);
        return { data: null, error: null };
      }
      case "upsert": {
        const rows = Array.isArray(params.body) ? params.body : [params.body];
        const results = [];
        for (const row of rows) {
          const data = row;
          if (!data.id) data.id = crypto.randomUUID();
          const now = (/* @__PURE__ */ new Date()).toISOString();
          if (!data.created_at) data.created_at = now;
          if (!data.updated_at) data.updated_at = now;
          const processedData = serializeRow(data);
          const cols = Object.keys(processedData).map(safeName);
          const placeholders = cols.map(() => "?").join(", ");
          const updateCols = cols.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`);
          let conflictTarget = "id";
          if (params.onConflict) {
            conflictTarget = params.onConflict.split(",").map((c) => safeName(c.trim())).join(", ");
          }
          const sql = `INSERT INTO ${tableName} (${cols.join(", ")}) VALUES (${placeholders})
            ON CONFLICT(${conflictTarget}) DO UPDATE SET ${updateCols.join(", ")}`;
          db2.prepare(sql).run(...Object.values(processedData));
          if (params.returning) {
            const inserted = db2.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(data.id);
            if (inserted) results.push(parseRow(inserted));
          }
        }
        if (params.returning) {
          return {
            data: params.single || !Array.isArray(params.body) ? results[0] ?? null : results,
            error: null
          };
        }
        return { data: null, error: null };
      }
      default:
        return { data: null, error: { message: `Unknown method: ${params.method}` } };
    }
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}
function serializeRow(data) {
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === void 0) continue;
    if (value !== null && typeof value === "object" && !(value instanceof Date)) {
      result[key] = JSON.stringify(value);
    } else if (typeof value === "boolean") {
      result[key] = value ? 1 : 0;
    } else {
      result[key] = value;
    }
  }
  return result;
}
function parseRow(row) {
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "string") {
      if (value.startsWith("[") && value.endsWith("]") || value.startsWith("{") && value.endsWith("}")) {
        try {
          result[key] = JSON.parse(value);
          continue;
        } catch {
        }
      }
    }
    result[key] = value;
  }
  return result;
}
function registerDbHandlers() {
  electron.ipcMain.handle("db:query", async (_event, table, _method, params) => {
    try {
      const db2 = getDb();
      if (!db2) return { data: null, error: { message: "Database not unlocked" } };
      return executeQuery(db2, table, params);
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("db:execute", async (_event, sql, params) => {
    try {
      const db2 = getDb();
      if (!db2) return { data: null, error: { message: "Database not unlocked" } };
      const result = db2.prepare(sql).run(...params || []);
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("db:rpc", async (_event, functionName, params) => {
    try {
      const db2 = getDb();
      if (!db2) return { data: null, error: { message: "Database not unlocked" } };
      const handler = rpcHandlers[functionName];
      if (!handler) return { data: null, error: { message: `Unknown RPC: ${functionName}` } };
      return await handler(db2, params);
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
}
const rpcHandlers = {
  seed_user_defaults: async (db2, params) => {
    const { p_user_id } = params;
    try {
      const roleTypes = [
        { name: "Spouse/Partner", desc: "Your spouse or domestic partner", type: "spouse_partner", order: 1 },
        { name: "Healthcare POA Agent", desc: "Person(s) designated in your Healthcare Power of Attorney", type: "healthcare_poa_agent", order: 2 },
        { name: "Financial POA Agent", desc: "Person(s) designated in your Financial Power of Attorney", type: "financial_poa_agent", order: 3 },
        { name: "Executor/Trustee", desc: "Your executor, personal representative, or successor trustee", type: "executor_trustee", order: 4 },
        { name: "Financial Team", desc: "Wealth manager, CPA, banker, financial advisor", type: "financial_team", order: 5 },
        { name: "Legal Team", desc: "Estate planning attorney, business attorney", type: "legal_team", order: 6 },
        { name: "Healthcare Team", desc: "Physicians, care managers, concierge doctor", type: "healthcare_team", order: 7 },
        { name: "No Restrictions", desc: "Visible to everyone with any access to your folio", type: "no_restrictions", order: 8 },
        { name: "Owner Only", desc: "Visible only to you — no one else can see this", type: "owner_only", order: 9 }
      ];
      const insertRole = db2.prepare(
        `INSERT OR IGNORE INTO roles (id, owner_id, name, description, is_system_role, role_type, sort_order)
         VALUES (?, ?, ?, ?, 1, ?, ?)`
      );
      const roleIds = {};
      for (const r of roleTypes) {
        const id = crypto.randomUUID();
        insertRole.run(id, p_user_id, r.name, r.desc, r.type, r.order);
        roleIds[r.type] = id;
      }
      const cats = [
        { name: "Personal & Identity", slug: "personal-identity", desc: "Legal identity documents, vital records, and personal identification information", icon: "fingerprint", order: 1, roles: ["executor_trustee", "spouse_partner", "financial_poa_agent"] },
        { name: "Family & Relationships", slug: "family-relationships", desc: "Family tree, contact information, and relationship notes", icon: "users", order: 2, roles: ["no_restrictions"] },
        { name: "Friends & Neighbors", slug: "friends-neighbors", desc: "Local contacts who can check on you, have keys, or assist in emergencies", icon: "home", order: 3, roles: ["spouse_partner", "healthcare_poa_agent", "executor_trustee"] },
        { name: "Professional Advisory Team", slug: "advisory-team", desc: "Your attorney, CPA, wealth manager, insurance agent, banker, and other advisors", icon: "briefcase", order: 4, roles: ["no_restrictions"] },
        { name: "Medical History & Current Care", slug: "medical-history", desc: "Diagnoses, medications, physicians, allergies, medical devices, pharmacy information", icon: "heart-pulse", order: 5, roles: ["healthcare_poa_agent", "healthcare_team", "spouse_partner"] },
        { name: "Healthcare Preferences & Directives", slug: "healthcare-preferences", desc: "Preferred hospitals, DNR status, living will specifics, treatment preferences", icon: "stethoscope", order: 6, roles: ["healthcare_poa_agent", "healthcare_team", "spouse_partner"] },
        { name: "Long-Term Care Desires", slug: "long-term-care", desc: "Preferred care settings, staffing preferences, quality of life definitions", icon: "bed", order: 7, roles: ["healthcare_poa_agent", "healthcare_team", "spouse_partner", "executor_trustee"] },
        { name: "Mental Health & Cognitive Decline", slug: "mental-health", desc: "Wishes for cognitive decline, memory care preferences, comfort routines", icon: "brain", order: 8, roles: ["healthcare_poa_agent", "healthcare_team", "spouse_partner"] },
        { name: "Financial Overview", slug: "financial-overview", desc: "Bank accounts, brokerage accounts, retirement accounts, insurance policies, debts", icon: "landmark", order: 9, roles: ["financial_poa_agent", "financial_team", "legal_team", "executor_trustee", "spouse_partner"] },
        { name: "Digital Life", slug: "digital-life", desc: "Email accounts, cloud storage, passwords, social media, cryptocurrency", icon: "monitor-smartphone", order: 10, roles: ["owner_only"] },
        { name: "Income Streams & Recurring Obligations", slug: "income-obligations", desc: "Pensions, Social Security, annuities, rental income, recurring bills", icon: "repeat", order: 11, roles: ["financial_poa_agent", "financial_team", "legal_team", "executor_trustee", "spouse_partner"] },
        { name: "Business Interests & Ownership", slug: "business-interests", desc: "Active businesses, passive investments, PE funds, board positions", icon: "building-2", order: 12, roles: ["financial_poa_agent", "financial_team", "legal_team", "executor_trustee"] },
        { name: "Royalties & Residual Income", slug: "royalties", desc: "Book, music, patent, mineral, franchise, and licensing royalties", icon: "coins", order: 13, roles: ["financial_poa_agent", "financial_team", "legal_team", "executor_trustee", "spouse_partner"] },
        { name: "Personal Property & Beneficiary Designations", slug: "personal-property", desc: "Jewelry, art, collectibles, vehicles, wine collections", icon: "gem", order: 14, roles: ["executor_trustee", "spouse_partner"] },
        { name: "Firearms", slug: "firearms", desc: "Complete inventory with make, model, serial numbers, locations", icon: "shield", order: 15, roles: ["executor_trustee", "spouse_partner"] },
        { name: "Funeral, Burial & Memorial", slug: "funeral-burial", desc: "Burial vs. cremation, funeral home, religious traditions", icon: "flower-2", order: 16, roles: ["no_restrictions"] },
        { name: "Personal Wishes & Legacy", slug: "personal-wishes", desc: "Ethical will, legacy letters, values, life lessons", icon: "scroll-text", order: 17, roles: ["spouse_partner", "executor_trustee"] },
        { name: "Home & Property", slug: "home-property", desc: "Alarm codes, household operations, seasonal instructions", icon: "house", order: 18, roles: ["spouse_partner", "financial_poa_agent"] },
        { name: "Club Memberships & Social Commitments", slug: "clubs-memberships", desc: "Country clubs, yacht clubs, board positions", icon: "trophy", order: 19, roles: ["spouse_partner", "executor_trustee"] },
        { name: "Travel & Lifestyle", slug: "travel-lifestyle", desc: "Frequent flyer accounts, loyalty programs, travel agent", icon: "plane", order: 20, roles: ["spouse_partner"] },
        { name: "Pets & Pet Care", slug: "pets", desc: "Pet profiles, veterinary info, feeding schedules, designated caretakers", icon: "paw-print", order: 21, roles: ["spouse_partner", "executor_trustee"] }
      ];
      const insertCat = db2.prepare(
        `INSERT OR IGNORE INTO categories (id, owner_id, name, slug, description, icon, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      const insertCRA = db2.prepare(
        `INSERT OR IGNORE INTO category_role_access (id, category_id, role_id, owner_id)
         VALUES (?, ?, ?, ?)`
      );
      for (const cat of cats) {
        const catId = crypto.randomUUID();
        insertCat.run(catId, p_user_id, cat.name, cat.slug, cat.desc, cat.icon, cat.order);
        for (const roleType of cat.roles) {
          const rId = roleIds[roleType];
          if (rId) {
            insertCRA.run(crypto.randomUUID(), catId, rId, p_user_id);
          }
        }
      }
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }
};
let failedAttempts = 0;
let lockoutUntil = 0;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 3e4;
function getConfigPath() {
  return path.join(electron.app.getPath("userData"), "config.json");
}
function readConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    return null;
  }
}
function writeConfig(config) {
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf-8");
}
function registerAuthHandlers() {
  electron.ipcMain.handle("auth:isSetup", async () => {
    try {
      const config = readConfig();
      return { data: config?.setupComplete === true, error: null };
    } catch (err) {
      return { data: false, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("auth:setup", async (_event, passphrase) => {
    try {
      if (passphrase.length < 12) {
        return { data: null, error: { message: "Passphrase must be at least 12 characters" } };
      }
      const hash = await bcrypt.hash(passphrase, 12);
      const config = {
        passphraseHash: hash,
        setupComplete: true,
        setupDate: (/* @__PURE__ */ new Date()).toISOString()
      };
      writeConfig(config);
      openDatabase();
      failedAttempts = 0;
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("auth:unlock", async (_event, passphrase) => {
    try {
      if (Date.now() < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1e3);
        return { data: null, error: { message: `Too many attempts. Try again in ${remaining} seconds.` } };
      }
      const config = readConfig();
      if (!config) {
        return { data: null, error: { message: "App not set up yet" } };
      }
      const valid = await bcrypt.compare(passphrase, config.passphraseHash);
      if (!valid) {
        failedAttempts++;
        if (failedAttempts >= MAX_ATTEMPTS) {
          lockoutUntil = Date.now() + LOCKOUT_MS;
          failedAttempts = 0;
          return { data: null, error: { message: "Too many failed attempts. Locked out for 30 seconds." } };
        }
        return { data: null, error: { message: "Incorrect passphrase" } };
      }
      openDatabase();
      failedAttempts = 0;
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("auth:lock", async () => {
    try {
      closeDatabase();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("auth:isUnlocked", async () => {
    try {
      const { getDb: getDb2 } = await Promise.resolve().then(() => index);
      return { data: getDb2() !== null, error: null };
    } catch {
      return { data: false, error: null };
    }
  });
  electron.ipcMain.handle("auth:changePassphrase", async (_event, current, newPassphrase) => {
    try {
      const config = readConfig();
      if (!config) {
        return { data: null, error: { message: "App not set up yet" } };
      }
      const valid = await bcrypt.compare(current, config.passphraseHash);
      if (!valid) {
        return { data: null, error: { message: "Current passphrase is incorrect" } };
      }
      if (newPassphrase.length < 12) {
        return { data: null, error: { message: "New passphrase must be at least 12 characters" } };
      }
      const hash = await bcrypt.hash(newPassphrase, 12);
      config.passphraseHash = hash;
      writeConfig(config);
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
}
function registerPdfHandlers() {
  electron.ipcMain.handle("pdf:encrypt", async (_event, pdfBytes, userPassword) => {
    try {
      const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
      const encrypted = await pdfDoc.save({
        userPassword,
        ownerPassword: crypto.randomUUID(),
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false
        }
      });
      return { data: Buffer.from(encrypted), error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("pdf:saveToFile", async (_event, bytes, suggestedName) => {
    try {
      const result = await electron.dialog.showSaveDialog({
        title: "Save PDF Report",
        defaultPath: suggestedName,
        filters: [{ name: "PDF Files", extensions: ["pdf"] }]
      });
      if (result.canceled || !result.filePath) {
        return { data: null, error: null };
      }
      fs.writeFileSync(result.filePath, Buffer.from(bytes));
      return { data: result.filePath, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("pdf:saveToUserData", async (_event, bytes, fileName) => {
    try {
      const reportsDir = path.join(electron.app.getPath("userData"), "reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      const filePath = path.join(reportsDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(bytes));
      return { data: filePath, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
}
let publishingConfig = null;
function getPublishingConfig() {
  if (publishingConfig) return publishingConfig;
  const configPath = path.join(electron.app.getPath("userData"), "publishing-config.json");
  if (fs.existsSync(configPath)) {
    try {
      publishingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return publishingConfig;
    } catch {
      return null;
    }
  }
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    return null;
  }
  return null;
}
function registerUploadHandlers() {
  electron.ipcMain.handle("upload:publishReport", async (_event, params) => {
    try {
      const config = getPublishingConfig();
      if (!config) {
        return { data: null, error: { message: "Publishing not configured. Set up your publishing account first." } };
      }
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      const storagePath = `${config.ownerId}/${params.reportType}/${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage.from("encrypted-reports").upload(storagePath, Buffer.from(params.encryptedPdfBytes), {
        contentType: "application/pdf",
        upsert: true
      });
      if (uploadError) {
        return { data: null, error: { message: `Upload failed: ${uploadError.message}` } };
      }
      const { error: manifestError } = await supabase.from("report_manifest").upsert({
        owner_id: config.ownerId,
        owner_email: config.ownerEmail,
        report_type: params.reportType,
        report_label: params.reportLabel,
        storage_path: storagePath,
        published_at: (/* @__PURE__ */ new Date()).toISOString(),
        expires_at: params.expiresAt || null,
        version: Date.now(),
        is_active: true
      }, { onConflict: "owner_id,report_type" });
      if (manifestError) {
        return { data: null, error: { message: `Manifest update failed: ${manifestError.message}` } };
      }
      for (const access of params.accessList) {
        await supabase.from("family_access").upsert({
          owner_id: config.ownerId,
          grantee_email: access.email,
          grantee_name: access.name,
          report_type: params.reportType,
          granted_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "owner_id,grantee_email,report_type" });
      }
      const db2 = getDb();
      if (db2) {
        db2.prepare(`
          INSERT OR REPLACE INTO published_reports (id, report_type, report_label, storage_path, published_at, access_list)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          params.reportType,
          params.reportLabel,
          storagePath,
          (/* @__PURE__ */ new Date()).toISOString(),
          JSON.stringify(params.accessList)
        );
      }
      return { data: { success: true, storagePath }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("upload:revokeReport", async (_event, reportType) => {
    try {
      const config = getPublishingConfig();
      if (!config) {
        return { data: null, error: { message: "Publishing not configured" } };
      }
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      await supabase.from("report_manifest").update({ is_active: false }).eq("owner_id", config.ownerId).eq("report_type", reportType);
      const db2 = getDb();
      if (db2) {
        db2.prepare("DELETE FROM published_reports WHERE report_type = ?").run(reportType);
      }
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("upload:getPublishedReports", async () => {
    try {
      const db2 = getDb();
      if (!db2) return { data: [], error: null };
      const rows = db2.prepare("SELECT * FROM published_reports ORDER BY published_at DESC").all();
      return { data: rows, error: null };
    } catch (err) {
      return { data: [], error: { message: err.message } };
    }
  });
}
function registerWindowHandlers() {
  electron.ipcMain.handle("app:getVersion", () => {
    return electron.app.getVersion();
  });
  electron.ipcMain.handle("app:getPlatform", () => {
    return process.platform;
  });
  electron.ipcMain.handle("app:getUserDataPath", () => {
    return electron.app.getPath("userData");
  });
}
function getFilesDir() {
  return path.join(electron.app.getPath("userData"), "files");
}
function resolveFilePath(bucketName, filePath) {
  return path.join(getFilesDir(), bucketName, filePath);
}
function registerFileHandlers() {
  electron.ipcMain.handle("files:save", async (_event, bucketName, filePath, data, _contentType) => {
    try {
      const fullPath = resolveFilePath(bucketName, filePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, Buffer.from(data));
      return { data: { path: filePath }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("files:read", async (_event, bucketName, filePath) => {
    try {
      const fullPath = resolveFilePath(bucketName, filePath);
      if (!fs.existsSync(fullPath)) {
        return { data: null, error: { message: "File not found" } };
      }
      const buffer = fs.readFileSync(fullPath);
      return { data: new Uint8Array(buffer), error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("files:remove", async (_event, bucketName, filePaths) => {
    try {
      for (const filePath of filePaths) {
        const fullPath = resolveFilePath(bucketName, filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
  electron.ipcMain.handle("files:getUrl", async (_event, bucketName, filePath) => {
    try {
      const fullPath = resolveFilePath(bucketName, filePath);
      if (!fs.existsSync(fullPath)) {
        return { data: null, error: { message: "File not found" } };
      }
      return { data: `file://${fullPath.replace(/\\/g, "/")}`, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  });
}
let mainWindow = null;
let lastActivityTime = Date.now();
const AUTO_LOCK_MS = 15 * 60 * 1e3;
let autoLockInterval = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: "MyLifeFolio",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: file:; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'"
        ]
      }
    });
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.on("focus", () => {
    lastActivityTime = Date.now();
  });
}
function startAutoLockTimer() {
  if (autoLockInterval) clearInterval(autoLockInterval);
  autoLockInterval = setInterval(() => {
    if (Date.now() - lastActivityTime > AUTO_LOCK_MS) {
      mainWindow?.webContents.send("auto-lock");
    }
  }, 3e4);
}
electron.ipcMain.on("user-activity", () => {
  lastActivityTime = Date.now();
});
function registerAllHandlers() {
  registerDbHandlers();
  registerAuthHandlers();
  registerPdfHandlers();
  registerUploadHandlers();
  registerWindowHandlers();
  registerFileHandlers();
}
electron.app.whenReady().then(() => {
  registerAllHandlers();
  createWindow();
  startAutoLockTimer();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  if (autoLockInterval) clearInterval(autoLockInterval);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception in main process:", error);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in main process:", reason);
});
