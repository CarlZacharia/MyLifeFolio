-- Legacy section: 10 sub-sections covering life story, values, memories.
-- Same hybrid architecture as medications/equipment/pharmacies.

-- ============================================================
-- OBITUARY INFORMATION (single record per intake)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_obituary (
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

ALTER TABLE legacy_obituary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own obituary" ON legacy_obituary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own obituary" ON legacy_obituary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own obituary" ON legacy_obituary FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own obituary" ON legacy_obituary FOR DELETE USING (auth.uid() = user_id);

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

-- ============================================================
-- CHARITABLE ORGANIZATIONS (repeating)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_charity_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  website TEXT,
  contact_info TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_charity_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own charity orgs" ON legacy_charity_organizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own charity orgs" ON legacy_charity_organizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own charity orgs" ON legacy_charity_organizations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own charity orgs" ON legacy_charity_organizations FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- CHARITABLE PREFERENCES (single record per intake)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_charity_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donations_in_lieu_of_flowers BOOLEAN DEFAULT FALSE,
  scholarship_fund TEXT,
  religious_donations TEXT,
  legacy_giving_notes TEXT,
  why_these_causes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_charity_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own charity prefs" ON legacy_charity_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own charity prefs" ON legacy_charity_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own charity prefs" ON legacy_charity_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own charity prefs" ON legacy_charity_preferences FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- LETTERS TO FAMILY (repeating)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT,
  recipient_name TEXT,
  letter_body TEXT,
  format TEXT,
  media_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own letters" ON legacy_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own letters" ON legacy_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own letters" ON legacy_letters FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own letters" ON legacy_letters FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PERSONAL HISTORY (single record per intake)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_personal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birthplace TEXT,
  childhood_memories TEXT,
  parents_background TEXT,
  schools_attended TEXT,
  education_memories TEXT,
  first_job TEXT,
  career_milestones TEXT,
  proudest_professional TEXT,
  how_we_met TEXT,
  wedding_story TEXT,
  raising_children TEXT,
  important_decisions TEXT,
  biggest_challenges TEXT,
  risks_taken TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_personal_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own personal history" ON legacy_personal_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personal history" ON legacy_personal_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personal history" ON legacy_personal_history FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own personal history" ON legacy_personal_history FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- IMPORTANT LIFE STORIES (repeating)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_title TEXT NOT NULL,
  story_body TEXT,
  people_involved TEXT,
  approximate_date TEXT,
  location TEXT,
  lessons_learned TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stories" ON legacy_stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stories" ON legacy_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON legacy_stories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON legacy_stories FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PERSONAL REFLECTIONS (single record per intake)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  what_matters_most TEXT,
  advice_to_younger TEXT,
  core_beliefs TEXT,
  greatest_regrets TEXT,
  greatest_joys TEXT,
  how_remembered TEXT,
  personal_values TEXT, -- comma-separated or JSON array
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reflections" ON legacy_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON legacy_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections" ON legacy_reflections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reflections" ON legacy_reflections FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- THINGS PEOPLE MIGHT BE SURPRISED TO KNOW (single record)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_surprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hidden_talents TEXT,
  unusual_experiences TEXT,
  fun_facts TEXT,
  adventures TEXT,
  untold_stories TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_surprises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own surprises" ON legacy_surprises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own surprises" ON legacy_surprises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own surprises" ON legacy_surprises FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own surprises" ON legacy_surprises FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- FAVORITES (single record per intake)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_music TEXT,
  favorite_books TEXT,
  favorite_movies TEXT,
  favorite_foods TEXT,
  favorite_restaurants TEXT,
  favorite_vacation_destinations TEXT,
  favorite_quotes_sayings TEXT,
  other_favorites TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON legacy_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON legacy_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorites" ON legacy_favorites FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON legacy_favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- VIDEO LEGACY (repeating)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_title TEXT NOT NULL,
  recording_date TEXT,
  description TEXT,
  cloud_link TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  transcript TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own videos" ON legacy_videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own videos" ON legacy_videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own videos" ON legacy_videos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own videos" ON legacy_videos FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MEMORY VAULT (repeating)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_title TEXT NOT NULL,
  description TEXT,
  people_in_photo TEXT,
  approximate_year TEXT,
  location TEXT,
  tags TEXT,
  media_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE legacy_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON legacy_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON legacy_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON legacy_memories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON legacy_memories FOR DELETE USING (auth.uid() = user_id);
