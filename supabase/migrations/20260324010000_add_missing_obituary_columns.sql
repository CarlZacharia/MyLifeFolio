-- Add columns that may be missing from legacy_obituary if the table was created
-- before the full schema migration (CREATE TABLE IF NOT EXISTS skips existing tables)

ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS preferred_funeral_home TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS burial_or_cremation TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS service_preferences TEXT;
ALTER TABLE legacy_obituary ADD COLUMN IF NOT EXISTS charitable_donations TEXT;
