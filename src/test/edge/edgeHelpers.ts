import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env eagerly so env vars are available at import time
config({ path: resolve(__dirname, '../../../.env'), override: true });

// ── Environment ──────────────────────────────────────────────────────────────

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
export const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

// ── Seed persona credentials ─────────────────────────────────────────────────

export const SEED_PASSWORD = 'TestPass123!';

export const PERSONAS = {
  married: 'margaret.thornton@mylifefolio.test',
  widowed: 'james.wilson@mylifefolio.test',
  assets: 'chen.family@mylifefolio.test',
  legacy: 'rosa.martinez@mylifefolio.test',
  sparse: 'empty.intake@mylifefolio.test',
} as const;

// ── Admin client ─────────────────────────────────────────────────────────────

export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Auth token helpers ───────────────────────────────────────────────────────

/**
 * Sign in via Supabase auth and return the raw access_token (JWT).
 */
export async function getValidAuthToken(
  email: string,
  password: string = SEED_PASSWORD
): Promise<string> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`);
  const token = data.session?.access_token;
  if (!token) throw new Error(`Auth succeeded for ${email} but no access_token returned`);
  console.log(`  ✓ Auth token for ${email}: ${token.slice(0, 20)}…`);
  return token;
}

const adminTokenCache: { token?: string } = {};

/**
 * Get an auth token for a @zacbrownlaw.com admin user.
 * Creates the user if it does not exist.
 */
export async function getAdminAuthToken(): Promise<string> {
  if (adminTokenCache.token) return adminTokenCache.token;

  const admin = createAdminClient();
  const email = 'edge-admin@zacbrownlaw.com';
  const password = SEED_PASSWORD;

  // Create if not exists
  const { data: listData } = await admin.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email === email);
  let userId = existing?.id;
  if (!existing) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error && !error.message.includes('already')) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
    userId = created?.user?.id;
  }

  // Ensure profile exists with is_admin = true
  if (userId) {
    await admin
      .from('profiles')
      .upsert({ id: userId, email, is_admin: true }, { onConflict: 'id' });
  }

  const token = await getValidAuthToken(email, password);
  adminTokenCache.token = token;
  return token;
}

// ── Edge Function caller ─────────────────────────────────────────────────────

export interface EdgeResponse {
  status: number;
  data: unknown;
}

/**
 * Call a deployed Supabase Edge Function over HTTP.
 */
export async function callEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
  authToken?: string
): Promise<EdgeResponse> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(
      `Failed to reach Edge Function "${functionName}" at ${url}. ` +
        `Are Edge Functions deployed? Run: npx supabase functions deploy\n` +
        `Original error: ${err}`
    );
  }

  let data = await res.json().catch(() => null);

  // Debug logging for non-200 responses
  if (res.status !== 200) {
    console.log(`  [${functionName}] ${res.status} → ${JSON.stringify(data)}`);
  }

  // Detect undeployed functions and give a clear error
  if (
    res.status === 404 &&
    data &&
    typeof data === 'object' &&
    (data as Record<string, unknown>).code === 'NOT_FOUND'
  ) {
    throw new Error(
      `Edge Function "${functionName}" is not deployed. ` +
        `Deploy it first: npx supabase functions deploy ${functionName}`
    );
  }

  // Normalize gateway 401 responses to match function-level shape.
  // Gateway returns { code: 401, message: "..." }
  // Function returns { success: false, error: "..." }
  if (res.status === 401 && data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (d.message && !d.error) {
      d.error = d.message;
    }
    if (d.code && d.success === undefined) {
      d.success = false;
    }
  }

  return { status: res.status, data };
}
