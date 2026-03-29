import type Database from 'better-sqlite3';

// Schema version tracking
const CURRENT_VERSION = 1;

export function runMigrations(db: Database.Database): void {
  // Create version tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _schema_version (
      version INTEGER NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const row = db.prepare('SELECT MAX(version) as version FROM _schema_version').get() as { version: number | null } | undefined;
  const currentVersion = row?.version ?? 0;

  if (currentVersion < CURRENT_VERSION) {
    // Run all pending migrations in a transaction
    db.transaction(() => {
      if (currentVersion < 1) migration_001(db);
      db.prepare('INSERT INTO _schema_version (version) VALUES (?)').run(CURRENT_VERSION);
    })();
  }
}

function migration_001(db: Database.Database): void {
  // ── Core tables ──────────────────────────────────────────────────────
  db.exec(`
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

  // ── Intake tables ────────────────────────────────────────────────────
  db.exec(`
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

  // ── Folio children, beneficiaries, charities, dependents ─────────────
  db.exec(`
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

  // ── Real estate, bank accounts, investments, retirement ──────────────
  db.exec(`
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

  // ── Life insurance, vehicles, other assets, business, digital assets ─
  db.exec(`
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

  // ── Gifts, income, medical insurance ─────────────────────────────────
  db.exec(`
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

  // ── Current estate plan, distribution plans ──────────────────────────
  db.exec(`
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

  // ── Offices, attorneys, income, medical insurance ────────────────────
  db.exec(`
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

  // ── Advisors, friends, medical providers, care preferences, end of life
  db.exec(`
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

  // ── Insurance coverage (large table) ─────────────────────────────────
  db.exec(`
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

  // ── Authorized users, access log, documents ──────────────────────────
  db.exec(`
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

  // ── Legacy: obituary, drafts, charity, letters, personal history ─────
  db.exec(`
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

  // ── Legacy: stories, reflections, surprises, favorites, videos, memories
  db.exec(`
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

  // ── Medical: conditions, allergies, surgeries, vitals, pharmacies, meds
  db.exec(`
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

  // ── Subscriptions, credentials, user subscriptions, reports ──────────
  db.exec(`
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

  // ── Invitations, signup attempts, scheduled emails, misc ─────────────
  db.exec(`
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
