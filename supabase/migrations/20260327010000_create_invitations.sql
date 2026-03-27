-- Create invitations table for tracking signup invitations
-- NOTE: This table was already created directly in Supabase.
-- This migration file is kept for reference / version control.
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_by uuid REFERENCES attorneys(id) ON DELETE SET NULL,
  invited_email text,
  plan_type text NOT NULL CHECK (plan_type IN ('client', 'public')),
  trial_months integer NOT NULL DEFAULT 12,
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '90 days',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/update (staff-generated via Edge Function)
DROP POLICY IF EXISTS "Service role full access" ON invitations;
CREATE POLICY "Service role full access"
  ON invitations
  USING (auth.role() = 'service_role');

-- Authenticated users can read their own used invitation
DROP POLICY IF EXISTS "Users can read their own invitation" ON invitations;
CREATE POLICY "Users can read their own invitation"
  ON invitations FOR SELECT
  USING (used_by = auth.uid());
