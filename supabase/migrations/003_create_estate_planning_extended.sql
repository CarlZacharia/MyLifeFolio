-- Migration: Create extended tables for Long-Term Care and Current Estate Plan data
-- These store the more complex nested data structures

-- ============================================================================
-- LONG-TERM CARE TABLE (for both client and spouse)
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
  diagnoses TEXT[], -- Array of diagnoses
  diagnoses_other TEXT,
  recent_hospitalizations BOOLEAN DEFAULT FALSE,
  hospitalization_details TEXT,
  mobility_limitations TEXT[],
  adl_help TEXT[], -- Activities of Daily Living
  adl_assistance TEXT,
  iadl_help TEXT[], -- Instrumental ADLs
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

  -- Care setting importance (stored as JSONB)
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
-- CURRENT ESTATE PLAN TABLE (for both client and spouse)
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

  -- Uploaded files (stored as arrays of file references)
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

  -- Specific gifts (stored as JSONB arrays)
  will_specific_real_estate_gifts JSONB,
  will_specific_asset_gifts JSONB,
  will_general_money_gifts JSONB,
  trust_specific_real_estate_gifts JSONB,
  trust_specific_asset_gifts JSONB,
  trust_general_money_gifts JSONB,

  -- Comments
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
-- DISTRIBUTION PLANS TABLE (for client and spouse Will/Trust distribution)
-- ============================================================================
CREATE TABLE IF NOT EXISTS estate_planning_distribution_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES estate_planning_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('client', 'spouse')),

  distribution_type TEXT, -- 'sweetheart', 'spouseFirstDiffering', 'custom'
  is_sweetheart_plan BOOLEAN DEFAULT TRUE,
  has_specific_gifts BOOLEAN DEFAULT FALSE,
  specific_asset_gifts JSONB, -- Array of AssetGift objects
  cash_gifts JSONB, -- Array of CashGift objects
  residuary_beneficiaries JSONB, -- Array of ResiduaryBeneficiary objects
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

-- Add comments
COMMENT ON TABLE estate_planning_long_term_care IS 'Long-term care planning data for client and spouse';
COMMENT ON TABLE estate_planning_current_estate_plan IS 'Current estate planning documents for client and spouse';
COMMENT ON TABLE estate_planning_distribution_plans IS 'Will/Trust distribution plans for client and spouse';
