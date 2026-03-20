-- ═══════════════════════════════════════════════════════════════════════
-- FIX: Admin policy regression introduced in 20260312
--
-- Problem: Migration 20260312 widened admin access from specific emails
--          to domain wildcards (LIKE '%@zacbrownlaw.com' / '%@mylifefolio.com'),
--          allowing ANY user at those domains to gain full admin access.
--
-- Fix:    Replace all domain-wildcard checks with the explicit email
--         whitelist that matches lib/adminUtils.ts ADMIN_EMAILS.
--
-- Admin emails: czacharia@zacbrownlaw.com, carl@seniorcares.com
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- 1. Fix handle_new_user() trigger — use specific emails, not domains
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (
    id, email, name, address, state_of_domicile, telephone,
    agreed_to_terms, agreed_to_terms_at, agreed_to_terms_signature,
    is_admin, is_disabled, created_at
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
      WHEN lower(NEW.email) IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com') THEN TRUE
      ELSE FALSE
    END,
    FALSE,
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
-- 2. Fix profiles policies — specific emails only
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 3. Fix user_subscriptions policies — specific emails only
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can read all subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can update all subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (
    lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can insert subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (
    lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 4. Fix user_questions policies — specific emails only
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all questions" ON public.user_questions;
CREATE POLICY "Admins can read all questions"
  ON public.user_questions
  FOR SELECT
  USING (
    lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 5. Fix folio_authorized_users policies — specific emails only
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all authorized users" ON folio_authorized_users;
CREATE POLICY "Admins can read all authorized users"
  ON folio_authorized_users
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

DROP POLICY IF EXISTS "Admins can update authorized users" ON folio_authorized_users;
CREATE POLICY "Admins can update authorized users"
  ON folio_authorized_users
  FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 6. Fix folio_access_log policies — specific emails only
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all access logs" ON folio_access_log;
CREATE POLICY "Admins can read all access logs"
  ON folio_access_log
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 7. Fix vault_documents policies — specific emails only
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all vault documents" ON vault_documents;
CREATE POLICY "Admins can read all vault documents"
  ON vault_documents
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 8. Fix intakes_raw policies — specific emails only
-- ═══════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can read all intakes" ON intakes_raw;
CREATE POLICY "Admins can read all intakes"
  ON intakes_raw
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 9. Backfill: ensure is_admin flag matches the whitelist
-- ═══════════════════════════════════════════════════════════════════════
UPDATE public.profiles
SET is_admin = TRUE
WHERE lower(email) IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  AND is_admin = FALSE;

UPDATE public.profiles
SET is_admin = FALSE
WHERE lower(email) NOT IN ('czacharia@zacbrownlaw.com', 'carl@seniorcares.com')
  AND is_admin = TRUE;
