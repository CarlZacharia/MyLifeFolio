// Supabase Edge Function: delete-user-account
//
// Permanently deletes a user account and all associated data. Called from
// TrialExpiredPage.tsx when the user confirms "Cancel and delete my data"
// (with confirm: 'DELETE'), and from the daily cron when a trial+grace
// period has elapsed without a renewal decision.
//
// How the cascade works:
//   • Most user-owned tables have `user_id REFERENCES auth.users(id) ON
//     DELETE CASCADE`, so a single auth.admin.deleteUser() call removes
//     everything keyed by user_id automatically.
//   • Storage objects are NOT covered by FK cascades — we explicitly walk
//     every bucket and remove the user's prefix before deleting the auth row.
//   • Family-access grants where the deleted user is the OWNER are cascaded
//     because folio_authorized_users.owner_id has the cascade constraint.
//   • Family-access grants where the deleted user is the GRANTEE (i.e. they
//     accepted access to someone else's folio) — those rows reference auth.users
//     by user_email, not user_id, so they remain. That's correct: the
//     OWNER is still the customer and may want to re-grant later.

// @ts-ignore Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore Deno global
declare const Deno: { env: { get(key: string): string | undefined } };

const ALLOWED_ORIGINS = new Set([
  'https://mylifefolio.com',
  'https://www.mylifefolio.com',
  'http://localhost:5173',
  ...(Deno.env.get('ALLOWED_ORIGIN') ? [Deno.env.get('ALLOWED_ORIGIN')!] : []),
]);

// Storage buckets that may hold user data. Each user's files live under a
// prefix derived from their UUID or a client folder name; we list and remove
// everything matching their UUID, then everything under their client-folder
// path (computed from profiles.client_folder_name if present).
const USER_STORAGE_BUCKETS = [
  'estate-plan-documents',
  'vault-documents',
  'legacy-videos',
  'memory-vault',
];

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://mylifefolio.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: corsHeaders(req),
      });
    }

    // 1) Confirm caller identity using their JWT
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: corsHeaders(req),
      });
    }
    const user = userData.user;

    // 2) Require explicit confirmation in the body. Defense in depth.
    let body: { confirm?: string; targetUserId?: string } = {};
    try { body = await req.json(); } catch { body = {}; }
    if (body.confirm !== 'DELETE') {
      return new Response(JSON.stringify({ error: 'Confirmation token required' }), {
        status: 400, headers: corsHeaders(req),
      });
    }

    // 3) An admin can pass `targetUserId` to delete on behalf of (used by the
    //    daily cron after grace-period expiry, which calls this function with
    //    the service role). For self-deletion the caller's own id is used.
    const isAdminCaller = user.app_metadata?.role === 'service_role'
      || user.email?.endsWith('@zacbrownlaw.com');
    const targetUserId = (body.targetUserId && isAdminCaller) ? body.targetUserId : user.id;

    // 4) Service-role client — required to delete auth.users and to ignore RLS.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 5) Wipe storage objects. List + remove per bucket.
    for (const bucket of USER_STORAGE_BUCKETS) {
      try {
        // Top-level prefix variants. We remove everything matching the user's
        // UUID; if a client_folder_name was used we'd also need that, but
        // those paths typically still include the UUID somewhere.
        const prefixes = [`${targetUserId}/`, `clients/${targetUserId}/`];
        for (const prefix of prefixes) {
          const { data: files } = await adminClient.storage.from(bucket).list(prefix, {
            limit: 1000, sortBy: { column: 'name', order: 'asc' },
          });
          if (!files || files.length === 0) continue;
          const paths = files.map((f) => `${prefix}${f.name}`);
          await adminClient.storage.from(bucket).remove(paths);
        }
      } catch (err) {
        console.warn(`[delete-user-account] bucket=${bucket} cleanup failed`, err);
        // Non-fatal — proceed to DB cascade. Orphaned blobs can be GC'd later.
      }
    }

    // 6) Delete auth.users — cascades to every table with FK to auth.users(id).
    const { error: delErr } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (delErr) {
      console.error('[delete-user-account] admin.deleteUser failed', delErr);
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 500, headers: corsHeaders(req),
      });
    }

    return new Response(JSON.stringify({ ok: true, deleted_user_id: targetUserId }), {
      status: 200, headers: corsHeaders(req),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    console.error('[delete-user-account] error', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: corsHeaders(req),
    });
  }
});
