-- ============================================================================
-- END OF LIFE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_end_of_life (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  field_data JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_end_of_life_intake_id ON folio_end_of_life(intake_id);
CREATE INDEX IF NOT EXISTS idx_folio_end_of_life_user_id ON folio_end_of_life(user_id);

ALTER TABLE folio_end_of_life ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_end_of_life" ON folio_end_of_life;
CREATE POLICY "Users can view own folio_end_of_life"
  ON folio_end_of_life FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folio_end_of_life" ON folio_end_of_life;
CREATE POLICY "Users can insert own folio_end_of_life"
  ON folio_end_of_life FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folio_end_of_life" ON folio_end_of_life;
CREATE POLICY "Users can update own folio_end_of_life"
  ON folio_end_of_life FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folio_end_of_life" ON folio_end_of_life;
CREATE POLICY "Users can delete own folio_end_of_life"
  ON folio_end_of_life FOR DELETE USING (auth.uid() = user_id);
