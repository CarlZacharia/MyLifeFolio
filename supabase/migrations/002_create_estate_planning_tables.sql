-- Migration: Create normalized tables for Estate Planning intake data
-- These tables provide structured access to specific data entities

-- ============================================================================
-- MAIN INTAKE TABLE (header record)
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

-- Create indexes
CREATE INDEX idx_ep_intakes_user_id ON estate_planning_intakes(user_id);
CREATE INDEX idx_ep_intakes_client_name ON estate_planning_intakes(client_name);
CREATE INDEX idx_ep_intakes_created_at ON estate_planning_intakes(created_at DESC);
CREATE INDEX idx_ep_intakes_intake_raw_id ON estate_planning_intakes(intake_raw_id);

-- Create trigger for updated_at
CREATE TRIGGER update_estate_planning_intakes_updated_at
  BEFORE UPDATE ON estate_planning_intakes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE estate_planning_intakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own estate_planning_intakes"
  ON estate_planning_intakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estate_planning_intakes"
  ON estate_planning_intakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estate_planning_intakes"
  ON estate_planning_intakes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own estate_planning_intakes"
  ON estate_planning_intakes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CHILDREN TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  address TEXT,
  birth_date TEXT,
  age TEXT,
  relationship TEXT, -- 'Son of Client', 'Daughter of Spouse', 'Son of Both', etc.
  marital_status TEXT,
  has_children BOOLEAN DEFAULT FALSE,
  number_of_children INTEGER DEFAULT 0,
  has_minor_children BOOLEAN DEFAULT FALSE,
  distribution_type TEXT, -- 'Per Stirpes' or 'Per Capita'
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
-- OTHER BENEFICIARIES TABLE
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
-- CHARITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  address TEXT,
  amount TEXT, -- Can be dollar amount or percentage

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
-- DEPENDENTS TABLE
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
-- REAL ESTATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_real_estate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  owner TEXT, -- 'Client', 'Spouse', 'Client and Spouse', etc.
  ownership_form TEXT, -- 'Sole', 'Tenants by Entirety', 'JTWROS', etc.
  category TEXT, -- 'Primary residence', 'Vacation home', etc.
  show_beneficiaries BOOLEAN DEFAULT FALSE,
  show_other BOOLEAN DEFAULT FALSE,
  joint_owner_beneficiaries TEXT[], -- Array of beneficiary names
  joint_owner_other TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  value DECIMAL(15,2),
  mortgage_balance DECIMAL(15,2),
  cost_basis DECIMAL(15,2),
  primary_beneficiaries TEXT[], -- For remainder interest
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
-- BANK ACCOUNTS TABLE
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
-- NON-QUALIFIED INVESTMENTS TABLE
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
-- RETIREMENT ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_retirement_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  owner TEXT,
  institution TEXT,
  account_type TEXT, -- '401(k)', 'IRA', 'Roth IRA', 'Pension', etc.
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
-- LIFE INSURANCE TABLE
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
-- VEHICLES TABLE
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
-- OTHER ASSETS TABLE
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
-- BUSINESS INTERESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_business_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  owner TEXT,
  business_name TEXT,
  entity_type TEXT, -- 'LLC', 'S-Corp', 'C-Corp', 'Partnership', 'Sole Proprietorship'
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
-- DIGITAL ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_digital_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  owner TEXT,
  asset_type TEXT, -- 'Cryptocurrency', 'Domain Names', 'Social Media', etc.
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
-- SPECIFIC GIFTS TABLE
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
-- CASH GIFTS TO BENEFICIARIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_cash_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  beneficiary_id TEXT, -- Reference like 'child-0', 'beneficiary-1', etc.
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

-- Add comments
COMMENT ON TABLE estate_planning_intakes IS 'Main intake record for estate planning clients';
COMMENT ON TABLE estate_planning_children IS 'Children of the client/spouse';
COMMENT ON TABLE estate_planning_beneficiaries IS 'Other beneficiaries (grandchildren, friends, etc.)';
COMMENT ON TABLE estate_planning_charities IS 'Charitable beneficiaries';
COMMENT ON TABLE estate_planning_real_estate IS 'Real estate holdings';
COMMENT ON TABLE estate_planning_bank_accounts IS 'Bank accounts (checking, savings, CDs, money market)';
COMMENT ON TABLE estate_planning_investments IS 'Non-qualified investment accounts';
COMMENT ON TABLE estate_planning_retirement_accounts IS 'Retirement accounts (401k, IRA, pension, etc.)';
COMMENT ON TABLE estate_planning_life_insurance IS 'Life insurance policies';
COMMENT ON TABLE estate_planning_vehicles IS 'Vehicles (cars, boats, RVs, etc.)';
COMMENT ON TABLE estate_planning_other_assets IS 'Other assets including personal property';
COMMENT ON TABLE estate_planning_business_interests IS 'Business ownership interests';
COMMENT ON TABLE estate_planning_digital_assets IS 'Digital assets (crypto, domains, etc.)';
COMMENT ON TABLE estate_planning_specific_gifts IS 'Specific gifts of items to named beneficiaries';
COMMENT ON TABLE estate_planning_cash_gifts IS 'Cash bequests to beneficiaries';
