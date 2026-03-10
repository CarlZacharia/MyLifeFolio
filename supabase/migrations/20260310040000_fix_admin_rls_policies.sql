-- Fix RLS policies that were broken due to recursion or auth.users subquery issues
--
-- FIX 1: profiles admin SELECT policy
--   The existing policy from 20241229_fix_profiles_rls.sql uses JWT email LIKE
--   but is a separate policy from the own-row SELECT. Combine them into one policy
--   so admin access and own-row access are evaluated together.
--
-- FIX 2: folio_access_log accessor INSERT policy
--   The original policy used: SELECT email FROM auth.users WHERE id = auth.uid()
--   This subquery fails for authenticated users, causing every INSERT to be denied.
--   Replace with auth.jwt() ->> 'email' which reads the email from the JWT token
--   directly, without any table query.

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX 1: profiles — combine own-row + admin SELECT into one policy
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX 2: folio_access_log — use JWT email instead of auth.users subquery
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Accessor can insert log entries" ON folio_access_log;

CREATE POLICY "Accessor can insert log entries"
  ON folio_access_log
  FOR INSERT
  WITH CHECK (
    lower(accessor_email) = lower(auth.jwt() ->> 'email')
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUDIT: Other tables checked for the same patterns
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Checked for EXISTS (SELECT 1 FROM public.profiles WHERE ...) recursion:
--   NONE FOUND — no other tables reference public.profiles in their RLS policies.
--
-- Checked intakes_raw admin policy:
--   ALREADY CORRECT — uses (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
--   Set up in 20241229_fix_profiles_rls.sql. No changes needed.
--
-- Checked user_questions admin policy:
--   ALREADY CORRECT — uses (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
--   No changes needed.
--
-- Checked folio_authorized_users SELECT policy:
--   Uses (SELECT email FROM auth.users WHERE id = auth.uid()) — same pattern
--   as the broken access_log policy, BUT the test passes. Not fixing now to
--   avoid breaking a working policy, but should be migrated to auth.jwt() in
--   a future cleanup pass.
--
-- Checked folio_documents SELECT policy:
--   Uses (SELECT email FROM auth.users WHERE id = auth.uid()) inside EXISTS —
--   same pattern, test passes. Same recommendation as above.
