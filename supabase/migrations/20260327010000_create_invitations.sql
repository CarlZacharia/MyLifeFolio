-- Create invitations table for tracking signup invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  invited_email TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('client', 'public')),
  trial_months INTEGER NOT NULL CHECK (trial_months IN (6, 12)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_by UUID REFERENCES auth.users(id),
  accepted_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by code (used during signup)
CREATE INDEX idx_invitations_code ON invitations (code);
-- Index for listing invitations by creator
CREATE INDEX idx_invitations_created_by ON invitations (created_by);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Users can read invitations they created
DROP POLICY IF EXISTS "Users can read own invitations" ON invitations;
CREATE POLICY "Users can read own invitations"
  ON invitations FOR SELECT
  USING (auth.uid() = created_by);

-- Service role handles all writes (via edge functions)
DROP POLICY IF EXISTS "Service role full access" ON invitations;
CREATE POLICY "Service role full access"
  ON invitations FOR ALL
  USING (auth.role() = 'service_role');
