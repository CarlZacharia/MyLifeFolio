-- ============================================================
-- ADD GENERATION COUNT + TIMESTAMP TO OBITUARY TABLES
-- Enables server-side rate limiting (max 5 generations per person)
-- ============================================================

-- Client obituary table
ALTER TABLE legacy_obituary
  ADD COLUMN IF NOT EXISTS generation_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMPTZ;

-- Spouse obituary table
ALTER TABLE legacy_obituary_spouse
  ADD COLUMN IF NOT EXISTS generation_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMPTZ;
