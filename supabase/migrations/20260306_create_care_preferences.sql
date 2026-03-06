-- ============================================================================
-- CARE PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_care_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  preference_item TEXT NOT NULL,
  response TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_care_preferences_intake_id ON folio_care_preferences(intake_id);
CREATE INDEX IF NOT EXISTS idx_folio_care_preferences_user_id ON folio_care_preferences(user_id);

ALTER TABLE folio_care_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_care_preferences" ON folio_care_preferences;
CREATE POLICY "Users can view own folio_care_preferences"
  ON folio_care_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folio_care_preferences" ON folio_care_preferences;
CREATE POLICY "Users can insert own folio_care_preferences"
  ON folio_care_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folio_care_preferences" ON folio_care_preferences;
CREATE POLICY "Users can update own folio_care_preferences"
  ON folio_care_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folio_care_preferences" ON folio_care_preferences;
CREATE POLICY "Users can delete own folio_care_preferences"
  ON folio_care_preferences FOR DELETE USING (auth.uid() = user_id);
