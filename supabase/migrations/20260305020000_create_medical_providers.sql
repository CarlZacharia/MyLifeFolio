-- ============================================================================
-- MEDICAL PROVIDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_medical_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_category TEXT NOT NULL, -- clientPCP, clientSpecialist, spousePCP, spouseSpecialist
  specialist_type TEXT,
  name TEXT,
  firm_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_medical_providers_intake_id ON folio_medical_providers(intake_id);
CREATE INDEX IF NOT EXISTS idx_folio_medical_providers_user_id ON folio_medical_providers(user_id);

ALTER TABLE folio_medical_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_medical_providers" ON folio_medical_providers;
CREATE POLICY "Users can view own folio_medical_providers"
  ON folio_medical_providers FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folio_medical_providers" ON folio_medical_providers;
CREATE POLICY "Users can insert own folio_medical_providers"
  ON folio_medical_providers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folio_medical_providers" ON folio_medical_providers;
CREATE POLICY "Users can update own folio_medical_providers"
  ON folio_medical_providers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folio_medical_providers" ON folio_medical_providers;
CREATE POLICY "Users can delete own folio_medical_providers"
  ON folio_medical_providers FOR DELETE USING (auth.uid() = user_id);
