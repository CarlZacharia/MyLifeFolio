-- ============================================================================
-- SCHEDULE TRIAL REMINDER EMAILS (4-email cadence)
-- ============================================================================
-- Carl's spec (2026-05-01): send four reminder emails per user during their
-- trial → grace-period lifecycle:
--   1. 30 days BEFORE trial end (= signup + 6 months − 30 days)
--   2.  7 days BEFORE trial end (= signup + 6 months − 7 days)
--   3. Day OF trial end          (= signup + 6 months)
--   4.  7 days AFTER trial end   (= signup + 6 months + 7 days, in grace)
--
-- Implementation:
--   - Extend the CHECK constraint on scheduled_emails.email_type to include
--     the four new types (the old 'trial_90day' / 'trial_30day' / 'trial_7day'
--     types stay valid so any in-flight rows aren't broken).
--   - Patch handle_new_user() to insert four rows after creating the
--     subscription. These are sent by process-scheduled-emails on its daily
--     cron run.
--   - Backfill: insert the four scheduled emails for every existing trial
--     user that doesn't already have them, so live accounts get the new
--     reminder schedule.
-- ============================================================================

-- 1. Extend the email_type whitelist.
ALTER TABLE public.scheduled_emails
  DROP CONSTRAINT IF EXISTS scheduled_emails_email_type_check;

ALTER TABLE public.scheduled_emails
  ADD CONSTRAINT scheduled_emails_email_type_check
  CHECK (email_type IN (
    -- Legacy types (kept so any pending rows remain valid)
    'trial_90day', 'trial_30day', 'trial_7day',
    -- New types for the 6-month / 30-day-grace cadence
    'trial_30day_before',
    'trial_7day_before',
    'trial_ended',
    'grace_7day_after'
  ));

-- 2. Patch handle_new_user() — append the 4 scheduled-email INSERTs after
--    the existing subscription INSERT. We re-create the function in full so
--    it stays in one place. Keep this in sync with
--    20260501040000_collapse_tiers_to_trial_and_paid.sql.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  trial_end TIMESTAMPTZ;
  grace_end TIMESTAMPTZ;
BEGIN
  trial_end := NOW() + INTERVAL '6 months';
  grace_end := trial_end + INTERVAL '30 days';

  -- Profile (existing logic)
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

  -- Trial subscription
  INSERT INTO public.user_subscriptions (
    user_id, tier, status,
    trial_started_at, trial_ends_at,
    grace_period_ends_at, scheduled_deletion_at
  )
  VALUES (
    NEW.id, 'trial', 'active',
    NOW(), trial_end, grace_end, grace_end
  );

  -- Trial reminder emails
  INSERT INTO public.scheduled_emails (user_id, email_type, scheduled_for)
  VALUES
    (NEW.id, 'trial_30day_before', trial_end - INTERVAL '30 days'),
    (NEW.id, 'trial_7day_before',  trial_end - INTERVAL '7 days'),
    (NEW.id, 'trial_ended',        trial_end),
    (NEW.id, 'grace_7day_after',   trial_end + INTERVAL '7 days');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill — schedule the four reminders for any existing trial user that
--    doesn't already have them. We compute scheduled_for from the user's
--    current trial_ends_at so timing matches whatever the trigger set.
INSERT INTO public.scheduled_emails (user_id, email_type, scheduled_for)
SELECT us.user_id, 'trial_30day_before', us.trial_ends_at - INTERVAL '30 days'
FROM public.user_subscriptions us
WHERE us.tier = 'trial'
  AND us.trial_ends_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.scheduled_emails se
    WHERE se.user_id = us.user_id AND se.email_type = 'trial_30day_before'
  );

INSERT INTO public.scheduled_emails (user_id, email_type, scheduled_for)
SELECT us.user_id, 'trial_7day_before', us.trial_ends_at - INTERVAL '7 days'
FROM public.user_subscriptions us
WHERE us.tier = 'trial'
  AND us.trial_ends_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.scheduled_emails se
    WHERE se.user_id = us.user_id AND se.email_type = 'trial_7day_before'
  );

INSERT INTO public.scheduled_emails (user_id, email_type, scheduled_for)
SELECT us.user_id, 'trial_ended', us.trial_ends_at
FROM public.user_subscriptions us
WHERE us.tier = 'trial'
  AND us.trial_ends_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.scheduled_emails se
    WHERE se.user_id = us.user_id AND se.email_type = 'trial_ended'
  );

INSERT INTO public.scheduled_emails (user_id, email_type, scheduled_for)
SELECT us.user_id, 'grace_7day_after', us.trial_ends_at + INTERVAL '7 days'
FROM public.user_subscriptions us
WHERE us.tier = 'trial'
  AND us.trial_ends_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.scheduled_emails se
    WHERE se.user_id = us.user_id AND se.email_type = 'grace_7day_after'
  );
