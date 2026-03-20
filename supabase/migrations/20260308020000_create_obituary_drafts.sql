-- ============================================================
-- OBITUARY GENERATED DRAFTS (auto-saved from Claude generation)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_obituary_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_text TEXT NOT NULL,
  tone TEXT,
  person_name TEXT,
  generation_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_obituary_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own drafts" ON legacy_obituary_drafts;
CREATE POLICY "Users can view own drafts" ON legacy_obituary_drafts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own drafts" ON legacy_obituary_drafts;
CREATE POLICY "Users can insert own drafts" ON legacy_obituary_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own drafts" ON legacy_obituary_drafts;
CREATE POLICY "Users can delete own drafts" ON legacy_obituary_drafts FOR DELETE USING (auth.uid() = user_id);
