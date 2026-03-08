import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env eagerly so env vars are available at import time
config({ path: resolve(__dirname, '../../../.env'), override: true });

// ── Environment ──────────────────────────────────────────────────────────────
//
// Resolution order (local Docker takes priority when set):
//   URL:             SUPABASE_LOCAL_URL            → VITE_SUPABASE_URL
//   Anon key:        SUPABASE_LOCAL_ANON_KEY       → VITE_SUPABASE_ANON_KEY
//   Service role:    SUPABASE_LOCAL_SERVICE_ROLE_KEY → SUPABASE_SERVICE_ROLE_KEY

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function resolveEnv(): { url: string; anonKey: string; serviceRoleKey: string; isLocal: boolean } {
  const localUrl = getEnv('SUPABASE_LOCAL_URL');
  const localAnonKey = getEnv('SUPABASE_LOCAL_ANON_KEY');
  const localServiceRoleKey = getEnv('SUPABASE_LOCAL_SERVICE_ROLE_KEY');

  const hostedUrl = getEnv('VITE_SUPABASE_URL');
  const hostedAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');
  const hostedServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const isLocal = !!(localUrl && localServiceRoleKey);

  const url = localUrl || hostedUrl;
  const anonKey = localAnonKey || hostedAnonKey;
  const serviceRoleKey = localServiceRoleKey || hostedServiceRoleKey;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error(
      'Missing environment variables.\n' +
      'For local Docker: set SUPABASE_LOCAL_URL, SUPABASE_LOCAL_ANON_KEY, and SUPABASE_LOCAL_SERVICE_ROLE_KEY.\n' +
      'For hosted fallback: set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  if (!isLocal && serviceRoleKey === 'your-service-role-key-here') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is still the placeholder value. Replace it with the real service role key from your Supabase dashboard.'
    );
  }
  return { url, anonKey, serviceRoleKey, isLocal };
}

/** Log which Supabase instance is being used (called once at startup). */
export function logTargetInstance(): void {
  const { url, isLocal } = resolveEnv();
  const mode = isLocal ? 'LOCAL Docker' : 'HOSTED';
  console.log(`[RLS Tests] Using ${mode} Supabase instance: ${url}`);
}

// ── Client Factories ─────────────────────────────────────────────────────────

/**
 * Admin client that bypasses RLS (uses service role key).
 * Use this for test setup/teardown only.
 */
export function createAdminClient(): SupabaseClient {
  const { url, serviceRoleKey } = resolveEnv();
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Authenticated client that respects RLS (uses anon key + user JWT).
 * This simulates a real browser session for a specific user.
 */
export async function createAuthenticatedClient(
  email: string,
  password: string
): Promise<SupabaseClient> {
  const { url, anonKey } = resolveEnv();
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Failed to sign in as ${email}: ${error.message}`);
  }
  return client;
}

// ── Test User Management ─────────────────────────────────────────────────────

const TEST_PASSWORD = 'RlsTestPass123!';

/**
 * Generate a unique test email to avoid collisions between test runs.
 */
export function testEmail(prefix: string = 'rls-test'): string {
  const suffix = randomUUID().slice(0, 8);
  return `${prefix}-${suffix}@test.mylifefolio.com`;
}

/**
 * Create a test user via the admin API. Returns the user ID.
 * Also creates a profile row (via the handle_new_user trigger).
 */
export async function createTestUser(
  admin: SupabaseClient,
  email: string
): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`Failed to create user ${email}: ${error.message}`);
  return data.user.id;
}

/**
 * Delete a test user via the admin API.
 * CASCADE will clean up profiles, folio_intakes, and all child rows.
 */
export async function deleteTestUser(
  admin: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`Failed to delete user ${userId}: ${error.message}`);
}

/**
 * Sign in as a test user and return an authenticated client.
 */
export async function signInAsUser(
  email: string
): Promise<SupabaseClient> {
  return createAuthenticatedClient(email, TEST_PASSWORD);
}

// ── Test Data Factories ──────────────────────────────────────────────────────

/**
 * Create a folio_intakes row for a user. Returns the intake ID.
 */
export async function createTestIntake(
  admin: SupabaseClient,
  userId: string,
  clientName: string = 'RLS Test Client'
): Promise<string> {
  const { data, error } = await admin
    .from('folio_intakes')
    .insert({
      user_id: userId,
      client_name: clientName,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create intake: ${error.message}`);
  return data.id;
}

/**
 * Create a vault_documents row. Returns the document ID.
 */
export async function createTestVaultDocument(
  admin: SupabaseClient,
  userId: string,
  intakeId: string,
  overrides: Record<string, unknown> = {}
): Promise<string> {
  const { data, error } = await admin
    .from('vault_documents')
    .insert({
      user_id: userId,
      intake_id: intakeId,
      category: 'estate_planning',
      document_name: 'Test Document',
      file_path: `${userId}/test-doc.pdf`,
      file_name: 'test-doc.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      ...overrides,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create vault document: ${error.message}`);
  return data.id;
}

/**
 * Create a legacy_obituary row. Returns the obituary ID.
 */
export async function createTestLegacyObituary(
  admin: SupabaseClient,
  userId: string,
  intakeId: string,
  overrides: Record<string, unknown> = {}
): Promise<string> {
  const { data, error } = await admin
    .from('legacy_obituary')
    .insert({
      user_id: userId,
      intake_id: intakeId,
      preferred_name: 'Test Person',
      ...overrides,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create legacy obituary: ${error.message}`);
  return data.id;
}

/**
 * Create a folio_authorized_users row. Returns the authorized user ID.
 */
export async function createTestAuthorizedUser(
  admin: SupabaseClient,
  ownerId: string,
  authorizedEmail: string,
  overrides: Record<string, unknown> = {}
): Promise<string> {
  const { data, error } = await admin
    .from('folio_authorized_users')
    .insert({
      owner_id: ownerId,
      authorized_email: authorizedEmail,
      display_name: 'Test Authorized User',
      access_sections: ['estate_planning'],
      ...overrides,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create authorized user: ${error.message}`);
  return data.id;
}

/**
 * Create a folio_documents row. Returns the document ID.
 */
export async function createTestFolioDocument(
  admin: SupabaseClient,
  ownerId: string,
  overrides: Record<string, unknown> = {}
): Promise<string> {
  const { data, error } = await admin
    .from('folio_documents')
    .insert({
      owner_id: ownerId,
      file_name: 'test-folio-doc.pdf',
      storage_path: `${ownerId}/test-folio-doc.pdf`,
      file_size: 2048,
      mime_type: 'application/pdf',
      description: 'Test folio document',
      visible_to: [],
      ...overrides,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create folio document: ${error.message}`);
  return data.id;
}

/**
 * Create a folio_access_log row. Returns the log ID.
 */
export async function createTestAccessLog(
  admin: SupabaseClient,
  ownerId: string,
  accessorEmail: string,
  overrides: Record<string, unknown> = {}
): Promise<string> {
  const { data, error } = await admin
    .from('folio_access_log')
    .insert({
      owner_id: ownerId,
      accessor_email: accessorEmail,
      accessor_name: 'Test Accessor',
      access_type: 'chat',
      sections_queried: ['estate_planning'],
      ...overrides,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create access log: ${error.message}`);
  return data.id;
}

export { TEST_PASSWORD };
