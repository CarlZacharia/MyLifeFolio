-- Migration: Add income sources for client and spouse
-- This stores income information for both client and spouse
-- Each can have up to 4 income sources with description, amount, and frequency

-- ============================================================================
-- CLIENT INCOME SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_client_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  description TEXT NOT NULL DEFAULT '',
  amount TEXT DEFAULT '',  -- Stored as text to preserve formatting (e.g., "$1,500.00")
  frequency TEXT DEFAULT '', -- 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'Weekly', 'Bi-Weekly'

  sort_order INTEGER DEFAULT 0,  -- To maintain order of income sources (0-3)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ep_client_income_intake_id ON folio_client_income(intake_id);
CREATE INDEX IF NOT EXISTS idx_ep_client_income_user_id ON folio_client_income(user_id);

ALTER TABLE folio_client_income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_client_income" ON folio_client_income;
CREATE POLICY "Users can view own folio_client_income"
  ON folio_client_income FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own folio_client_income" ON folio_client_income;
CREATE POLICY "Users can insert own folio_client_income"
  ON folio_client_income FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own folio_client_income" ON folio_client_income;
CREATE POLICY "Users can update own folio_client_income"
  ON folio_client_income FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own folio_client_income" ON folio_client_income;
CREATE POLICY "Users can delete own folio_client_income"
  ON folio_client_income FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE folio_client_income IS 'Income sources for the client (up to 4 sources)';
COMMENT ON COLUMN folio_client_income.description IS 'Description of income source (e.g., Social Security, Pension, Part-time work)';
COMMENT ON COLUMN folio_client_income.amount IS 'Amount received per frequency period';
COMMENT ON COLUMN folio_client_income.frequency IS 'How often income is received: Monthly, Quarterly, Semi-Annually, Annually, Weekly, Bi-Weekly';

-- ============================================================================
-- SPOUSE INCOME SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_spouse_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  description TEXT NOT NULL DEFAULT '',
  amount TEXT DEFAULT '',  -- Stored as text to preserve formatting (e.g., "$1,500.00")
  frequency TEXT DEFAULT '', -- 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'Weekly', 'Bi-Weekly'

  sort_order INTEGER DEFAULT 0,  -- To maintain order of income sources (0-3)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ep_spouse_income_intake_id ON folio_spouse_income(intake_id);
CREATE INDEX IF NOT EXISTS idx_ep_spouse_income_user_id ON folio_spouse_income(user_id);

ALTER TABLE folio_spouse_income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_spouse_income" ON folio_spouse_income;
CREATE POLICY "Users can view own folio_spouse_income"
  ON folio_spouse_income FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own folio_spouse_income" ON folio_spouse_income;
CREATE POLICY "Users can insert own folio_spouse_income"
  ON folio_spouse_income FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own folio_spouse_income" ON folio_spouse_income;
CREATE POLICY "Users can update own folio_spouse_income"
  ON folio_spouse_income FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own folio_spouse_income" ON folio_spouse_income;
CREATE POLICY "Users can delete own folio_spouse_income"
  ON folio_spouse_income FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE folio_spouse_income IS 'Income sources for the spouse (up to 4 sources)';
COMMENT ON COLUMN folio_spouse_income.description IS 'Description of income source (e.g., Social Security, Pension, Part-time work)';
COMMENT ON COLUMN folio_spouse_income.amount IS 'Amount received per frequency period';
COMMENT ON COLUMN folio_spouse_income.frequency IS 'How often income is received: Monthly, Quarterly, Semi-Annually, Annually, Weekly, Bi-Weekly';
