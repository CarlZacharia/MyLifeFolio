-- Add Transfer On Death (TOD) fields to financial asset tables
-- TOD is a beneficiary designation for financial assets

-- Bank Accounts
ALTER TABLE folio_bank_accounts
  ADD COLUMN IF NOT EXISTS has_tod BOOLEAN,
  ADD COLUMN IF NOT EXISTS tod_primary_beneficiary TEXT,
  ADD COLUMN IF NOT EXISTS tod_secondary_beneficiary TEXT;

-- Non-Qualified Investments
ALTER TABLE folio_investments
  ADD COLUMN IF NOT EXISTS has_tod BOOLEAN,
  ADD COLUMN IF NOT EXISTS tod_primary_beneficiary TEXT,
  ADD COLUMN IF NOT EXISTS tod_secondary_beneficiary TEXT;

-- Retirement Accounts
ALTER TABLE folio_retirement_accounts
  ADD COLUMN IF NOT EXISTS has_tod BOOLEAN,
  ADD COLUMN IF NOT EXISTS tod_primary_beneficiary TEXT,
  ADD COLUMN IF NOT EXISTS tod_secondary_beneficiary TEXT;
