-- Family Access Portal tables
-- folio_authorized_users: tracks which family members can access which folio sections
-- folio_access_log: audit log of all access events

-- 1. Authorized Users Table
CREATE TABLE IF NOT EXISTS folio_authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  authorized_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  access_sections TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, authorized_email)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_folio_authorized_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS folio_authorized_users_updated_at ON folio_authorized_users;
CREATE TRIGGER folio_authorized_users_updated_at
  BEFORE UPDATE ON folio_authorized_users
  FOR EACH ROW
  EXECUTE FUNCTION update_folio_authorized_users_updated_at();

-- RLS for folio_authorized_users
ALTER TABLE folio_authorized_users ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their own rows
DROP POLICY IF EXISTS "Owner can manage their authorized users" ON folio_authorized_users;
CREATE POLICY "Owner can manage their authorized users"
  ON folio_authorized_users
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Authorized users can read their own authorization row (matched by email)
DROP POLICY IF EXISTS "Authorized users can read their own access" ON folio_authorized_users;
CREATE POLICY "Authorized users can read their own access"
  ON folio_authorized_users
  FOR SELECT
  USING (
    lower(authorized_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
    AND is_active = true
  );

-- 2. Access Log Table
CREATE TABLE IF NOT EXISTS folio_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessor_email TEXT NOT NULL,
  accessor_name TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('chat', 'report')),
  query_text TEXT,
  report_name TEXT,
  sections_queried TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for folio_access_log
ALTER TABLE folio_access_log ENABLE ROW LEVEL SECURITY;

-- Owner can read their own log
DROP POLICY IF EXISTS "Owner can read their access log" ON folio_access_log;
CREATE POLICY "Owner can read their access log"
  ON folio_access_log
  FOR SELECT
  USING (owner_id = auth.uid());

-- Accessor can insert their own log entries
DROP POLICY IF EXISTS "Accessor can insert log entries" ON folio_access_log;
CREATE POLICY "Accessor can insert log entries"
  ON folio_access_log
  FOR INSERT
  WITH CHECK (
    lower(accessor_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_folio_authorized_users_owner ON folio_authorized_users(owner_id);
CREATE INDEX IF NOT EXISTS idx_folio_authorized_users_email ON folio_authorized_users(lower(authorized_email));
CREATE INDEX IF NOT EXISTS idx_folio_access_log_owner ON folio_access_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_folio_access_log_created ON folio_access_log(created_at DESC);
