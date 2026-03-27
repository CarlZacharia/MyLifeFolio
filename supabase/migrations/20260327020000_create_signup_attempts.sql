-- Track signup attempts by IP for rate limiting
CREATE TABLE IF NOT EXISTS signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email text,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

-- Index for the rate-limit query (IP + time window)
CREATE INDEX idx_signup_attempts_ip_time ON signup_attempts (ip_address, attempted_at);

-- Enable RLS — only service role can read/write
ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON signup_attempts;
CREATE POLICY "Service role full access"
  ON signup_attempts FOR ALL
  USING (auth.role() = 'service_role');
