-- Add subject column to legacy_letters
ALTER TABLE legacy_letters ADD COLUMN IF NOT EXISTS subject TEXT;
