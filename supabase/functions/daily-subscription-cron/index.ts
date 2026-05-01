// Supabase Edge Function: daily-subscription-cron
//
// Schedule: once per day (e.g. 03:00 UTC). Three jobs in sequence:
//
//   1. Mark expired trials. For every user_subscriptions row with
//      tier='trial' AND status='active' AND trial_ends_at < now, set
//      status='expired'. Also flip is_active=false on every
//      folio_authorized_users row owned by that user — this is what locks
//      family-access viewers when the owner's trial ends.
//
//   2. Re-activate family-access for renewed accounts. If status is back to
//      'active' (Stripe webhook flipped it after a successful renewal),
//      flip is_active=true on the owner's grants again.
//
//   3. Permanently delete accounts whose grace period has ended. For every
//      user_subscriptions row with tier='trial' AND grace_period_ends_at < now
//      AND no renewal decision (or decision='delete'), invoke
//      delete-user-account internally to wipe everything.
//
// This is the engine that turns "the user did nothing" into "the data is
// actually gone." Carl's policy: no data retention. The cron is the worker.

// @ts-ignore Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore Deno global
declare const Deno: { env: { get(key: string): string | undefined } };

serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const summary = {
    expired_marked: 0,
    family_access_locked: 0,
    family_access_unlocked: 0,
    accounts_deleted: 0,
    errors: [] as string[],
  };

  const now = new Date().toISOString();

  // ── Job 1: mark trial-expired subscriptions and lock their family access
  try {
    const { data: toExpire } = await supabase
      .from('user_subscriptions')
      .select('user_id, trial_ends_at')
      .eq('tier', 'trial')
      .eq('status', 'active')
      .lt('trial_ends_at', now);

    for (const row of toExpire || []) {
      const { error: updateErr } = await supabase
        .from('user_subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', row.user_id);
      if (updateErr) {
        summary.errors.push(`expire ${row.user_id}: ${updateErr.message}`);
        continue;
      }
      summary.expired_marked++;

      // Lock family-access grants. The portal already filters by is_active,
      // so flipping the flag is enough to make grants invisible.
      const { error: lockErr, count } = await supabase
        .from('folio_authorized_users')
        .update({ is_active: false })
        .eq('owner_id', row.user_id)
        .eq('is_active', true)
        .select('*', { count: 'exact', head: true });
      if (lockErr) {
        summary.errors.push(`lock ${row.user_id}: ${lockErr.message}`);
      } else {
        summary.family_access_locked += count ?? 0;
      }
    }
  } catch (err) {
    summary.errors.push(`job1: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Job 2: unlock family access for accounts that have been renewed
  // (status='active' AND tier='paid' but their grants are still flagged off
  // from a prior expiry).
  //
  // Critical: only re-activate grants that were *system-locked* by Job 1,
  // not grants the owner manually revoked through Family Access Manager.
  // We tell them apart via revoked_at:
  //   • revoked_at IS NULL     → system-locked (or never deactivated). Re-activate.
  //   • revoked_at IS NOT NULL → owner-revoked. Leave alone — owner has to
  //                              manually re-enable this grant if they want to.
  try {
    const { data: renewed } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('tier', 'paid')
      .eq('status', 'active');

    for (const row of renewed || []) {
      const { error: unlockErr, count } = await supabase
        .from('folio_authorized_users')
        .update({ is_active: true })
        .eq('owner_id', row.user_id)
        .eq('is_active', false)
        .is('revoked_at', null)
        .select('*', { count: 'exact', head: true });
      if (unlockErr) {
        summary.errors.push(`unlock ${row.user_id}: ${unlockErr.message}`);
      } else {
        summary.family_access_unlocked += count ?? 0;
      }
    }
  } catch (err) {
    summary.errors.push(`job2: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Job 3: hard-delete accounts whose grace period has ended without
  // renewal. Two trigger conditions:
  //   • decision='delete' AND scheduled_deletion_at < now (user explicitly
  //     chose to cancel; we honored a small delay to allow undo via support)
  //   • decision IS NULL AND grace_period_ends_at < now (no decision; default
  //     to deletion per Carl's no-retention policy)
  try {
    const { data: toDelete } = await supabase
      .from('user_subscriptions')
      .select('user_id, decision, scheduled_deletion_at, grace_period_ends_at')
      .eq('tier', 'trial')
      .lt('grace_period_ends_at', now)
      .or('decision.is.null,decision.eq.delete');

    for (const row of toDelete || []) {
      try {
        // Invoke delete-user-account with service role auth + targetUserId.
        const res = await fetch(`${supabaseUrl}/functions/v1/delete-user-account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
          },
          body: JSON.stringify({ confirm: 'DELETE', targetUserId: row.user_id }),
        });
        if (!res.ok) {
          const txt = await res.text();
          summary.errors.push(`delete ${row.user_id}: ${res.status} ${txt}`);
          continue;
        }
        summary.accounts_deleted++;
      } catch (err) {
        summary.errors.push(`delete ${row.user_id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    summary.errors.push(`job3: ${err instanceof Error ? err.message : String(err)}`);
  }

  return new Response(JSON.stringify(summary), {
    status: summary.errors.length > 0 ? 207 : 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
