-- Scheduled emails queue for trial reminder notifications
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type text NOT NULL CHECK (email_type IN ('trial_90day', 'trial_30day', 'trial_7day')),
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_emails_pending ON scheduled_emails (status, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_scheduled_emails_user ON scheduled_emails (user_id);

-- Only service role can access (edge function processing)
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON scheduled_emails;
CREATE POLICY "Service role full access"
  ON scheduled_emails FOR ALL
  USING (auth.role() = 'service_role');
