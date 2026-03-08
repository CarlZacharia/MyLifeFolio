// @vitest-environment node

/**
 * RLS (Row-Level Security) Policy Tests
 *
 * These tests verify that Supabase RLS policies correctly enforce data isolation.
 * They use a REAL Supabase connection — not mocks.
 *
 * Requirements (one of):
 *   - Local Docker: SUPABASE_LOCAL_URL, SUPABASE_LOCAL_ANON_KEY, SUPABASE_LOCAL_SERVICE_ROLE_KEY
 *   - Hosted fallback: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run with: npm run test:rls
 */

import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  createAdminClient,
  createTestUser,
  deleteTestUser,
  signInAsUser,
  testEmail,
  createTestIntake,
  createTestVaultDocument,
  createTestLegacyObituary,
  createTestAuthorizedUser,
  createTestFolioDocument,
  createTestAccessLog,
  logTargetInstance,
} from './rlsHelpers';

// ── Shared state ─────────────────────────────────────────────────────────────

let admin: SupabaseClient;

// Track user IDs created during tests for cleanup
const createdUserIds: string[] = [];

beforeAll(() => {
  logTargetInstance();
  admin = createAdminClient();
});

afterEach(async () => {
  // Clean up all users created during this test (CASCADE deletes everything)
  for (const userId of createdUserIds) {
    try {
      await deleteTestUser(admin, userId);
    } catch {
      // Best-effort cleanup — don't fail the test
    }
  }
  createdUserIds.length = 0;
}, 30_000);

// ── Helper to track users for cleanup ────────────────────────────────────────

async function setupUser(emailPrefix: string = 'rls'): Promise<{ userId: string; email: string }> {
  const email = testEmail(emailPrefix);
  const userId = await createTestUser(admin, email);
  createdUserIds.push(userId);
  return { userId, email };
}

// ── folio_intakes RLS ────────────────────────────────────────────────────────

describe('folio_intakes RLS', () => {
  test('user can read their own intakes', async () => {
    const { userId, email } = await setupUser('intakes-own');
    const intakeId = await createTestIntake(admin, userId);
    const client = await signInAsUser(email);

    const { data, error } = await client.from('folio_intakes').select('id').eq('id', intakeId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(intakeId);
  }, 30_000);

  test('user cannot read another user\'s intakes', async () => {
    const userA = await setupUser('intakes-a');
    const userB = await setupUser('intakes-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const clientB = await signInAsUser(userB.email);

    const { data, error } = await clientB.from('folio_intakes').select('id').eq('id', intakeId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user can insert their own intake', async () => {
    const { userId, email } = await setupUser('intakes-insert');
    const client = await signInAsUser(email);

    const { data, error } = await client
      .from('folio_intakes')
      .insert({ user_id: userId, client_name: 'Self Insert Test' })
      .select('id')
      .single();
    expect(error).toBeNull();
    expect(data!.id).toBeDefined();
  }, 30_000);

  test('user cannot insert an intake for another user', async () => {
    const userA = await setupUser('intakes-ins-a');
    const userB = await setupUser('intakes-ins-b');
    const clientA = await signInAsUser(userA.email);

    const { error } = await clientA
      .from('folio_intakes')
      .insert({ user_id: userB.userId, client_name: 'Impostor Insert' });
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501'); // RLS violation
  }, 30_000);

  test('user can update their own intake', async () => {
    const { userId, email } = await setupUser('intakes-update');
    const intakeId = await createTestIntake(admin, userId);
    const client = await signInAsUser(email);

    const { error } = await client
      .from('folio_intakes')
      .update({ client_name: 'Updated Name' })
      .eq('id', intakeId);
    expect(error).toBeNull();

    // Verify the update took effect
    const { data } = await client.from('folio_intakes').select('client_name').eq('id', intakeId).single();
    expect(data!.client_name).toBe('Updated Name');
  }, 30_000);

  test('user cannot update another user\'s intake', async () => {
    const userA = await setupUser('intakes-upd-a');
    const userB = await setupUser('intakes-upd-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const clientB = await signInAsUser(userB.email);

    // This won't error but should update 0 rows (RLS filters it out)
    await clientB.from('folio_intakes').update({ client_name: 'Hacked' }).eq('id', intakeId);

    // Verify unchanged via admin
    const { data } = await admin.from('folio_intakes').select('client_name').eq('id', intakeId).single();
    expect(data!.client_name).not.toBe('Hacked');
  }, 30_000);

  test('user can delete their own intake', async () => {
    const { userId, email } = await setupUser('intakes-delete');
    const intakeId = await createTestIntake(admin, userId);
    const client = await signInAsUser(email);

    const { error } = await client.from('folio_intakes').delete().eq('id', intakeId);
    expect(error).toBeNull();

    // Verify deleted
    const { data } = await admin.from('folio_intakes').select('id').eq('id', intakeId);
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user cannot delete another user\'s intake', async () => {
    const userA = await setupUser('intakes-del-a');
    const userB = await setupUser('intakes-del-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const clientB = await signInAsUser(userB.email);

    await clientB.from('folio_intakes').delete().eq('id', intakeId);

    // Verify NOT deleted via admin
    const { data } = await admin.from('folio_intakes').select('id').eq('id', intakeId);
    expect(data).toHaveLength(1);
  }, 30_000);
});

// ── vault_documents RLS ──────────────────────────────────────────────────────

describe('vault_documents RLS', () => {
  test('user can read their own vault documents', async () => {
    const { userId, email } = await setupUser('vault-own');
    const intakeId = await createTestIntake(admin, userId);
    const docId = await createTestVaultDocument(admin, userId, intakeId);
    const client = await signInAsUser(email);

    const { data, error } = await client.from('vault_documents').select('id').eq('id', docId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  }, 30_000);

  test('user cannot read another user\'s vault documents', async () => {
    const userA = await setupUser('vault-a');
    const userB = await setupUser('vault-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const docId = await createTestVaultDocument(admin, userA.userId, intakeId);
    const clientB = await signInAsUser(userB.email);

    const { data, error } = await clientB.from('vault_documents').select('id').eq('id', docId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user can insert their own vault document', async () => {
    const { userId, email } = await setupUser('vault-insert');
    const intakeId = await createTestIntake(admin, userId);
    const client = await signInAsUser(email);

    const { data, error } = await client
      .from('vault_documents')
      .insert({
        user_id: userId,
        intake_id: intakeId,
        category: 'personal',
        document_name: 'Self Upload',
        file_path: `${userId}/self.pdf`,
        file_name: 'self.pdf',
        file_size: 512,
        file_type: 'application/pdf',
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    expect(data!.id).toBeDefined();
  }, 30_000);

  test('user cannot insert a vault document for another user', async () => {
    const userA = await setupUser('vault-ins-a');
    const userB = await setupUser('vault-ins-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const clientB = await signInAsUser(userB.email);

    const { error } = await clientB
      .from('vault_documents')
      .insert({
        user_id: userA.userId,
        intake_id: intakeId,
        category: 'personal',
        document_name: 'Impostor Doc',
        file_path: `${userA.userId}/impostor.pdf`,
        file_name: 'impostor.pdf',
        file_size: 512,
        file_type: 'application/pdf',
      });
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  }, 30_000);

  test('user can delete their own vault document', async () => {
    const { userId, email } = await setupUser('vault-delete');
    const intakeId = await createTestIntake(admin, userId);
    const docId = await createTestVaultDocument(admin, userId, intakeId);
    const client = await signInAsUser(email);

    const { error } = await client.from('vault_documents').delete().eq('id', docId);
    expect(error).toBeNull();

    const { data } = await admin.from('vault_documents').select('id').eq('id', docId);
    expect(data).toHaveLength(0);
  }, 30_000);
});

// ── legacy_obituary RLS ──────────────────────────────────────────────────────

describe('legacy_obituary RLS', () => {
  test('user can read their own obituary', async () => {
    const { userId, email } = await setupUser('obit-own');
    const intakeId = await createTestIntake(admin, userId);
    const obitId = await createTestLegacyObituary(admin, userId, intakeId);
    const client = await signInAsUser(email);

    const { data, error } = await client.from('legacy_obituary').select('id').eq('id', obitId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  }, 30_000);

  test('user cannot read another user\'s obituary', async () => {
    const userA = await setupUser('obit-a');
    const userB = await setupUser('obit-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const obitId = await createTestLegacyObituary(admin, userA.userId, intakeId);
    const clientB = await signInAsUser(userB.email);

    const { data, error } = await clientB.from('legacy_obituary').select('id').eq('id', obitId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user can insert their own obituary', async () => {
    const { userId, email } = await setupUser('obit-insert');
    const intakeId = await createTestIntake(admin, userId);
    const client = await signInAsUser(email);

    const { data, error } = await client
      .from('legacy_obituary')
      .insert({
        user_id: userId,
        intake_id: intakeId,
        preferred_name: 'Self Created',
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    expect(data!.id).toBeDefined();
  }, 30_000);

  test('user cannot insert an obituary for another user', async () => {
    const userA = await setupUser('obit-ins-a');
    const userB = await setupUser('obit-ins-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const clientB = await signInAsUser(userB.email);

    const { error } = await clientB
      .from('legacy_obituary')
      .insert({
        user_id: userA.userId,
        intake_id: intakeId,
        preferred_name: 'Impostor Obit',
      });
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  }, 30_000);

  test('user can update their own obituary', async () => {
    const { userId, email } = await setupUser('obit-update');
    const intakeId = await createTestIntake(admin, userId);
    const obitId = await createTestLegacyObituary(admin, userId, intakeId);
    const client = await signInAsUser(email);

    const { error } = await client
      .from('legacy_obituary')
      .update({ preferred_name: 'Updated Name' })
      .eq('id', obitId);
    expect(error).toBeNull();

    const { data } = await client.from('legacy_obituary').select('preferred_name').eq('id', obitId).single();
    expect(data!.preferred_name).toBe('Updated Name');
  }, 30_000);

  test('user cannot delete another user\'s obituary', async () => {
    const userA = await setupUser('obit-del-a');
    const userB = await setupUser('obit-del-b');
    const intakeId = await createTestIntake(admin, userA.userId);
    const obitId = await createTestLegacyObituary(admin, userA.userId, intakeId);
    const clientB = await signInAsUser(userB.email);

    await clientB.from('legacy_obituary').delete().eq('id', obitId);

    // Verify NOT deleted
    const { data } = await admin.from('legacy_obituary').select('id').eq('id', obitId);
    expect(data).toHaveLength(1);
  }, 30_000);
});

// ── profiles RLS ─────────────────────────────────────────────────────────────

describe('profiles RLS', () => {
  test('user can read their own profile', async () => {
    const { userId, email } = await setupUser('prof-own');
    const client = await signInAsUser(email);

    const { data, error } = await client.from('profiles').select('id, email').eq('id', userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(userId);
  }, 30_000);

  test('non-admin user cannot read another user\'s profile', async () => {
    const userA = await setupUser('prof-a');
    const userB = await setupUser('prof-b');
    const clientB = await signInAsUser(userB.email);

    const { data, error } = await clientB.from('profiles').select('id').eq('id', userA.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user can update their own profile', async () => {
    const { userId, email } = await setupUser('prof-update');
    const client = await signInAsUser(email);

    const { error } = await client
      .from('profiles')
      .update({ name: 'Updated Profile Name' })
      .eq('id', userId);
    expect(error).toBeNull();

    const { data } = await client.from('profiles').select('name').eq('id', userId).single();
    expect(data!.name).toBe('Updated Profile Name');
  }, 30_000);

  test('user cannot update another user\'s profile', async () => {
    const userA = await setupUser('prof-upd-a');
    const userB = await setupUser('prof-upd-b');
    const clientB = await signInAsUser(userB.email);

    await clientB.from('profiles').update({ name: 'Hacked Name' }).eq('id', userA.userId);

    // Verify unchanged
    const { data } = await admin.from('profiles').select('name').eq('id', userA.userId).single();
    expect(data!.name).not.toBe('Hacked Name');
  }, 30_000);

  test('admin user can read all profiles', async () => {
    // Admin access is granted by @zacbrownlaw.com email domain in the JWT claim
    const adminEmail = testEmail('prof-admin').replace('@test.mylifefolio.com', '@zacbrownlaw.com');
    const adminUserId = await createTestUser(admin, adminEmail);
    createdUserIds.push(adminUserId);

    const userB = await setupUser('prof-target');

    const clientA = await signInAsUser(adminEmail);
    const { data, error } = await clientA.from('profiles').select('id').eq('id', userB.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(userB.userId);
  }, 30_000);

  test('admin read-all does not grant admin update on other profiles', async () => {
    // Admin access is granted by @zacbrownlaw.com email domain in the JWT claim
    const adminEmail = testEmail('prof-admin-upd').replace('@test.mylifefolio.com', '@zacbrownlaw.com');
    const adminUserId = await createTestUser(admin, adminEmail);
    createdUserIds.push(adminUserId);

    const targetUser = await setupUser('prof-admin-target');

    const adminClient = await signInAsUser(adminEmail);

    // Admin should be able to read but NOT update another user's profile
    // (there is no admin UPDATE policy, only admin SELECT)
    await adminClient.from('profiles').update({ name: 'Admin Override' }).eq('id', targetUser.userId);

    const { data } = await admin.from('profiles').select('name').eq('id', targetUser.userId).single();
    expect(data!.name).not.toBe('Admin Override');
  }, 30_000);
});

// ── folio_authorized_users RLS ───────────────────────────────────────────────

describe('folio_authorized_users RLS', () => {
  test('owner can read their authorized users list', async () => {
    const owner = await setupUser('authz-owner');
    const authorizedEmail = 'authorized@test.mylifefolio.com';
    const authzId = await createTestAuthorizedUser(admin, owner.userId, authorizedEmail);
    const ownerClient = await signInAsUser(owner.email);

    const { data, error } = await ownerClient.from('folio_authorized_users').select('id').eq('id', authzId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  }, 30_000);

  test('owner can insert an authorized user', async () => {
    const owner = await setupUser('authz-ins');
    const ownerClient = await signInAsUser(owner.email);

    const { data, error } = await ownerClient
      .from('folio_authorized_users')
      .insert({
        owner_id: owner.userId,
        authorized_email: 'new-auth@test.mylifefolio.com',
        display_name: 'New Auth User',
        access_sections: ['legacy'],
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    expect(data!.id).toBeDefined();
  }, 30_000);

  test('owner can delete their authorized user', async () => {
    const owner = await setupUser('authz-del');
    const authzId = await createTestAuthorizedUser(admin, owner.userId, 'del-auth@test.mylifefolio.com');
    const ownerClient = await signInAsUser(owner.email);

    const { error } = await ownerClient.from('folio_authorized_users').delete().eq('id', authzId);
    expect(error).toBeNull();

    const { data } = await admin.from('folio_authorized_users').select('id').eq('id', authzId);
    expect(data).toHaveLength(0);
  }, 30_000);

  test('authorized user can read their own active access record', async () => {
    const owner = await setupUser('authz-read-owner');
    const authzUser = await setupUser('authz-read-user');
    await createTestAuthorizedUser(admin, owner.userId, authzUser.email);
    const authzClient = await signInAsUser(authzUser.email);

    const { data, error } = await authzClient
      .from('folio_authorized_users')
      .select('id, authorized_email')
      .eq('owner_id', owner.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].authorized_email).toBe(authzUser.email);
  }, 30_000);

  test('authorized user cannot read inactive access record', async () => {
    const owner = await setupUser('authz-inactive-owner');
    const authzUser = await setupUser('authz-inactive-user');
    await createTestAuthorizedUser(admin, owner.userId, authzUser.email, { is_active: false });
    const authzClient = await signInAsUser(authzUser.email);

    const { data, error } = await authzClient
      .from('folio_authorized_users')
      .select('id')
      .eq('owner_id', owner.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user cannot read another owner\'s authorized users', async () => {
    const owner = await setupUser('authz-iso-owner');
    const stranger = await setupUser('authz-iso-stranger');
    await createTestAuthorizedUser(admin, owner.userId, 'someone@test.mylifefolio.com');
    const strangerClient = await signInAsUser(stranger.email);

    const { data, error } = await strangerClient
      .from('folio_authorized_users')
      .select('id')
      .eq('owner_id', owner.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user cannot insert an authorized user for another owner', async () => {
    const owner = await setupUser('authz-ins-owner');
    const stranger = await setupUser('authz-ins-stranger');
    const strangerClient = await signInAsUser(stranger.email);

    const { error } = await strangerClient
      .from('folio_authorized_users')
      .insert({
        owner_id: owner.userId,
        authorized_email: 'impostor@test.mylifefolio.com',
        display_name: 'Impostor Auth',
        access_sections: ['all'],
      });
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  }, 30_000);
});

// ── folio_documents RLS ──────────────────────────────────────────────────────

describe('folio_documents RLS', () => {
  test('owner can read their own documents', async () => {
    const owner = await setupUser('fdoc-own');
    const docId = await createTestFolioDocument(admin, owner.userId);
    const ownerClient = await signInAsUser(owner.email);

    const { data, error } = await ownerClient.from('folio_documents').select('id').eq('id', docId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  }, 30_000);

  test('owner can insert their own document', async () => {
    const owner = await setupUser('fdoc-insert');
    const ownerClient = await signInAsUser(owner.email);

    const { data, error } = await ownerClient
      .from('folio_documents')
      .insert({
        owner_id: owner.userId,
        file_name: 'owner-upload.pdf',
        storage_path: `${owner.userId}/owner-upload.pdf`,
        description: 'Owner uploaded',
        visible_to: [],
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    expect(data!.id).toBeDefined();
  }, 30_000);

  test('owner can delete their own document', async () => {
    const owner = await setupUser('fdoc-delete');
    const docId = await createTestFolioDocument(admin, owner.userId);
    const ownerClient = await signInAsUser(owner.email);

    const { error } = await ownerClient.from('folio_documents').delete().eq('id', docId);
    expect(error).toBeNull();

    const { data } = await admin.from('folio_documents').select('id').eq('id', docId);
    expect(data).toHaveLength(0);
  }, 30_000);

  test('stranger cannot read owner\'s documents', async () => {
    const owner = await setupUser('fdoc-iso-owner');
    const stranger = await setupUser('fdoc-iso-stranger');
    await createTestFolioDocument(admin, owner.userId);
    const strangerClient = await signInAsUser(stranger.email);

    const { data, error } = await strangerClient
      .from('folio_documents')
      .select('id')
      .eq('owner_id', owner.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('authorized user can read documents they are visible to', async () => {
    const owner = await setupUser('fdoc-vis-owner');
    const authzUser = await setupUser('fdoc-vis-user');
    const authzId = await createTestAuthorizedUser(admin, owner.userId, authzUser.email);
    await createTestFolioDocument(admin, owner.userId, { visible_to: [authzId] });
    const authzClient = await signInAsUser(authzUser.email);

    const { data, error } = await authzClient
      .from('folio_documents')
      .select('id, file_name')
      .eq('owner_id', owner.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  }, 30_000);

  test('authorized user cannot read documents not in their visible_to', async () => {
    const owner = await setupUser('fdoc-notvis-owner');
    const authzUser = await setupUser('fdoc-notvis-user');
    await createTestAuthorizedUser(admin, owner.userId, authzUser.email);
    // Document with empty visible_to
    await createTestFolioDocument(admin, owner.userId, { visible_to: [] });
    const authzClient = await signInAsUser(authzUser.email);

    const { data, error } = await authzClient
      .from('folio_documents')
      .select('id')
      .eq('owner_id', owner.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('user cannot insert a document for another owner', async () => {
    const owner = await setupUser('fdoc-ins-owner');
    const stranger = await setupUser('fdoc-ins-stranger');
    const strangerClient = await signInAsUser(stranger.email);

    const { error } = await strangerClient
      .from('folio_documents')
      .insert({
        owner_id: owner.userId,
        file_name: 'impostor.pdf',
        storage_path: `${owner.userId}/impostor.pdf`,
        description: 'Impostor upload',
        visible_to: [],
      });
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  }, 30_000);
});

// ── folio_access_log RLS ─────────────────────────────────────────────────────

describe('folio_access_log RLS', () => {
  test('owner can read their own access log', async () => {
    const owner = await setupUser('alog-own');
    const logId = await createTestAccessLog(admin, owner.userId, 'visitor@test.mylifefolio.com');
    const ownerClient = await signInAsUser(owner.email);

    const { data, error } = await ownerClient.from('folio_access_log').select('id').eq('id', logId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  }, 30_000);

  test('stranger cannot read owner\'s access log', async () => {
    const owner = await setupUser('alog-iso-owner');
    const stranger = await setupUser('alog-iso-stranger');
    await createTestAccessLog(admin, owner.userId, 'visitor@test.mylifefolio.com');
    const strangerClient = await signInAsUser(stranger.email);

    const { data, error } = await strangerClient
      .from('folio_access_log')
      .select('id')
      .eq('owner_id', owner.userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  }, 30_000);

  test('accessor can insert a log entry with their own email', async () => {
    const owner = await setupUser('alog-ins-owner');
    const accessor = await setupUser('alog-ins-accessor');
    const accessorClient = await signInAsUser(accessor.email);

    const { data, error } = await accessorClient
      .from('folio_access_log')
      .insert({
        owner_id: owner.userId,
        accessor_email: accessor.email,
        accessor_name: 'Test Accessor',
        access_type: 'chat',
        sections_queried: ['legacy'],
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    expect(data!.id).toBeDefined();
  }, 30_000);

  test('accessor cannot insert a log entry with someone else\'s email', async () => {
    const owner = await setupUser('alog-spoof-owner');
    const accessor = await setupUser('alog-spoof-accessor');
    const accessorClient = await signInAsUser(accessor.email);

    const { error } = await accessorClient
      .from('folio_access_log')
      .insert({
        owner_id: owner.userId,
        accessor_email: 'spoofed@test.mylifefolio.com',
        accessor_name: 'Spoofed Accessor',
        access_type: 'chat',
        sections_queried: ['estate_planning'],
      });
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  }, 30_000);
});

// ── Cross-table isolation ────────────────────────────────────────────────────

describe('Cross-table isolation', () => {
  test('deleting a user cascades to all their data', async () => {
    const email = testEmail('cascade');
    const userId = await createTestUser(admin, email);
    // Don't track in createdUserIds — we delete manually below

    const intakeId = await createTestIntake(admin, userId);
    await createTestVaultDocument(admin, userId, intakeId);
    await createTestLegacyObituary(admin, userId, intakeId);
    await createTestFolioDocument(admin, userId);
    await createTestAuthorizedUser(admin, userId, 'cascade-auth@test.mylifefolio.com');

    // Delete the user
    await deleteTestUser(admin, userId);

    // Verify everything is gone
    const { data: intakes } = await admin.from('folio_intakes').select('id').eq('user_id', userId);
    const { data: vaultDocs } = await admin.from('vault_documents').select('id').eq('user_id', userId);
    const { data: obits } = await admin.from('legacy_obituary').select('id').eq('user_id', userId);
    const { data: folioDocs } = await admin.from('folio_documents').select('id').eq('owner_id', userId);
    const { data: authzUsers } = await admin.from('folio_authorized_users').select('id').eq('owner_id', userId);
    const { data: profile } = await admin.from('profiles').select('id').eq('id', userId);

    expect(intakes).toHaveLength(0);
    expect(vaultDocs).toHaveLength(0);
    expect(obits).toHaveLength(0);
    expect(folioDocs).toHaveLength(0);
    expect(authzUsers).toHaveLength(0);
    expect(profile).toHaveLength(0);
  }, 30_000);

  test('user A data is fully isolated from user B across all tables', async () => {
    const userA = await setupUser('iso-a');
    const userB = await setupUser('iso-b');

    // Create data for user A
    const intakeA = await createTestIntake(admin, userA.userId, 'User A Intake');
    await createTestVaultDocument(admin, userA.userId, intakeA);
    await createTestLegacyObituary(admin, userA.userId, intakeA);

    // Create data for user B
    const intakeB = await createTestIntake(admin, userB.userId, 'User B Intake');
    await createTestVaultDocument(admin, userB.userId, intakeB);
    await createTestLegacyObituary(admin, userB.userId, intakeB);

    // User B should see ONLY their own data
    const clientB = await signInAsUser(userB.email);

    const { data: intakes } = await clientB.from('folio_intakes').select('id, client_name');
    expect(intakes).toHaveLength(1);
    expect(intakes![0].client_name).toBe('User B Intake');

    const { data: vaultDocs } = await clientB.from('vault_documents').select('id, user_id');
    expect(vaultDocs).toHaveLength(1);
    expect(vaultDocs![0].user_id).toBe(userB.userId);

    const { data: obits } = await clientB.from('legacy_obituary').select('id, user_id');
    expect(obits).toHaveLength(1);
    expect(obits![0].user_id).toBe(userB.userId);

    // User A should see ONLY their own data
    const clientA = await signInAsUser(userA.email);

    const { data: intakesA } = await clientA.from('folio_intakes').select('id, client_name');
    expect(intakesA).toHaveLength(1);
    expect(intakesA![0].client_name).toBe('User A Intake');
  }, 30_000);
});
