-- ============================================================================
-- COLLAPSE SUBSCRIPTION TIERS TO TRIAL + PAID
-- ============================================================================
-- Decision (Carl, 2026-05-01):
--   • Two states only: 'trial' (free 6 months from signup) and 'paid' ($149/yr).
--   • 'standard' and 'enhanced' tiers are merged into 'paid'.
--   • 30-day grace period after trial ends — user can still log in but only
--     to the renew/delete page.
--   • At grace-period end (or earlier user choice), account is fully deleted.
--     No data retention. The user is informed of this at signup and again at
--     deactivation.
--   • No credit card required at signup.
-- ============================================================================

-- 1. Drop the old CHECK constraint FIRST so the migration UPDATE can move
--    rows to 'paid' without being rejected. The original migration declared
--    the constraint inline on the column, so PostgreSQL auto-named it. Both
--    common names are dropped to cover either case (the inline form usually
--    becomes "<table>_<column>_check" but older PG versions used a simpler
--    pattern).
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_tier_check;
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_tier_check1;

-- 2. Migrate any existing rows: standard → paid, enhanced → paid.
--    (Carl confirmed there are no live paying customers, so this is just
--     defensive — admin tools may have set test rows.)
UPDATE public.user_subscriptions
SET tier = 'paid'
WHERE tier IN ('standard', 'enhanced');

-- 3. Add the new CHECK constraint allowing only 'trial' or 'paid'.
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_tier_check
  CHECK (tier IN ('trial', 'paid'));

-- 4. New columns to track grace period + the user's renew/delete decision.
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decision TEXT
    CHECK (decision IS NULL OR decision IN ('renew', 'delete')),
  ADD COLUMN IF NOT EXISTS decision_made_at TIMESTAMPTZ,
  -- When the cron will hard-delete the account if no decision has been made.
  ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMPTZ;

-- 5. Backfill existing trial users:
--    - Extend trial_ends_at from (started_at + 7 days) to (started_at + 6 months).
--    - Set grace_period_ends_at = trial_ends_at + 30 days.
--    - Set scheduled_deletion_at = grace_period_ends_at (auto-delete if no
--      decision is ever made).
UPDATE public.user_subscriptions
SET
  trial_ends_at = trial_started_at + INTERVAL '6 months',
  grace_period_ends_at = trial_started_at + INTERVAL '6 months' + INTERVAL '30 days',
  scheduled_deletion_at = trial_started_at + INTERVAL '6 months' + INTERVAL '30 days'
WHERE tier = 'trial'
  AND trial_started_at IS NOT NULL;

-- 6. Profiles get a column to record the user agreed to the deletion-on-cancel
--    notice. Required at signup; required again as confirmation at deactivation.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deletion_consent_at TIMESTAMPTZ,
  -- When set, the user has explicitly chosen to delete on cancellation. The
  -- daily cron uses this in combination with scheduled_deletion_at to wipe
  -- accounts. Cleared if the user later renews.
  ADD COLUMN IF NOT EXISTS account_deletion_confirmed_at TIMESTAMPTZ;

-- 7. Update the handle_new_user() trigger:
--    - Trial length: 7 days → 6 months.
--    - Set grace_period_ends_at + scheduled_deletion_at on the new row.
--    - Capture deletion_consent_at on the profile (the signup form
--      requires acknowledgement, passed via raw_user_meta_data).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile (existing logic + new deletion_consent_at)
  INSERT INTO public.profiles (
    id, email, name, address, state_of_domicile, telephone,
    agreed_to_terms, agreed_to_terms_at, agreed_to_terms_signature,
    deletion_consent_at,
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
    -- The signup form sets deletion_consent_at when the user checks the
    -- "I understand my data will be permanently deleted on cancellation" box.
    CASE
      WHEN NEW.raw_user_meta_data->>'deletion_consent_at' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'deletion_consent_at')::timestamptz
      ELSE NULL
    END,
    CASE
      WHEN NEW.email LIKE '%@zacbrownlaw.com' THEN TRUE
      ELSE FALSE
    END,
    NOW()
  );

  -- Trial subscription: 6 months free, then 30-day grace, then auto-delete.
  INSERT INTO public.user_subscriptions (
    user_id, tier, status,
    trial_started_at, trial_ends_at,
    grace_period_ends_at, scheduled_deletion_at
  )
  VALUES (
    NEW.id, 'trial', 'active',
    NOW(),
    NOW() + INTERVAL '6 months',
    NOW() + INTERVAL '6 months' + INTERVAL '30 days',
    NOW() + INTERVAL '6 months' + INTERVAL '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
