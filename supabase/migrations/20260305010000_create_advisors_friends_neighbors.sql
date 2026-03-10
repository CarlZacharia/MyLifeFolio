-- ============================================================================
-- ADVISORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_type TEXT,
  name TEXT,
  firm_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_advisors_intake_id ON folio_advisors(intake_id);
CREATE INDEX IF NOT EXISTS idx_folio_advisors_user_id ON folio_advisors(user_id);

ALTER TABLE folio_advisors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own folio_advisors" ON folio_advisors;
CREATE POLICY "Users can view own folio_advisors"
  ON folio_advisors FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own folio_advisors" ON folio_advisors;
CREATE POLICY "Users can insert own folio_advisors"
  ON folio_advisors FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own folio_advisors" ON folio_advisors;
CREATE POLICY "Users can update own folio_advisors"
  ON folio_advisors FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own folio_advisors" ON folio_advisors;
CREATE POLICY "Users can delete own folio_advisors"
  ON folio_advisors FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FRIENDS & NEIGHBORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_friends_neighbors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  relationship TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_friends_neighbors_intake_id ON folio_friends_neighbors(intake_id);
CREATE INDEX IF NOT EXISTS idx_folio_friends_neighbors_user_id ON folio_friends_neighbors(user_id);

ALTER TABLE folio_friends_neighbors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own folio_friends_neighbors" ON folio_friends_neighbors;
CREATE POLICY "Users can view own folio_friends_neighbors"
  ON folio_friends_neighbors FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own folio_friends_neighbors" ON folio_friends_neighbors;
CREATE POLICY "Users can insert own folio_friends_neighbors"
  ON folio_friends_neighbors FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own folio_friends_neighbors" ON folio_friends_neighbors;
CREATE POLICY "Users can update own folio_friends_neighbors"
  ON folio_friends_neighbors FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own folio_friends_neighbors" ON folio_friends_neighbors;
CREATE POLICY "Users can delete own folio_friends_neighbors"
  ON folio_friends_neighbors FOR DELETE USING (auth.uid() = user_id);
