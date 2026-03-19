-- Custom Report Builder: saved report configurations
-- Each user can save named report configs with selected sections/items

CREATE TABLE IF NOT EXISTS saved_report_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  -- config shape: { "sections": { "personal-information": ["Client & spouse details", ...], ... } }
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_report_configs_user_id ON saved_report_configs(user_id);

-- updated_at trigger (reuses existing function if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_saved_report_configs_updated_at ON saved_report_configs;
CREATE TRIGGER update_saved_report_configs_updated_at
  BEFORE UPDATE ON saved_report_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE saved_report_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved_report_configs" ON saved_report_configs;
CREATE POLICY "Users can view own saved_report_configs"
  ON saved_report_configs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved_report_configs" ON saved_report_configs;
CREATE POLICY "Users can insert own saved_report_configs"
  ON saved_report_configs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved_report_configs" ON saved_report_configs;
CREATE POLICY "Users can update own saved_report_configs"
  ON saved_report_configs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved_report_configs" ON saved_report_configs;
CREATE POLICY "Users can delete own saved_report_configs"
  ON saved_report_configs FOR DELETE USING (auth.uid() = user_id);
