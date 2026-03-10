-- ============================================================================
-- DELETE USER BY ID
-- Run this in the Supabase SQL Editor to completely remove a user.
-- Replace the UUID below with the user's actual ID.
-- Safely skips any tables that don't exist yet.
-- ============================================================================

DO $$
DECLARE
  target_id UUID := '8d113edf-761c-4981-8127-9b97a8f33943';  -- <-- REPLACE THIS
  tbl RECORD;
BEGIN
  -- Tables with user_id column
  FOR tbl IN
    SELECT unnest(ARRAY[
      -- Core
      'intakes_raw',
      -- Folio estate planning tables
      'folio_intakes',
      'folio_children',
      'folio_beneficiaries',
      'folio_charities',
      'folio_dependents',
      'folio_real_estate',
      'folio_bank_accounts',
      'folio_investments',
      'folio_retirement_accounts',
      'folio_life_insurance',
      'folio_vehicles',
      'folio_other_assets',
      'folio_business_interests',
      'folio_digital_assets',
      'folio_specific_gifts',
      'folio_cash_gifts',
      'folio_long_term_care',
      'folio_current_estate_plan',
      'folio_distribution_plans',
      'folio_client_income',
      'folio_spouse_income',
      'folio_client_medical_insurance',
      'folio_spouse_medical_insurance',
      -- Folio people & advisors
      'folio_advisors',
      'folio_friends_neighbors',
      'folio_medical_providers',
      -- Folio medical
      'folio_medical_insurance',
      'folio_medical_conditions',
      'folio_allergies',
      'folio_surgeries',
      'folio_basic_vitals',
      'folio_medications',
      'folio_medical_equipment',
      'folio_pharmacies',
      -- Folio financial
      'folio_insurance_coverage',
      'folio_expenses',
      'folio_subscriptions',
      -- Folio care & end of life
      'folio_care_preferences',
      'folio_end_of_life',
      -- Legacy
      'legacy_obituary',
      'legacy_obituary_spouse',
      'legacy_obituary_drafts',
      'legacy_charity_organizations',
      'legacy_charity_preferences',
      'legacy_letters',
      'legacy_personal_history',
      'legacy_stories',
      'legacy_reflections',
      'legacy_surprises',
      'legacy_favorites',
      'legacy_videos',
      'legacy_memories',
      -- Documents
      'vault_documents',
      -- Credentials
      'credential_vault_settings',
      'credential_accounts',
      -- User questions
      'user_questions'
    ]) AS table_name
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl.table_name
    ) THEN
      EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', tbl.table_name) USING target_id;
      RAISE NOTICE 'Deleted from %', tbl.table_name;
    ELSE
      RAISE NOTICE 'Skipped % (does not exist)', tbl.table_name;
    END IF;
  END LOOP;

  -- Tables with owner_id column
  FOR tbl IN
    SELECT unnest(ARRAY[
      'folio_documents',
      'folio_authorized_users',
      'folio_access_log'
    ]) AS table_name
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl.table_name
    ) THEN
      EXECUTE format('DELETE FROM public.%I WHERE owner_id = $1', tbl.table_name) USING target_id;
      RAISE NOTICE 'Deleted from %', tbl.table_name;
    ELSE
      RAISE NOTICE 'Skipped % (does not exist)', tbl.table_name;
    END IF;
  END LOOP;

  -- Profile (id column)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    DELETE FROM public.profiles WHERE id = target_id;
    RAISE NOTICE 'Deleted from profiles';
  END IF;

  -- Auth user
  DELETE FROM auth.users WHERE id = target_id;
  RAISE NOTICE 'Deleted from auth.users';

  RAISE NOTICE 'User % fully removed.', target_id;
END $$;
