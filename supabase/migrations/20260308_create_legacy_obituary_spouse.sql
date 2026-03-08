-- ============================================================
-- OBITUARY INFORMATION — SPOUSE (single record per intake)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_obituary_spouse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The Basics
  preferred_name TEXT,
  nicknames TEXT,
  date_of_birth TEXT,
  place_of_birth TEXT,
  date_of_death TEXT,
  place_of_death TEXT,
  -- Life Story
  hometowns TEXT,
  religious_affiliation TEXT,
  military_service TEXT,
  education TEXT,
  career_highlights TEXT,
  community_involvement TEXT,
  awards_honors TEXT,
  -- Family
  spouses TEXT,
  children TEXT,
  grandchildren TEXT,
  siblings TEXT,
  parents TEXT,
  others_to_mention TEXT,
  preceded_in_death TEXT,
  -- Your Voice
  tone TEXT,
  quotes_to_include TEXT,
  what_to_remember TEXT,
  personal_message TEXT,
  -- Final Arrangements
  preferred_funeral_home TEXT,
  burial_or_cremation TEXT,
  service_preferences TEXT,
  charitable_donations TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_obituary_spouse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own spouse obituary" ON legacy_obituary_spouse FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spouse obituary" ON legacy_obituary_spouse FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own spouse obituary" ON legacy_obituary_spouse FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own spouse obituary" ON legacy_obituary_spouse FOR DELETE USING (auth.uid() = user_id);
