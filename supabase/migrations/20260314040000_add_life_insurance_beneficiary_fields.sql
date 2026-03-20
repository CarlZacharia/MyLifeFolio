-- Add simple primary/secondary beneficiary text fields to life insurance
ALTER TABLE folio_life_insurance
  ADD COLUMN IF NOT EXISTS primary_beneficiary TEXT,
  ADD COLUMN IF NOT EXISTS secondary_beneficiary TEXT;
