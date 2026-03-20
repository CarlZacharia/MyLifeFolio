-- Change admin domain from @mylifefolio.com to @zacfreylaw.com
-- Updates: handle_new_user trigger, and all admin RLS policies

-- ── 1. Update handle_new_user() function ──
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  trial_end TIMESTAMPTZ;
BEGIN
  trial_end := NOW() + INTERVAL '7 days';

  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com') THEN TRUE
      WHEN NEW.email LIKE '%@zacfreylaw.com' THEN TRUE
      ELSE FALSE
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_admin = EXCLUDED.is_admin;

  INSERT INTO public.user_subscriptions (user_id, tier, status, trial_ends_at, current_period_start, current_period_end)
  VALUES (NEW.id, 'trial', 'active', trial_end, NOW(), trial_end)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. Profiles: admin read ──
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 3. Profiles: admin update ──
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  )
  WITH CHECK (
    auth.uid() = id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 4. User subscriptions: admin read ──
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can read all subscriptions"
  ON user_subscriptions FOR SELECT
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 5. User subscriptions: admin update ──
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can update all subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 6. User subscriptions: admin delete ──
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can delete subscriptions"
  ON user_subscriptions FOR DELETE
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 7. Folio authorized users: admin read ──
DROP POLICY IF EXISTS "Admins can read all authorized_users" ON folio_authorized_users;
CREATE POLICY "Admins can read all authorized_users"
  ON folio_authorized_users FOR SELECT
  USING (
    auth.uid() = owner_id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 8. Access log: admin read ──
DROP POLICY IF EXISTS "Admins can read all access_log" ON folio_access_log;
CREATE POLICY "Admins can read all access_log"
  ON folio_access_log FOR SELECT
  USING (
    auth.uid() = owner_id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 9. Intakes_raw: admin read ──
DROP POLICY IF EXISTS "Admins can read all intakes_raw" ON intakes_raw;
CREATE POLICY "Admins can read all intakes_raw"
  ON intakes_raw FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );

-- ── 10. Vault documents: admin read ──
DROP POLICY IF EXISTS "Admins can read all vault_documents" ON vault_documents;
CREATE POLICY "Admins can read all vault_documents"
  ON vault_documents FOR SELECT
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
    OR (auth.jwt() ->> 'email') LIKE '%@zacfreylaw.com'
  );
