-- Add ALL columns that may be missing from legacy_obituary.
-- The table was created early with a partial schema, and the later
-- CREATE TABLE IF NOT EXISTS migration skipped it entirely.

-- The Basics
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS nicknames TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS place_of_birth TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS date_of_death TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS place_of_death TEXT;
-- Life Story
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS hometowns TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS religious_affiliation TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS military_service TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS career_highlights TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS community_involvement TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS awards_honors TEXT;
-- Family
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS spouses TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS children TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS grandchildren TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS siblings TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS parents TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS others_to_mention TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS preceded_in_death TEXT;
-- Your Voice
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS tone TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS quotes_to_include TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS what_to_remember TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS personal_message TEXT;
-- Final Arrangements
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS preferred_funeral_home TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS burial_or_cremation TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS service_preferences TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS charitable_donations TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
