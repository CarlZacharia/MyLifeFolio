-- Medical Conditions section: Conditions, Allergies, Surgeries, Basic Info
-- Same architecture as medications/equipment/pharmacies:
-- Dedicated tables integrated through FormContext + supabaseIntake.ts

-- ============================================================
-- MEDICAL CONDITIONS / CHRONIC DIAGNOSES
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  diagnosed_date TEXT, -- month/year format, stored as text
  treating_physician TEXT,
  status TEXT, -- Active, In Remission, Resolved
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_medical_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own medical conditions" ON folio_medical_conditions;
CREATE POLICY "Users can view own medical conditions"
  ON folio_medical_conditions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own medical conditions" ON folio_medical_conditions;
CREATE POLICY "Users can insert own medical conditions"
  ON folio_medical_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own medical conditions" ON folio_medical_conditions;
CREATE POLICY "Users can update own medical conditions"
  ON folio_medical_conditions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own medical conditions" ON folio_medical_conditions;
CREATE POLICY "Users can delete own medical conditions"
  ON folio_medical_conditions FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ALLERGIES
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  allergy_type TEXT, -- Medication, Food, Environmental, Material/Contact, Other
  reaction TEXT,
  severity TEXT, -- Mild, Moderate, Severe / Anaphylactic
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_allergies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own allergies" ON folio_allergies;
CREATE POLICY "Users can view own allergies"
  ON folio_allergies FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own allergies" ON folio_allergies;
CREATE POLICY "Users can insert own allergies"
  ON folio_allergies FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own allergies" ON folio_allergies;
CREATE POLICY "Users can update own allergies"
  ON folio_allergies FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own allergies" ON folio_allergies;
CREATE POLICY "Users can delete own allergies"
  ON folio_allergies FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PAST SURGERIES & HOSPITALIZATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_surgeries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  procedure_type TEXT, -- Surgery, Hospitalization, Procedure/Outpatient, Other
  procedure_date TEXT, -- month/year format, stored as text
  facility TEXT,
  surgeon_physician TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_surgeries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own surgeries" ON folio_surgeries;
CREATE POLICY "Users can view own surgeries"
  ON folio_surgeries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own surgeries" ON folio_surgeries;
CREATE POLICY "Users can insert own surgeries"
  ON folio_surgeries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own surgeries" ON folio_surgeries;
CREATE POLICY "Users can update own surgeries"
  ON folio_surgeries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own surgeries" ON folio_surgeries;
CREATE POLICY "Users can delete own surgeries"
  ON folio_surgeries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- BLOOD TYPE & BASIC VITALS (single record per intake)
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_basic_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_type TEXT, -- A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown
  height TEXT,
  weight TEXT,
  as_of_date TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_basic_vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own basic vitals" ON folio_basic_vitals;
CREATE POLICY "Users can view own basic vitals"
  ON folio_basic_vitals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own basic vitals" ON folio_basic_vitals;
CREATE POLICY "Users can insert own basic vitals"
  ON folio_basic_vitals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own basic vitals" ON folio_basic_vitals;
CREATE POLICY "Users can update own basic vitals"
  ON folio_basic_vitals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own basic vitals" ON folio_basic_vitals;
CREATE POLICY "Users can delete own basic vitals"
  ON folio_basic_vitals FOR DELETE USING (auth.uid() = user_id);
