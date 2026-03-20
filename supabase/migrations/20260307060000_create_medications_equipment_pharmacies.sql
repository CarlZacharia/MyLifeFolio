-- Architecture Decision: Option C (Hybrid)
-- Dedicated tables for medications, medical equipment, and pharmacies,
-- integrated through FormContext + supabaseIntake.ts save system.
-- This matches the pattern used by folio_medical_providers, folio_advisors,
-- folio_expenses, folio_insurance_coverage, and other normalized tables.
-- Each table uses intake_id + user_id + sort_order for consistency.

-- ============================================================
-- PHARMACIES (created first — referenced by medications)
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_name TEXT NOT NULL,
  pharmacy_chain TEXT,
  phone TEXT,
  fax TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  hours TEXT,
  pharmacist_name TEXT,
  account_number TEXT,
  specialty BOOLEAN DEFAULT FALSE,
  mail_order BOOLEAN DEFAULT FALSE,
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_pharmacies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pharmacies" ON folio_pharmacies;
CREATE POLICY "Users can view own pharmacies"
  ON folio_pharmacies FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own pharmacies" ON folio_pharmacies;
CREATE POLICY "Users can insert own pharmacies"
  ON folio_pharmacies FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own pharmacies" ON folio_pharmacies;
CREATE POLICY "Users can update own pharmacies"
  ON folio_pharmacies FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own pharmacies" ON folio_pharmacies;
CREATE POLICY "Users can delete own pharmacies"
  ON folio_pharmacies FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MEDICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  form TEXT,
  frequency TEXT,
  frequency_notes TEXT,
  prescribing_physician TEXT,
  condition_treated TEXT,
  pharmacy_index INTEGER, -- index into user's pharmacies array (for FormContext linkage)
  rx_number TEXT,
  refills_remaining INTEGER,
  last_filled_date DATE,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  ndc_number TEXT,
  requires_refrigeration BOOLEAN DEFAULT FALSE,
  controlled_substance BOOLEAN DEFAULT FALSE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own medications" ON folio_medications;
CREATE POLICY "Users can view own medications"
  ON folio_medications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own medications" ON folio_medications;
CREATE POLICY "Users can insert own medications"
  ON folio_medications FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own medications" ON folio_medications;
CREATE POLICY "Users can update own medications"
  ON folio_medications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own medications" ON folio_medications;
CREATE POLICY "Users can delete own medications"
  ON folio_medications FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MEDICAL EQUIPMENT & DEVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_medical_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT,
  make_model TEXT,
  serial_number TEXT,
  prescribing_physician TEXT,
  supplier_name TEXT,
  supplier_phone TEXT,
  supplier_address TEXT,
  supplier_website TEXT,
  date_obtained DATE,
  warranty_expiration DATE,
  next_service_date DATE,
  maintenance_notes TEXT,
  battery_type TEXT,
  insurance_covers BOOLEAN DEFAULT FALSE,
  insurance_info TEXT,
  replacement_cost TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_medical_equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own medical equipment" ON folio_medical_equipment;
CREATE POLICY "Users can view own medical equipment"
  ON folio_medical_equipment FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own medical equipment" ON folio_medical_equipment;
CREATE POLICY "Users can insert own medical equipment"
  ON folio_medical_equipment FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own medical equipment" ON folio_medical_equipment;
CREATE POLICY "Users can update own medical equipment"
  ON folio_medical_equipment FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own medical equipment" ON folio_medical_equipment;
CREATE POLICY "Users can delete own medical equipment"
  ON folio_medical_equipment FOR DELETE USING (auth.uid() = user_id);
