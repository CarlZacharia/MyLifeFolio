-- ============================================================================
-- MyLifeFolio - Drop All Existing Tables
-- Run this FIRST in the Supabase SQL Editor before running the full schema
-- Drops in reverse dependency order to avoid foreign key conflicts
-- ============================================================================

-- Drop storage policies first (these reference the bucket)
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Note: Cannot DELETE from storage.buckets via SQL (Supabase blocks it).
-- Delete the bucket from Supabase Dashboard > Storage if needed,
-- or just leave it -- the schema script uses ON CONFLICT to update it.

-- Drop child tables (those with foreign keys to estate_planning_intakes)
DROP TABLE IF EXISTS estate_planning_spouse_medical_insurance CASCADE;
DROP TABLE IF EXISTS estate_planning_client_medical_insurance CASCADE;
DROP TABLE IF EXISTS estate_planning_spouse_income CASCADE;
DROP TABLE IF EXISTS estate_planning_client_income CASCADE;
DROP TABLE IF EXISTS estate_planning_distribution_plans CASCADE;
DROP TABLE IF EXISTS estate_planning_current_estate_plan CASCADE;
DROP TABLE IF EXISTS estate_planning_long_term_care CASCADE;
DROP TABLE IF EXISTS estate_planning_cash_gifts CASCADE;
DROP TABLE IF EXISTS estate_planning_specific_gifts CASCADE;
DROP TABLE IF EXISTS estate_planning_digital_assets CASCADE;
DROP TABLE IF EXISTS estate_planning_business_interests CASCADE;
DROP TABLE IF EXISTS estate_planning_other_assets CASCADE;
DROP TABLE IF EXISTS estate_planning_vehicles CASCADE;
DROP TABLE IF EXISTS estate_planning_life_insurance CASCADE;
DROP TABLE IF EXISTS estate_planning_retirement_accounts CASCADE;
DROP TABLE IF EXISTS estate_planning_investments CASCADE;
DROP TABLE IF EXISTS estate_planning_bank_accounts CASCADE;
DROP TABLE IF EXISTS estate_planning_real_estate CASCADE;
DROP TABLE IF EXISTS estate_planning_dependents CASCADE;
DROP TABLE IF EXISTS estate_planning_charities CASCADE;
DROP TABLE IF EXISTS estate_planning_beneficiaries CASCADE;
DROP TABLE IF EXISTS estate_planning_children CASCADE;

-- Drop parent estate planning intakes table
DROP TABLE IF EXISTS estate_planning_intakes CASCADE;

-- Drop intakes_raw (depends on offices/attorneys)
DROP TABLE IF EXISTS intakes_raw CASCADE;

-- Drop offices and attorneys
DROP TABLE IF EXISTS attorneys CASCADE;
DROP TABLE IF EXISTS offices CASCADE;

-- Drop IRA RMDs
DROP TABLE IF EXISTS ira_rmds CASCADE;

-- Drop user questions
DROP TABLE IF EXISTS user_questions CASCADE;

-- Drop profiles and its trigger/function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
  END IF;
END $$;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop shared functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop the intake_type enum
DROP TYPE IF EXISTS intake_type;

-- ============================================================================
-- DONE! All tables dropped. Now run mylifefolio_full_schema.sql to recreate.
-- ============================================================================
