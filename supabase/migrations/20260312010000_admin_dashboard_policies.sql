-- Admin dashboard RLS policies and schema changes
-- Allows admin users (@zacbrownlaw.com and @mylifefolio.com) to manage users and subscriptions

-- ═══════════════════════════════════════════════════════════════════════
-- Add is_disabled column to profiles for account disable/enable
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- ═══════════════════════════════════════════════════════════════════════
-- Update handle_new_user() to also set is_admin for @mylifefolio.com
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (
    id, email, name, address, state_of_domicile, telephone,
    agreed_to_terms, agreed_to_terms_at, agreed_to_terms_signature,
    is_admin, created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'state_of_domicile',
    NEW.raw_user_meta_data->>'telephone',
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_terms')::boolean, FALSE),
    CASE
      WHEN NEW.raw_user_meta_data->>'agreed_to_terms_at' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'agreed_to_terms_at')::timestamptz
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'agreed_to_terms_signature',
    CASE
      WHEN NEW.email LIKE '%@zacbrownlaw.com' THEN TRUE
      WHEN NEW.email LIKE '%@mylifefolio.com' THEN TRUE
      ELSE FALSE
    END,
    NOW()
  );

  -- Create trial subscription
  INSERT INTO public.user_subscriptions (
    user_id, tier, status, trial_started_at, trial_ends_at
  )
  VALUES (
    NEW.id, 'trial', 'active', NOW(), NOW() + INTERVAL '7 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════
-- Admin policies: update profiles admin read to include @mylifefolio.com
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

-- Admin can update any profile (for disable/enable)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Admin policies on user_subscriptions
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can read all subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can update all subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

-- Admin can INSERT subscriptions (for users who don't have one yet)
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can insert subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Admin policies on folio_authorized_users
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all authorized users" ON folio_authorized_users;
CREATE POLICY "Admins can read all authorized users"
  ON folio_authorized_users
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

DROP POLICY IF EXISTS "Admins can update authorized users" ON folio_authorized_users;
CREATE POLICY "Admins can update authorized users"
  ON folio_authorized_users
  FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Admin policies on folio_access_log
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all access logs" ON folio_access_log;
CREATE POLICY "Admins can read all access logs"
  ON folio_access_log
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Admin policies on vault_documents (for storage stats)
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all vault documents" ON vault_documents;
CREATE POLICY "Admins can read all vault documents"
  ON vault_documents
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Admin policies on intakes_raw — update to include @mylifefolio.com
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all intakes" ON intakes_raw;
CREATE POLICY "Admins can read all intakes"
  ON intakes_raw
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
    OR (auth.jwt() ->> 'email') LIKE '%@mylifefolio.com'
  );
