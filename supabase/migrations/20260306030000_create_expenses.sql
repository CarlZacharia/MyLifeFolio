-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS folio_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  expense_type TEXT NOT NULL,
  paid_to TEXT,
  frequency TEXT,
  amount NUMERIC(12,2),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_expenses_intake_id ON folio_expenses(intake_id);
CREATE INDEX IF NOT EXISTS idx_folio_expenses_user_id ON folio_expenses(user_id);

ALTER TABLE folio_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folio_expenses" ON folio_expenses;
CREATE POLICY "Users can view own folio_expenses"
  ON folio_expenses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folio_expenses" ON folio_expenses;
CREATE POLICY "Users can insert own folio_expenses"
  ON folio_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folio_expenses" ON folio_expenses;
CREATE POLICY "Users can update own folio_expenses"
  ON folio_expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folio_expenses" ON folio_expenses;
CREATE POLICY "Users can delete own folio_expenses"
  ON folio_expenses FOR DELETE USING (auth.uid() = user_id);
