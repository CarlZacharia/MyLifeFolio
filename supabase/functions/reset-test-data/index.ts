// Supabase Edge Function: Reset test data
// Deletes all @mylifefolio.test users and cascaded data
// Requires admin user (is_admin = true in profiles)

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno global available in Edge Functions runtime
declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEST_DOMAIN = '@mylifefolio.test';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'No auth header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify the caller is an admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await adminClient.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List all users and filter to test domain
    const { data: allUsers, error: listErr } = await adminClient.auth.admin.listUsers();
    if (listErr) throw new Error(`Failed to list users: ${listErr.message}`);

    const testUsers = allUsers.users.filter((u: any) => u.email?.endsWith(TEST_DOMAIN));

    if (testUsers.length === 0) {
      return new Response(JSON.stringify({
        success: true, message: 'No test users found', deleted: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete each test user (cascades to all data)
    const deleted: string[] = [];
    const failed: string[] = [];

    for (const testUser of testUsers) {
      const { error: delErr } = await adminClient.auth.admin.deleteUser(testUser.id);
      if (delErr) {
        failed.push(`${testUser.email}: ${delErr.message}`);
      } else {
        deleted.push(testUser.email!);
      }
    }

    return new Response(JSON.stringify({
      success: failed.length === 0,
      message: `Deleted ${deleted.length} test user(s)`,
      deleted,
      failed: failed.length > 0 ? failed : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
