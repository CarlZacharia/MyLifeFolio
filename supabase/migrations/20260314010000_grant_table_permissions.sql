-- Migration: Grant table-level permissions to authenticated role
-- Many tables were created with RLS policies but without GRANT statements,
-- causing 403 Forbidden errors because the authenticated role lacks base table privileges.

-- Set default privileges so any future tables in public schema automatically get grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- Grant on all existing tables that are missing permissions
-- (profiles, user_questions, folio_authorized_users, folio_access_log, folio_documents,
--  user_subscriptions already have grants — included here with IF-safe idempotent GRANT)

-- Core intake tables
GRANT SELECT, INSERT, UPDATE, DELETE ON intakes_raw TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_intakes TO authenticated;

-- Children, beneficiaries, dependents
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_children TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_beneficiaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_dependents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_charities TO authenticated;

-- Assets
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_real_estate TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_bank_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_investments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_retirement_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_life_insurance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_other_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_business_interests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_digital_assets TO authenticated;

-- Gifts
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_specific_gifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_cash_gifts TO authenticated;

-- Estate planning extended
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_long_term_care TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_current_estate_plan TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_distribution_plans TO authenticated;

-- Income
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_client_income TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_spouse_income TO authenticated;

-- Medical insurance (old tables)
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_client_medical_insurance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_spouse_medical_insurance TO authenticated;

-- Advisors, friends
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_advisors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_friends_neighbors TO authenticated;

-- RMDs
GRANT SELECT, INSERT, UPDATE, DELETE ON ira_rmds TO authenticated;

-- Medical
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_medical_providers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_care_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_end_of_life TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_insurance_coverage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_medical_insurance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_medical_conditions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_allergies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_surgeries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_basic_vitals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_pharmacies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_medications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_medical_equipment TO authenticated;

-- Subscriptions (service-level)
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_subscriptions TO authenticated;

-- Legacy tables
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_obituary TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_obituary_spouse TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_charity_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_charity_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_letters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_personal_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_stories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_reflections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_surprises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_videos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_memories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_obituary_drafts TO authenticated;

-- Credential vault
GRANT SELECT, INSERT, UPDATE, DELETE ON credential_vault_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON credential_accounts TO authenticated;

-- Vault documents
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_documents TO authenticated;

-- Offices/attorneys (read-only for regular users)
GRANT SELECT ON offices TO authenticated;
GRANT SELECT ON attorneys TO authenticated;
