-- ============================================================================
-- MEDICAL INSURANCE POLICIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_medical_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person TEXT NOT NULL, -- 'client' or 'spouse'
  insurance_type TEXT,
  policy_no TEXT,
  provider TEXT,
  paid_by TEXT,
  monthly_cost NUMERIC(12,2),
  contact_name TEXT,
  contact_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_website TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_folio_medical_insurance_intake_id ON folio_medical_insurance(intake_id);
CREATE INDEX idx_folio_medical_insurance_user_id ON folio_medical_insurance(user_id);

ALTER TABLE folio_medical_insurance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_medical_insurance" ON folio_medical_insurance;
CREATE POLICY "Users can view own folio_medical_insurance"
  ON folio_medical_insurance FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folio_medical_insurance" ON folio_medical_insurance;
CREATE POLICY "Users can insert own folio_medical_insurance"
  ON folio_medical_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folio_medical_insurance" ON folio_medical_insurance;
CREATE POLICY "Users can update own folio_medical_insurance"
  ON folio_medical_insurance FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folio_medical_insurance" ON folio_medical_insurance;
CREATE POLICY "Users can delete own folio_medical_insurance"
  ON folio_medical_insurance FOR DELETE USING (auth.uid() = user_id);
