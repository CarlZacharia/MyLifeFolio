-- Digital Subscriptions: online/digital recurring services (streaming, cloud, apps, etc.)
-- Same schema as folio_subscriptions but for digital services tracked under Digital Life.

CREATE TABLE IF NOT EXISTS folio_digital_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  category TEXT,
  frequency TEXT,
  amount TEXT,
  payment_method TEXT,
  account_holder TEXT,
  login_email TEXT,
  auto_renew BOOLEAN DEFAULT TRUE,
  renewal_date TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folio_digital_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own digital subscriptions" ON folio_digital_subscriptions;
CREATE POLICY "Users can view own digital subscriptions"
  ON folio_digital_subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own digital subscriptions" ON folio_digital_subscriptions;
CREATE POLICY "Users can insert own digital subscriptions"
  ON folio_digital_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own digital subscriptions" ON folio_digital_subscriptions;
CREATE POLICY "Users can update own digital subscriptions"
  ON folio_digital_subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own digital subscriptions" ON folio_digital_subscriptions;
CREATE POLICY "Users can delete own digital subscriptions"
  ON folio_digital_subscriptions FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON folio_digital_subscriptions TO authenticated;
