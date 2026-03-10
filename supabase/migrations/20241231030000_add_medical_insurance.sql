-- Migration: Add medical insurance fields for client and spouse
-- This stores medical insurance information including Medicare Part B, Medicare coverage type,
-- private insurance, and other insurance with associated monthly costs.

-- ============================================================================
-- CLIENT MEDICAL INSURANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_client_medical_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  medicare_part_b_deduction TEXT DEFAULT '',  -- Monthly Medicare Part B deduction amount
  medicare_coverage_type TEXT DEFAULT '',     -- 'Medicare Advantage', 'Medicare Supplement', or ''
  medicare_plan_name TEXT DEFAULT '',         -- Name of the Medicare plan
  medicare_coverage_cost TEXT DEFAULT '',     -- Monthly cost for Medicare Advantage or Supplement

  private_insurance_description TEXT DEFAULT '',  -- Description of private insurance
  private_insurance_cost TEXT DEFAULT '',         -- Monthly cost

  other_insurance_description TEXT DEFAULT '',    -- Description of other insurance
  other_insurance_cost TEXT DEFAULT '',           -- Monthly cost

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_client_medical_insurance_per_intake UNIQUE (intake_id)
);

CREATE INDEX IF NOT EXISTS idx_ep_client_medical_insurance_intake_id ON folio_client_medical_insurance(intake_id);
CREATE INDEX IF NOT EXISTS idx_ep_client_medical_insurance_user_id ON folio_client_medical_insurance(user_id);

ALTER TABLE folio_client_medical_insurance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_client_medical_insurance" ON folio_client_medical_insurance;
CREATE POLICY "Users can view own folio_client_medical_insurance"
  ON folio_client_medical_insurance FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own folio_client_medical_insurance" ON folio_client_medical_insurance;
CREATE POLICY "Users can insert own folio_client_medical_insurance"
  ON folio_client_medical_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own folio_client_medical_insurance" ON folio_client_medical_insurance;
CREATE POLICY "Users can update own folio_client_medical_insurance"
  ON folio_client_medical_insurance FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own folio_client_medical_insurance" ON folio_client_medical_insurance;
CREATE POLICY "Users can delete own folio_client_medical_insurance"
  ON folio_client_medical_insurance FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE folio_client_medical_insurance IS 'Medical insurance information for the client';
COMMENT ON COLUMN folio_client_medical_insurance.medicare_part_b_deduction IS 'Monthly Medicare Part B deduction amount';
COMMENT ON COLUMN folio_client_medical_insurance.medicare_coverage_type IS 'Type of Medicare coverage: Medicare Advantage, Medicare Supplement, or empty';
COMMENT ON COLUMN folio_client_medical_insurance.medicare_plan_name IS 'Name of the Medicare plan';
COMMENT ON COLUMN folio_client_medical_insurance.medicare_coverage_cost IS 'Monthly cost for Medicare Advantage or Medicare Supplement plan';
COMMENT ON COLUMN folio_client_medical_insurance.private_insurance_description IS 'Description of private insurance coverage (e.g., employer-provided, Blue Cross)';
COMMENT ON COLUMN folio_client_medical_insurance.private_insurance_cost IS 'Monthly cost for private insurance';
COMMENT ON COLUMN folio_client_medical_insurance.other_insurance_description IS 'Description of other insurance (e.g., VA benefits, Medicaid)';
COMMENT ON COLUMN folio_client_medical_insurance.other_insurance_cost IS 'Monthly cost for other insurance';

-- ============================================================================
-- SPOUSE MEDICAL INSURANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_spouse_medical_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  medicare_part_b_deduction TEXT DEFAULT '',  -- Monthly Medicare Part B deduction amount
  medicare_coverage_type TEXT DEFAULT '',     -- 'Medicare Advantage', 'Medicare Supplement', or ''
  medicare_plan_name TEXT DEFAULT '',         -- Name of the Medicare plan
  medicare_coverage_cost TEXT DEFAULT '',     -- Monthly cost for Medicare Advantage or Supplement

  private_insurance_description TEXT DEFAULT '',  -- Description of private insurance
  private_insurance_cost TEXT DEFAULT '',         -- Monthly cost

  other_insurance_description TEXT DEFAULT '',    -- Description of other insurance
  other_insurance_cost TEXT DEFAULT '',           -- Monthly cost

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_spouse_medical_insurance_per_intake UNIQUE (intake_id)
);

CREATE INDEX IF NOT EXISTS idx_ep_spouse_medical_insurance_intake_id ON folio_spouse_medical_insurance(intake_id);
CREATE INDEX IF NOT EXISTS idx_ep_spouse_medical_insurance_user_id ON folio_spouse_medical_insurance(user_id);

ALTER TABLE folio_spouse_medical_insurance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_spouse_medical_insurance" ON folio_spouse_medical_insurance;
CREATE POLICY "Users can view own folio_spouse_medical_insurance"
  ON folio_spouse_medical_insurance FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own folio_spouse_medical_insurance" ON folio_spouse_medical_insurance;
CREATE POLICY "Users can insert own folio_spouse_medical_insurance"
  ON folio_spouse_medical_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own folio_spouse_medical_insurance" ON folio_spouse_medical_insurance;
CREATE POLICY "Users can update own folio_spouse_medical_insurance"
  ON folio_spouse_medical_insurance FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own folio_spouse_medical_insurance" ON folio_spouse_medical_insurance;
CREATE POLICY "Users can delete own folio_spouse_medical_insurance"
  ON folio_spouse_medical_insurance FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE folio_spouse_medical_insurance IS 'Medical insurance information for the spouse';
COMMENT ON COLUMN folio_spouse_medical_insurance.medicare_part_b_deduction IS 'Monthly Medicare Part B deduction amount';
COMMENT ON COLUMN folio_spouse_medical_insurance.medicare_coverage_type IS 'Type of Medicare coverage: Medicare Advantage, Medicare Supplement, or empty';
COMMENT ON COLUMN folio_spouse_medical_insurance.medicare_plan_name IS 'Name of the Medicare plan';
COMMENT ON COLUMN folio_spouse_medical_insurance.medicare_coverage_cost IS 'Monthly cost for Medicare Advantage or Medicare Supplement plan';
COMMENT ON COLUMN folio_spouse_medical_insurance.private_insurance_description IS 'Description of private insurance coverage (e.g., employer-provided, Blue Cross)';
COMMENT ON COLUMN folio_spouse_medical_insurance.private_insurance_cost IS 'Monthly cost for private insurance';
COMMENT ON COLUMN folio_spouse_medical_insurance.other_insurance_description IS 'Description of other insurance (e.g., VA benefits, Medicaid)';
COMMENT ON COLUMN folio_spouse_medical_insurance.other_insurance_cost IS 'Monthly cost for other insurance';
