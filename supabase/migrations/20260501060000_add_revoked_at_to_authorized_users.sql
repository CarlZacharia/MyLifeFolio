-- ============================================================================
-- ADD revoked_at TO folio_authorized_users
-- ============================================================================
-- Reason: distinguish "system-locked due to owner's trial expiring" from
-- "owner manually revoked this grant in Family Access Manager." The daily
-- cron's Job 2 re-activates inactive grants when an owner pays/renews; we
-- need a way to *not* re-activate grants the owner intentionally turned off.
--
-- Semantics:
--   • revoked_at IS NULL              — grant is either active OR system-locked
--                                       (Job 1 of the cron sets is_active=false
--                                       but never touches revoked_at).
--   • revoked_at IS NOT NULL          — owner manually deactivated this grant.
--                                       Cron Job 2 must skip these.
--
-- The handle_toggle_active client code in FamilyAccessManager sets/clears
-- revoked_at along with is_active.
-- ============================================================================

ALTER TABLE public.folio_authorized_users
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- Backfill: every existing is_active=false row was deactivated manually by
-- the owner (the system-lock cron didn't exist before this migration), so
-- mark them all as owner-revoked. Use updated_at as the best-available timestamp;
-- fall back to NOW() if updated_at is null for any reason.
UPDATE public.folio_authorized_users
SET revoked_at = COALESCE(updated_at, NOW())
WHERE is_active = false
  AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_folio_authorized_users_revoked_at
  ON public.folio_authorized_users(revoked_at)
  WHERE revoked_at IS NOT NULL;
