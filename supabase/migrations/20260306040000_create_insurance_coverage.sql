-- ============================================================================
-- INSURANCE COVERAGE TABLE (non-medical: vehicle, homeowner's, LTC, disability, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_insurance_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person TEXT NOT NULL, -- 'client' or 'spouse'
  coverage_type TEXT NOT NULL, -- 'Vehicle', 'Homeowners', 'Long-Term Care', 'Disability', 'Life', 'Umbrella', 'Other'
  policy_no TEXT,
  provider TEXT,
  annual_cost NUMERIC(12,2),
  contact_name TEXT,
  contact_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  -- Vehicle-specific fields
  liability_limits TEXT,
  has_collision BOOLEAN DEFAULT FALSE,
  has_comprehensive BOOLEAN DEFAULT FALSE,
  comprehensive_deductible NUMERIC(12,2),
  uninsured_amount TEXT,
  underinsured_amount TEXT,
  medical_payments_amount TEXT,
  has_rental_insurance BOOLEAN DEFAULT FALSE,
  -- Homeowner's-specific fields
  ho_policy_type TEXT, -- 'HO-3', 'HO-5', 'HO-6 Condo', 'HO-4 Renters', 'HO-8 Older Home', 'Dwelling Fire'
  effective_date DATE,
  expiration_date DATE,
  auto_renewal BOOLEAN DEFAULT FALSE,
  property_covered TEXT,
  coverage_amounts TEXT,
  deductibles TEXT,
  hurricane_wind_deductible TEXT,
  has_scheduled_personal_property BOOLEAN DEFAULT FALSE,
  scheduled_personal_property_limit TEXT,
  has_fine_arts_rider BOOLEAN DEFAULT FALSE,
  has_home_business_endorsement BOOLEAN DEFAULT FALSE,
  has_water_backup BOOLEAN DEFAULT FALSE,
  water_backup_limit TEXT,
  has_service_line_coverage BOOLEAN DEFAULT FALSE,
  has_equipment_breakdown BOOLEAN DEFAULT FALSE,
  has_identity_theft_coverage BOOLEAN DEFAULT FALSE,
  -- Long-Term Care-specific fields
  ltc_insured_name TEXT,
  ltc_issue_date DATE,
  ltc_policy_status TEXT, -- 'Active', 'Lapsed', 'Paid-Up', 'Claim in Progress'
  ltc_daily_benefit_amount NUMERIC(12,2),
  ltc_monthly_benefit_amount NUMERIC(12,2),
  ltc_benefit_period TEXT, -- '2 Years', '3 Years', '5 Years', 'Unlimited'
  ltc_max_lifetime_benefit_pool NUMERIC(14,2),
  ltc_inflation_protection_type TEXT, -- 'None', 'Simple 3%', 'Compound 3%', 'Compound 5%', 'CPI-Linked', 'Future Purchase Option'
  ltc_current_benefit_after_inflation TEXT,
  ltc_shared_care_rider BOOLEAN DEFAULT FALSE,
  ltc_elimination_period TEXT, -- '0 Days', '30 Days', '60 Days', '90 Days', '180 Days'
  ltc_covers_nursing_facility BOOLEAN DEFAULT FALSE,
  ltc_covers_assisted_living BOOLEAN DEFAULT FALSE,
  ltc_covers_memory_care BOOLEAN DEFAULT FALSE,
  ltc_covers_adult_day_care BOOLEAN DEFAULT FALSE,
  ltc_covers_home_health_care BOOLEAN DEFAULT FALSE,
  ltc_covers_hospice BOOLEAN DEFAULT FALSE,
  ltc_covers_family_caregiver BOOLEAN DEFAULT FALSE,
  ltc_has_bed_reservation BOOLEAN DEFAULT FALSE,
  ltc_bed_reservation_days INTEGER,
  ltc_annual_premium NUMERIC(12,2),
  -- Umbrella-specific fields
  umb_policy_type TEXT, -- 'Personal Umbrella', 'Commercial Umbrella', 'Excess Liability'
  umb_effective_date DATE,
  umb_expiration_date DATE,
  umb_limit TEXT, -- '$1,000,000', '$2,000,000', '$5,000,000', '$10,000,000', 'Other'
  umb_limit_other TEXT,
  umb_self_insured_retention TEXT,
  umb_auto_liability_required TEXT,
  umb_homeowners_liability_required TEXT,
  umb_has_watercraft_required BOOLEAN DEFAULT FALSE,
  umb_watercraft_limit TEXT,
  umb_has_rental_property_required BOOLEAN DEFAULT FALSE,
  umb_rental_property_limit TEXT,
  umb_other_underlying_policies TEXT,
  umb_all_same_carrier BOOLEAN DEFAULT FALSE,
  umb_named_insured TEXT,
  umb_additional_insureds TEXT,
  umb_annual_premium NUMERIC(12,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_insurance_coverage_intake_id ON folio_insurance_coverage(intake_id);
CREATE INDEX IF NOT EXISTS idx_folio_insurance_coverage_user_id ON folio_insurance_coverage(user_id);

ALTER TABLE folio_insurance_coverage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_insurance_coverage" ON folio_insurance_coverage;
CREATE POLICY "Users can view own folio_insurance_coverage"
  ON folio_insurance_coverage FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folio_insurance_coverage" ON folio_insurance_coverage;
CREATE POLICY "Users can insert own folio_insurance_coverage"
  ON folio_insurance_coverage FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folio_insurance_coverage" ON folio_insurance_coverage;
CREATE POLICY "Users can update own folio_insurance_coverage"
  ON folio_insurance_coverage FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folio_insurance_coverage" ON folio_insurance_coverage;
CREATE POLICY "Users can delete own folio_insurance_coverage"
  ON folio_insurance_coverage FOR DELETE USING (auth.uid() = user_id);
