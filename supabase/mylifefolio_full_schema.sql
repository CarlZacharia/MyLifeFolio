-- ============================================================================
-- MyLifeFolio - Complete Schema Migration
-- Run this in the Supabase SQL Editor for project: zpbpdcwuwgkwmpfmgmyo
-- This consolidates all Estate Planning App migrations into one file
-- ============================================================================

-- ============================================================================
-- 1. UTILITY FUNCTIONS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at (alternate name used by profiles)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. INTAKE TYPE ENUM
-- ============================================================================
CREATE TYPE intake_type AS ENUM (
  'EstatePlanning',
  'Probate',
  'Trust',
  'ElderLaw',
  'Medicaid',
  'RealEstate',
  'BusinessFormation',
  'Other'
);

-- ============================================================================
-- 3. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  address TEXT,
  state_of_domicile TEXT,
  telephone TEXT,
  agreed_to_terms BOOLEAN DEFAULT FALSE,
  agreed_to_terms_at TIMESTAMPTZ,
  agreed_to_terms_signature TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow INSERT so the signup trigger can create profiles
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING ((auth.jwt() ->> 'email') LIKE '%@mylifefolio.com');

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, address, state_of_domicile, telephone,
    agreed_to_terms, agreed_to_terms_at, agreed_to_terms_signature,
    is_admin, created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'state_of_domicile',
    NEW.raw_user_meta_data->>'telephone',
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_terms')::boolean, FALSE),
    CASE
      WHEN NEW.raw_user_meta_data->>'agreed_to_terms_at' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'agreed_to_terms_at')::timestamptz
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'agreed_to_terms_signature',
    CASE
      WHEN NEW.email LIKE '%@mylifefolio.com' THEN TRUE
      ELSE FALSE
    END,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;

-- ============================================================================
-- 4. USER QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Estate Planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_questions_user_id ON public.user_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_questions_category ON public.user_questions(category);

ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own questions"
  ON public.user_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own questions"
  ON public.user_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions"
  ON public.user_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own questions"
  ON public.user_questions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all questions"
  ON public.user_questions FOR SELECT
  USING ((auth.jwt() ->> 'email') LIKE '%@mylifefolio.com');

DROP TRIGGER IF EXISTS on_user_questions_updated ON public.user_questions;
CREATE TRIGGER on_user_questions_updated
  BEFORE UPDATE ON public.user_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

GRANT ALL ON public.user_questions TO authenticated;
GRANT SELECT ON public.user_questions TO anon;

-- ============================================================================
-- 5. OFFICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  telephone TEXT,
  fax TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offices_name ON offices(name);
CREATE INDEX idx_offices_is_active ON offices(is_active);

CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON offices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active offices"
  ON offices FOR SELECT TO authenticated USING (is_active = TRUE);

-- ============================================================================
-- 6. ATTORNEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attorneys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  primary_office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
  clio_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attorneys_name ON attorneys(name);
CREATE INDEX idx_attorneys_email ON attorneys(email);
CREATE INDEX idx_attorneys_primary_office ON attorneys(primary_office_id);
CREATE INDEX idx_attorneys_is_active ON attorneys(is_active);

CREATE TRIGGER update_attorneys_updated_at
  BEFORE UPDATE ON attorneys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE attorneys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active attorneys"
  ON attorneys FOR SELECT TO authenticated USING (is_active = TRUE);

-- ============================================================================
-- 7. INTAKES_RAW TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS intakes_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_type intake_type NOT NULL DEFAULT 'EstatePlanning',
  form_data JSONB NOT NULL,
  client_name TEXT GENERATED ALWAYS AS (form_data->>'name') STORED,
  spouse_name TEXT GENERATED ALWAYS AS (form_data->>'spouseName') STORED,

  -- Claude analysis columns
  claude_analysis TEXT,
  claude_analysis_tokens JSONB,
  analysis_generated_at TIMESTAMPTZ,

  -- Storage columns
  storage_folder TEXT,
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  report_files JSONB DEFAULT '[]'::jsonb,

  -- Office/Attorney references
  office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
  attorney_id UUID REFERENCES attorneys(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intakes_raw_user_id ON intakes_raw(user_id);
CREATE INDEX idx_intakes_raw_intake_type ON intakes_raw(intake_type);
CREATE INDEX idx_intakes_raw_created_at ON intakes_raw(created_at DESC);
CREATE INDEX idx_intakes_raw_client_name ON intakes_raw(client_name);
CREATE INDEX idx_intakes_raw_form_data ON intakes_raw USING GIN (form_data);
CREATE INDEX IF NOT EXISTS idx_intakes_raw_storage_folder ON intakes_raw(storage_folder);
CREATE INDEX IF NOT EXISTS idx_intakes_raw_office ON intakes_raw(office_id);
CREATE INDEX IF NOT EXISTS idx_intakes_raw_attorney ON intakes_raw(attorney_id);

CREATE TRIGGER update_intakes_raw_updated_at
  BEFORE UPDATE ON intakes_raw
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE intakes_raw ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intakes_raw"
  ON intakes_raw FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own intakes_raw"
  ON intakes_raw FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own intakes_raw"
  ON intakes_raw FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own intakes_raw"
  ON intakes_raw FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all intakes"
  ON intakes_raw FOR SELECT
  USING ((auth.jwt() ->> 'email') LIKE '%@mylifefolio.com');

-- ============================================================================
-- 8. ESTATE PLANNING INTAKES (main intake record)
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_raw_id UUID REFERENCES intakes_raw(id) ON DELETE SET NULL,

  -- Dates
  intake_date DATE,
  appointment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Client Personal Info
  client_name TEXT NOT NULL,
  client_aka TEXT,
  client_sex TEXT,
  client_birth_date DATE,
  client_mailing_address TEXT,
  client_state_of_domicile TEXT,
  client_looking_to_change_domicile BOOLEAN DEFAULT FALSE,
  client_new_domicile_state TEXT,
  client_cell_phone TEXT,
  client_home_phone TEXT,
  client_work_phone TEXT,
  client_email TEXT,

  -- Client Military Service
  client_served_military BOOLEAN DEFAULT FALSE,
  client_military_branch TEXT,
  client_military_start_date TEXT,
  client_military_end_date TEXT,

  -- Client Funeral Preferences
  client_has_prepaid_funeral BOOLEAN DEFAULT FALSE,
  client_prepaid_funeral_details TEXT,
  client_preferred_funeral_home TEXT,
  client_burial_or_cremation TEXT,
  client_preferred_church TEXT,

  -- Client Existing Trusts
  client_has_living_trust BOOLEAN DEFAULT FALSE,
  client_living_trust_name TEXT,
  client_living_trust_date DATE,
  client_has_irrevocable_trust BOOLEAN DEFAULT FALSE,
  client_irrevocable_trust_name TEXT,
  client_irrevocable_trust_date DATE,
  client_considering_trust BOOLEAN DEFAULT FALSE,

  -- Marital Information
  marital_status TEXT,
  date_married DATE,
  place_of_marriage TEXT,
  prior_marriage BOOLEAN DEFAULT FALSE,
  children_from_prior_marriage BOOLEAN DEFAULT FALSE,
  number_of_children INTEGER DEFAULT 0,
  client_has_children_from_prior BOOLEAN DEFAULT FALSE,
  client_children_from_prior INTEGER DEFAULT 0,
  children_together INTEGER DEFAULT 0,

  -- Spouse Personal Info
  spouse_name TEXT,
  spouse_aka TEXT,
  spouse_sex TEXT,
  spouse_birth_date DATE,
  spouse_mailing_address TEXT,
  spouse_cell_phone TEXT,
  spouse_home_phone TEXT,
  spouse_work_phone TEXT,
  spouse_email TEXT,
  spouse_has_children_from_prior BOOLEAN DEFAULT FALSE,
  spouse_children_from_prior INTEGER DEFAULT 0,

  -- Spouse Military Service
  spouse_served_military BOOLEAN DEFAULT FALSE,
  spouse_military_branch TEXT,
  spouse_military_start_date TEXT,
  spouse_military_end_date TEXT,

  -- Spouse Funeral Preferences
  spouse_has_prepaid_funeral BOOLEAN DEFAULT FALSE,
  spouse_prepaid_funeral_details TEXT,
  spouse_preferred_funeral_home TEXT,
  spouse_burial_or_cremation TEXT,
  spouse_preferred_church TEXT,

  -- Spouse Existing Trusts
  spouse_has_living_trust BOOLEAN DEFAULT FALSE,
  spouse_living_trust_name TEXT,
  spouse_living_trust_date DATE,
  spouse_has_irrevocable_trust BOOLEAN DEFAULT FALSE,
  spouse_irrevocable_trust_name TEXT,
  spouse_irrevocable_trust_date DATE,
  spouse_considering_trust BOOLEAN DEFAULT FALSE,

  -- Beneficiary Concerns
  any_beneficiaries_minors BOOLEAN DEFAULT FALSE,
  beneficiary_minors_explanation TEXT,
  any_beneficiaries_disabled BOOLEAN DEFAULT FALSE,
  beneficiary_disabled_explanation TEXT,
  any_beneficiaries_marital_problems BOOLEAN DEFAULT FALSE,
  beneficiary_marital_problems_explanation TEXT,
  any_beneficiaries_receiving_ssi BOOLEAN DEFAULT FALSE,
  beneficiary_ssi_explanation TEXT,
  any_beneficiary_drug_addiction BOOLEAN DEFAULT FALSE,
  beneficiary_drug_addiction_explanation TEXT,
  any_beneficiary_alcoholism BOOLEAN DEFAULT FALSE,
  beneficiary_alcoholism_explanation TEXT,
  any_beneficiary_financial_problems BOOLEAN DEFAULT FALSE,
  beneficiary_financial_problems_explanation TEXT,
  has_other_beneficiary_concerns BOOLEAN DEFAULT FALSE,
  beneficiary_other_concerns TEXT,
  beneficiary_notes TEXT,

  -- Dispositive Intentions
  provide_for_spouse_then_children BOOLEAN DEFAULT TRUE,
  treat_all_children_equally BOOLEAN DEFAULT TRUE,
  include_client_stepchildren_in_spouse_will BOOLEAN DEFAULT FALSE,
  include_spouse_stepchildren_in_client_will BOOLEAN DEFAULT FALSE,
  children_equality_explanation TEXT,
  distribution_age TEXT,
  children_predeceased_beneficiaries BOOLEAN DEFAULT TRUE,
  leave_to_grandchildren BOOLEAN DEFAULT FALSE,
  treat_all_grandchildren_equally BOOLEAN DEFAULT TRUE,
  grandchildren_equality_explanation TEXT,
  grandchildren_amount TEXT,
  grandchildren_distribution_age TEXT,
  has_specific_devises BOOLEAN DEFAULT FALSE,
  specific_devises_description TEXT,
  has_general_bequests BOOLEAN DEFAULT FALSE,
  general_bequests_description TEXT,
  cash_bequest_timing TEXT DEFAULT 'atSurvivorDeath',
  dispositive_intentions_comments TEXT,
  leave_to_charity BOOLEAN DEFAULT FALSE,
  mirror_distribution_plans BOOLEAN DEFAULT FALSE,

  -- Client Fiduciaries
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

  -- Spouse Fiduciaries
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

  -- Client Health Care Agents
  health_care_agent_name TEXT,
  health_care_agent_name_other TEXT,
  health_care_alternate_name TEXT,
  health_care_alternate_name_other TEXT,
  health_care_second_alternate_name TEXT,
  health_care_second_alternate_name_other TEXT,
  withdraw_artificial_food_fluid BOOLEAN DEFAULT FALSE,

  -- Spouse Health Care Agents
  spouse_health_care_agent_name TEXT,
  spouse_health_care_agent_name_other TEXT,
  spouse_health_care_alternate_name TEXT,
  spouse_health_care_alternate_name_other TEXT,
  spouse_health_care_second_alternate_name TEXT,
  spouse_health_care_second_alternate_name_other TEXT,
  spouse_withdraw_artificial_food_fluid BOOLEAN DEFAULT FALSE,

  -- Client Financial POA
  financial_agent_name TEXT,
  financial_agent_name_other TEXT,
  financial_alternate_name TEXT,
  financial_alternate_name_other TEXT,
  financial_second_alternate_name TEXT,
  financial_second_alternate_name_other TEXT,

  -- Spouse Financial POA
  spouse_financial_agent_name TEXT,
  spouse_financial_agent_name_other TEXT,
  spouse_financial_alternate_name TEXT,
  spouse_financial_alternate_name_other TEXT,
  spouse_financial_second_alternate_name TEXT,
  spouse_financial_second_alternate_name_other TEXT,

  -- Miscellaneous
  legal_issues TEXT,
  spouse_legal_issues TEXT,
  important_papers_location TEXT,
  has_safe_deposit_box BOOLEAN DEFAULT FALSE,
  safe_deposit_box_bank TEXT,
  safe_deposit_box_number TEXT,
  safe_deposit_box_location TEXT,
  safe_deposit_box_access TEXT,
  safe_deposit_box_contents TEXT,

  -- Additional
  additional_comments TEXT,
  client_notes TEXT
);

CREATE INDEX idx_ep_intakes_user_id ON estate_planning_intakes(user_id);
CREATE INDEX idx_ep_intakes_client_name ON estate_planning_intakes(client_name);
CREATE INDEX idx_ep_intakes_created_at ON estate_planning_intakes(created_at DESC);
CREATE INDEX idx_ep_intakes_intake_raw_id ON estate_planning_intakes(intake_raw_id);

CREATE TRIGGER update_estate_planning_intakes_updated_at
  BEFORE UPDATE ON estate_planning_intakes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE estate_planning_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own estate_planning_intakes"
  ON estate_planning_intakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_intakes"
  ON estate_planning_intakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_intakes"
  ON estate_planning_intakes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_intakes"
  ON estate_planning_intakes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 9. CHILDREN TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  birth_date TEXT,
  age TEXT,
  relationship TEXT,
  marital_status TEXT,
  has_children BOOLEAN DEFAULT FALSE,
  number_of_children INTEGER DEFAULT 0,
  has_minor_children BOOLEAN DEFAULT FALSE,
  distribution_type TEXT,
  distribution_method TEXT DEFAULT '',
  disinherit BOOLEAN DEFAULT FALSE,
  comments TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_children_intake_id ON estate_planning_children(intake_id);
CREATE INDEX idx_ep_children_user_id ON estate_planning_children(user_id);

ALTER TABLE estate_planning_children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_children"
  ON estate_planning_children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_children"
  ON estate_planning_children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_children"
  ON estate_planning_children FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_children"
  ON estate_planning_children FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 10. OTHER BENEFICIARIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  relationship TEXT,
  relationship_other TEXT,
  age TEXT,
  distribution_type TEXT,
  distribution_method TEXT DEFAULT '',
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_beneficiaries_intake_id ON estate_planning_beneficiaries(intake_id);
CREATE INDEX idx_ep_beneficiaries_user_id ON estate_planning_beneficiaries(user_id);

ALTER TABLE estate_planning_beneficiaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_beneficiaries"
  ON estate_planning_beneficiaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_beneficiaries"
  ON estate_planning_beneficiaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_beneficiaries"
  ON estate_planning_beneficiaries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_beneficiaries"
  ON estate_planning_beneficiaries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 11. CHARITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  amount TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_charities_intake_id ON estate_planning_charities(intake_id);
CREATE INDEX idx_ep_charities_user_id ON estate_planning_charities(user_id);

ALTER TABLE estate_planning_charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_charities"
  ON estate_planning_charities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_charities"
  ON estate_planning_charities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_charities"
  ON estate_planning_charities FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_charities"
  ON estate_planning_charities FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 12. DEPENDENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_dependents_intake_id ON estate_planning_dependents(intake_id);
CREATE INDEX idx_ep_dependents_user_id ON estate_planning_dependents(user_id);

ALTER TABLE estate_planning_dependents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_dependents"
  ON estate_planning_dependents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_dependents"
  ON estate_planning_dependents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_dependents"
  ON estate_planning_dependents FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_dependents"
  ON estate_planning_dependents FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 13. REAL ESTATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_real_estate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  ownership_form TEXT,
  category TEXT,
  show_beneficiaries BOOLEAN DEFAULT FALSE,
  show_other BOOLEAN DEFAULT FALSE,
  joint_owner_beneficiaries TEXT[],
  joint_owner_other TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  value DECIMAL(15,2),
  mortgage_balance DECIMAL(15,2),
  cost_basis DECIMAL(15,2),
  primary_beneficiaries TEXT[],
  remainder_interest_other TEXT,
  client_ownership_percentage TEXT,
  spouse_ownership_percentage TEXT,
  client_spouse_joint_type TEXT,
  client_spouse_combined_percentage TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_real_estate_intake_id ON estate_planning_real_estate(intake_id);
CREATE INDEX idx_ep_real_estate_user_id ON estate_planning_real_estate(user_id);

ALTER TABLE estate_planning_real_estate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_real_estate"
  ON estate_planning_real_estate FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_real_estate"
  ON estate_planning_real_estate FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_real_estate"
  ON estate_planning_real_estate FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_real_estate"
  ON estate_planning_real_estate FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 14. BANK ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  account_type TEXT,
  institution TEXT,
  amount DECIMAL(15,2),
  has_beneficiaries BOOLEAN DEFAULT FALSE,
  primary_beneficiaries TEXT[],
  primary_distribution_type TEXT,
  secondary_beneficiaries TEXT[],
  secondary_distribution_type TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_bank_accounts_intake_id ON estate_planning_bank_accounts(intake_id);
CREATE INDEX idx_ep_bank_accounts_user_id ON estate_planning_bank_accounts(user_id);

ALTER TABLE estate_planning_bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_bank_accounts"
  ON estate_planning_bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_bank_accounts"
  ON estate_planning_bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_bank_accounts"
  ON estate_planning_bank_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_bank_accounts"
  ON estate_planning_bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 15. NON-QUALIFIED INVESTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  institution TEXT,
  description TEXT,
  value DECIMAL(15,2),
  has_beneficiaries BOOLEAN DEFAULT FALSE,
  primary_beneficiaries TEXT[],
  primary_distribution_type TEXT,
  secondary_beneficiaries TEXT[],
  secondary_distribution_type TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_investments_intake_id ON estate_planning_investments(intake_id);
CREATE INDEX idx_ep_investments_user_id ON estate_planning_investments(user_id);

ALTER TABLE estate_planning_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_investments"
  ON estate_planning_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_investments"
  ON estate_planning_investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_investments"
  ON estate_planning_investments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_investments"
  ON estate_planning_investments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 16. RETIREMENT ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_retirement_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  institution TEXT,
  account_type TEXT,
  value DECIMAL(15,2),
  has_beneficiaries BOOLEAN DEFAULT FALSE,
  primary_beneficiaries TEXT[],
  primary_distribution_type TEXT,
  secondary_beneficiaries TEXT[],
  secondary_distribution_type TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_retirement_intake_id ON estate_planning_retirement_accounts(intake_id);
CREATE INDEX idx_ep_retirement_user_id ON estate_planning_retirement_accounts(user_id);

ALTER TABLE estate_planning_retirement_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_retirement_accounts"
  ON estate_planning_retirement_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_retirement_accounts"
  ON estate_planning_retirement_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_retirement_accounts"
  ON estate_planning_retirement_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_retirement_accounts"
  ON estate_planning_retirement_accounts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 17. LIFE INSURANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_life_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  company TEXT,
  policy_type TEXT,
  face_amount DECIMAL(15,2),
  death_benefit DECIMAL(15,2),
  cash_value DECIMAL(15,2),
  insured TEXT,
  has_beneficiaries BOOLEAN DEFAULT FALSE,
  primary_beneficiaries TEXT[],
  primary_distribution_type TEXT,
  secondary_beneficiaries TEXT[],
  secondary_distribution_type TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_life_insurance_intake_id ON estate_planning_life_insurance(intake_id);
CREATE INDEX idx_ep_life_insurance_user_id ON estate_planning_life_insurance(user_id);

ALTER TABLE estate_planning_life_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_life_insurance"
  ON estate_planning_life_insurance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_life_insurance"
  ON estate_planning_life_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_life_insurance"
  ON estate_planning_life_insurance FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_life_insurance"
  ON estate_planning_life_insurance FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 18. VEHICLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  year_make_model TEXT,
  value DECIMAL(15,2),
  has_beneficiaries BOOLEAN DEFAULT FALSE,
  primary_beneficiaries TEXT[],
  primary_distribution_type TEXT,
  secondary_beneficiaries TEXT[],
  secondary_distribution_type TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_vehicles_intake_id ON estate_planning_vehicles(intake_id);
CREATE INDEX idx_ep_vehicles_user_id ON estate_planning_vehicles(user_id);

ALTER TABLE estate_planning_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_vehicles"
  ON estate_planning_vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_vehicles"
  ON estate_planning_vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_vehicles"
  ON estate_planning_vehicles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_vehicles"
  ON estate_planning_vehicles FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 19. OTHER ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_other_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  description TEXT,
  value DECIMAL(15,2),
  has_beneficiaries BOOLEAN DEFAULT FALSE,
  primary_beneficiaries TEXT[],
  primary_distribution_type TEXT,
  secondary_beneficiaries TEXT[],
  secondary_distribution_type TEXT,
  add_to_personal_property_memo BOOLEAN DEFAULT FALSE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_other_assets_intake_id ON estate_planning_other_assets(intake_id);
CREATE INDEX idx_ep_other_assets_user_id ON estate_planning_other_assets(user_id);

ALTER TABLE estate_planning_other_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_other_assets"
  ON estate_planning_other_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_other_assets"
  ON estate_planning_other_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_other_assets"
  ON estate_planning_other_assets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_other_assets"
  ON estate_planning_other_assets FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 20. BUSINESS INTERESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_business_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  business_name TEXT,
  entity_type TEXT,
  ownership_percentage TEXT,
  full_value DECIMAL(15,2),
  co_owners TEXT,
  has_buy_sell_agreement BOOLEAN DEFAULT FALSE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_business_intake_id ON estate_planning_business_interests(intake_id);
CREATE INDEX idx_ep_business_user_id ON estate_planning_business_interests(user_id);

ALTER TABLE estate_planning_business_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_business_interests"
  ON estate_planning_business_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_business_interests"
  ON estate_planning_business_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_business_interests"
  ON estate_planning_business_interests FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_business_interests"
  ON estate_planning_business_interests FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 21. DIGITAL ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_digital_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT,
  asset_type TEXT,
  platform TEXT,
  description TEXT,
  value DECIMAL(15,2),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_digital_assets_intake_id ON estate_planning_digital_assets(intake_id);
CREATE INDEX idx_ep_digital_assets_user_id ON estate_planning_digital_assets(user_id);

ALTER TABLE estate_planning_digital_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_digital_assets"
  ON estate_planning_digital_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_digital_assets"
  ON estate_planning_digital_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_digital_assets"
  ON estate_planning_digital_assets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_digital_assets"
  ON estate_planning_digital_assets FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 22. SPECIFIC GIFTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_specific_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  relationship TEXT,
  description TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_specific_gifts_intake_id ON estate_planning_specific_gifts(intake_id);
CREATE INDEX idx_ep_specific_gifts_user_id ON estate_planning_specific_gifts(user_id);

ALTER TABLE estate_planning_specific_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_specific_gifts"
  ON estate_planning_specific_gifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_specific_gifts"
  ON estate_planning_specific_gifts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_specific_gifts"
  ON estate_planning_specific_gifts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_specific_gifts"
  ON estate_planning_specific_gifts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 23. CASH GIFTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_cash_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_id TEXT,
  beneficiary_name TEXT NOT NULL,
  relationship TEXT,
  amount TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_cash_gifts_intake_id ON estate_planning_cash_gifts(intake_id);
CREATE INDEX idx_ep_cash_gifts_user_id ON estate_planning_cash_gifts(user_id);

ALTER TABLE estate_planning_cash_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_cash_gifts"
  ON estate_planning_cash_gifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_cash_gifts"
  ON estate_planning_cash_gifts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_cash_gifts"
  ON estate_planning_cash_gifts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_cash_gifts"
  ON estate_planning_cash_gifts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 24. LONG-TERM CARE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_long_term_care (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('client', 'spouse')),

  -- General framing questions
  primary_goals_concerns TEXT,
  ltc_concern_level TEXT,
  previously_met_with_advisor BOOLEAN DEFAULT FALSE,
  advisor_meeting_details TEXT,

  -- Current health and diagnoses
  overall_health TEXT,
  diagnoses TEXT[],
  diagnoses_other TEXT,
  recent_hospitalizations BOOLEAN DEFAULT FALSE,
  hospitalization_details TEXT,
  mobility_limitations TEXT[],
  adl_help TEXT[],
  adl_assistance TEXT,
  iadl_help TEXT[],
  has_dementia BOOLEAN DEFAULT FALSE,
  dementia_stage TEXT,
  family_history_of_conditions BOOLEAN DEFAULT FALSE,
  family_history_details TEXT,

  -- Current living situation
  current_living_situation TEXT,
  living_other TEXT,
  in_ltc_facility BOOLEAN DEFAULT FALSE,
  current_care_level TEXT,
  facility_name TEXT,
  facility_address TEXT,
  facility_start_date TEXT,
  receives_home_help BOOLEAN DEFAULT FALSE,
  home_help_providers TEXT[],
  hours_of_help_per_week TEXT,
  expect_care_increase TEXT,
  care_increase_explanation TEXT,

  -- Five-year care foreseeability
  likelihood_of_ltc_in_5_years TEXT,
  care_preference TEXT,
  care_preference_other TEXT,
  has_specific_provider BOOLEAN DEFAULT FALSE,
  preferred_provider_details TEXT,
  home_supports_needed TEXT[],
  geographic_preferences TEXT,

  -- Caregivers
  primary_caregivers TEXT[],
  caregivers_limited_ability BOOLEAN DEFAULT FALSE,
  caregivers_limited_details TEXT,
  family_conflicts TEXT,

  -- Insurance and benefits
  medicare_types TEXT[],
  has_medigap BOOLEAN DEFAULT FALSE,
  medigap_details TEXT,
  has_ltc_insurance BOOLEAN DEFAULT FALSE,
  ltc_insurance_details TEXT,
  ltc_insurance_company TEXT,
  ltc_insurance_daily_benefit TEXT,
  ltc_insurance_term TEXT,
  ltc_insurance_maximum TEXT,
  ltc_insurance_care_level TEXT,
  current_benefits TEXT[],
  previous_medicaid_application BOOLEAN DEFAULT FALSE,
  medicaid_application_details TEXT,

  -- Finances
  monthly_income TEXT,
  made_gifts_over_5_years BOOLEAN DEFAULT FALSE,
  gifts_details TEXT,
  expecting_windfall BOOLEAN DEFAULT FALSE,
  windfall_details TEXT,

  -- Care setting importance
  care_setting_importance JSONB,

  -- Quality of life
  end_of_life_preferences TEXT,
  important_therapies_activities TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_ltc_intake_id ON estate_planning_long_term_care(intake_id);
CREATE INDEX idx_ep_ltc_user_id ON estate_planning_long_term_care(user_id);
CREATE INDEX idx_ep_ltc_person_type ON estate_planning_long_term_care(person_type);
CREATE UNIQUE INDEX idx_ep_ltc_intake_person ON estate_planning_long_term_care(intake_id, person_type);

CREATE TRIGGER update_estate_planning_ltc_updated_at
  BEFORE UPDATE ON estate_planning_long_term_care
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE estate_planning_long_term_care ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_long_term_care"
  ON estate_planning_long_term_care FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_long_term_care"
  ON estate_planning_long_term_care FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_long_term_care"
  ON estate_planning_long_term_care FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_long_term_care"
  ON estate_planning_long_term_care FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 25. CURRENT ESTATE PLAN TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_current_estate_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('client', 'spouse')),

  -- Document existence
  has_will BOOLEAN DEFAULT FALSE,
  has_trust BOOLEAN DEFAULT FALSE,
  is_joint_trust BOOLEAN DEFAULT FALSE,
  has_irrevocable_trust BOOLEAN DEFAULT FALSE,
  is_joint_irrevocable_trust BOOLEAN DEFAULT FALSE,
  has_financial_poa BOOLEAN DEFAULT FALSE,
  has_health_care_poa BOOLEAN DEFAULT FALSE,
  has_living_will BOOLEAN DEFAULT FALSE,
  has_none BOOLEAN DEFAULT FALSE,

  -- Per-document details
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

  -- Legacy fields
  document_state TEXT,
  document_date TEXT,
  review_option TEXT,

  -- Uploaded files
  uploaded_files TEXT[],
  will_uploaded_files TEXT[],
  trust_uploaded_files TEXT[],
  irrevocable_trust_uploaded_files TEXT[],
  financial_poa_uploaded_files TEXT[],
  health_care_poa_uploaded_files TEXT[],
  living_will_uploaded_files TEXT[],

  -- Legacy fiduciary fields
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
  is_hipaa_compliant BOOLEAN DEFAULT FALSE,
  has_dnr_order BOOLEAN DEFAULT FALSE,
  has_living_will_document BOOLEAN DEFAULT FALSE,

  -- Specific gifts (JSONB arrays)
  will_specific_real_estate_gifts JSONB,
  will_specific_asset_gifts JSONB,
  will_general_money_gifts JSONB,
  trust_specific_real_estate_gifts JSONB,
  trust_specific_asset_gifts JSONB,
  trust_general_money_gifts JSONB,

  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_cep_intake_id ON estate_planning_current_estate_plan(intake_id);
CREATE INDEX idx_ep_cep_user_id ON estate_planning_current_estate_plan(user_id);
CREATE INDEX idx_ep_cep_person_type ON estate_planning_current_estate_plan(person_type);
CREATE UNIQUE INDEX idx_ep_cep_intake_person ON estate_planning_current_estate_plan(intake_id, person_type);

CREATE TRIGGER update_estate_planning_cep_updated_at
  BEFORE UPDATE ON estate_planning_current_estate_plan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE estate_planning_current_estate_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_current_estate_plan"
  ON estate_planning_current_estate_plan FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_current_estate_plan"
  ON estate_planning_current_estate_plan FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_current_estate_plan"
  ON estate_planning_current_estate_plan FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_current_estate_plan"
  ON estate_planning_current_estate_plan FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 26. DISTRIBUTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_distribution_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('client', 'spouse')),
  distribution_type TEXT,
  is_sweetheart_plan BOOLEAN DEFAULT TRUE,
  has_specific_gifts BOOLEAN DEFAULT FALSE,
  specific_asset_gifts JSONB,
  cash_gifts JSONB,
  residuary_beneficiaries JSONB,
  residuary_share_type TEXT DEFAULT 'equal',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_dist_plans_intake_id ON estate_planning_distribution_plans(intake_id);
CREATE INDEX idx_ep_dist_plans_user_id ON estate_planning_distribution_plans(user_id);
CREATE INDEX idx_ep_dist_plans_person_type ON estate_planning_distribution_plans(person_type);
CREATE UNIQUE INDEX idx_ep_dist_plans_intake_person ON estate_planning_distribution_plans(intake_id, person_type);

CREATE TRIGGER update_estate_planning_dist_plans_updated_at
  BEFORE UPDATE ON estate_planning_distribution_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE estate_planning_distribution_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_distribution_plans"
  ON estate_planning_distribution_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_distribution_plans"
  ON estate_planning_distribution_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_distribution_plans"
  ON estate_planning_distribution_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_distribution_plans"
  ON estate_planning_distribution_plans FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 27. CLIENT INCOME SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_client_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  amount TEXT DEFAULT '',
  frequency TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_client_income_intake_id ON estate_planning_client_income(intake_id);
CREATE INDEX idx_ep_client_income_user_id ON estate_planning_client_income(user_id);

ALTER TABLE estate_planning_client_income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_client_income"
  ON estate_planning_client_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_client_income"
  ON estate_planning_client_income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_client_income"
  ON estate_planning_client_income FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_client_income"
  ON estate_planning_client_income FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 28. SPOUSE INCOME SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_spouse_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  amount TEXT DEFAULT '',
  frequency TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ep_spouse_income_intake_id ON estate_planning_spouse_income(intake_id);
CREATE INDEX idx_ep_spouse_income_user_id ON estate_planning_spouse_income(user_id);

ALTER TABLE estate_planning_spouse_income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_spouse_income"
  ON estate_planning_spouse_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_spouse_income"
  ON estate_planning_spouse_income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_spouse_income"
  ON estate_planning_spouse_income FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_spouse_income"
  ON estate_planning_spouse_income FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 29. CLIENT MEDICAL INSURANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_client_medical_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicare_part_b_deduction TEXT DEFAULT '',
  medicare_coverage_type TEXT DEFAULT '',
  medicare_plan_name TEXT DEFAULT '',
  medicare_coverage_cost TEXT DEFAULT '',
  private_insurance_description TEXT DEFAULT '',
  private_insurance_cost TEXT DEFAULT '',
  other_insurance_description TEXT DEFAULT '',
  other_insurance_cost TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_client_medical_insurance_per_intake UNIQUE (intake_id)
);

CREATE INDEX idx_ep_client_medical_insurance_intake_id ON estate_planning_client_medical_insurance(intake_id);
CREATE INDEX idx_ep_client_medical_insurance_user_id ON estate_planning_client_medical_insurance(user_id);

ALTER TABLE estate_planning_client_medical_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_client_medical_insurance"
  ON estate_planning_client_medical_insurance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_client_medical_insurance"
  ON estate_planning_client_medical_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_client_medical_insurance"
  ON estate_planning_client_medical_insurance FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_client_medical_insurance"
  ON estate_planning_client_medical_insurance FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 30. SPOUSE MEDICAL INSURANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_spouse_medical_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicare_part_b_deduction TEXT DEFAULT '',
  medicare_coverage_type TEXT DEFAULT '',
  medicare_plan_name TEXT DEFAULT '',
  medicare_coverage_cost TEXT DEFAULT '',
  private_insurance_description TEXT DEFAULT '',
  private_insurance_cost TEXT DEFAULT '',
  other_insurance_description TEXT DEFAULT '',
  other_insurance_cost TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_spouse_medical_insurance_per_intake UNIQUE (intake_id)
);

CREATE INDEX idx_ep_spouse_medical_insurance_intake_id ON estate_planning_spouse_medical_insurance(intake_id);
CREATE INDEX idx_ep_spouse_medical_insurance_user_id ON estate_planning_spouse_medical_insurance(user_id);

ALTER TABLE estate_planning_spouse_medical_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estate_planning_spouse_medical_insurance"
  ON estate_planning_spouse_medical_insurance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_spouse_medical_insurance"
  ON estate_planning_spouse_medical_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_spouse_medical_insurance"
  ON estate_planning_spouse_medical_insurance FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_spouse_medical_insurance"
  ON estate_planning_spouse_medical_insurance FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 31. IRA REQUIRED MINIMUM DISTRIBUTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ira_rmds (
  id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL UNIQUE,
  distribution_period DECIMAL(4,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ira_rmds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ira_rmds"
  ON ira_rmds FOR SELECT TO public USING (true);

CREATE INDEX IF NOT EXISTS idx_ira_rmds_age ON ira_rmds(age);

INSERT INTO ira_rmds (age, distribution_period) VALUES
  (73, 26.5), (74, 25.5), (75, 24.6), (76, 23.7), (77, 22.9),
  (78, 22.0), (79, 21.1), (80, 20.2), (81, 19.4), (82, 18.5),
  (83, 17.7), (84, 16.8), (85, 16.0), (86, 15.2), (87, 14.4),
  (88, 13.7), (89, 12.9), (90, 12.2), (91, 11.5), (92, 10.8),
  (93, 10.1), (94, 9.5), (95, 8.9), (96, 8.4), (97, 7.8),
  (98, 7.3), (99, 6.8), (100, 6.4), (101, 6.0), (102, 5.6),
  (103, 5.2), (104, 4.9), (105, 4.6), (106, 4.3), (107, 4.1),
  (108, 3.9), (109, 3.7), (110, 3.5), (111, 3.4), (112, 3.3),
  (113, 3.1), (114, 3.0), (115, 2.9), (116, 2.8), (117, 2.7),
  (118, 2.5), (119, 2.3), (120, 2.0)
ON CONFLICT (age) DO UPDATE SET distribution_period = EXCLUDED.distribution_period;

-- ============================================================================
-- 32. STORAGE BUCKET FOR ESTATE PLANNING INTAKES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'estate-planning-intakes',
  'estate-planning-intakes',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'estate-planning-intakes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'estate-planning-intakes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'estate-planning-intakes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'estate-planning-intakes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'estate-planning-intakes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- DONE! All tables, indexes, RLS policies, triggers, and seed data created.
-- ============================================================================
