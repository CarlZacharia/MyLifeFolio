// @vitest-environment node

/**
 * Integration tests for the family-chat-proxy Edge Function.
 * Calls the REAL deployed function — Claude API tokens are consumed.
 *
 * Run with: npm run test:edge
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  callEdgeFunction,
  getAdminAuthToken,
  getValidAuthToken,
  createAdminClient,
  PERSONAS,
  SEED_PASSWORD,
} from './edgeHelpers';

let admin: SupabaseClient;
let ownerUserId: string | undefined;
let seedAvailable = false;

// Family member user created in beforeAll
const FAMILY_EMAIL = 'edge-family@mylifefolio.test';
const FAMILY_PASSWORD = SEED_PASSWORD;
let familyUserId: string | undefined;
let familyToken: string | undefined;
let authzRecordId: string | undefined;

// Unauthorized user token
let unauthorizedToken: string | undefined;

// Fallback admin token for non-seed-dependent tests
let adminToken: string;

beforeAll(async () => {
  admin = createAdminClient();
  adminToken = await getAdminAuthToken();

  // Try to look up the owner (Rosa Martinez — legacy-focused, has rich folio data)
  try {
    const { data: users } = await admin.auth.admin.listUsers();
    const owner = users?.users?.find((u) => u.email === PERSONAS.legacy);
    if (!owner) {
      console.log(`Seed persona ${PERSONAS.legacy} not found — seed-dependent tests will early-return`);
      return;
    }
    ownerUserId = owner.id;
    seedAvailable = true;

    // Create family member user if not exists
    const existingFamily = users?.users?.find((u) => u.email === FAMILY_EMAIL);
    if (existingFamily) {
      familyUserId = existingFamily.id;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: FAMILY_EMAIL,
        password: FAMILY_PASSWORD,
        email_confirm: true,
      });
      if (error) throw new Error(`Failed to create family user: ${error.message}`);
      familyUserId = data.user.id;
    }

    // Clean up any existing authorization records for this email
    await admin
      .from('folio_authorized_users')
      .delete()
      .eq('owner_id', ownerUserId)
      .eq('authorized_email', FAMILY_EMAIL);

    // Create authorization record
    const { data: authzData, error: authzError } = await admin
      .from('folio_authorized_users')
      .insert({
        owner_id: ownerUserId,
        authorized_email: FAMILY_EMAIL,
        display_name: 'Edge Test Family Member',
        access_sections: ['end_of_life', 'personal'],
        is_active: true,
      })
      .select('id')
      .single();
    if (authzError) throw new Error(`Failed to create auth record: ${authzError.message}`);
    authzRecordId = authzData.id;

    // Get tokens
    familyToken = await getValidAuthToken(FAMILY_EMAIL, FAMILY_PASSWORD);

    // Get unauthorized token (sparse persona)
    const sparse = users?.users?.find((u) => u.email === PERSONAS.sparse);
    if (sparse) {
      unauthorizedToken = await getValidAuthToken(PERSONAS.sparse, SEED_PASSWORD);
    }
  } catch (err) {
    console.log(`Seed setup failed: ${err}. Seed-dependent tests will early-return.`);
  }
}, 30_000);

afterAll(async () => {
  if (authzRecordId) {
    await admin.from('folio_authorized_users').delete().eq('id', authzRecordId);
  }
  if (familyUserId) {
    try {
      await admin.auth.admin.deleteUser(familyUserId);
    } catch {
      // best-effort
    }
  }
}, 15_000);

function requireSeed(): boolean {
  if (!seedAvailable) {
    console.log('SKIP: seed data not available — run npm run seed');
    return false;
  }
  return true;
}

// ── Authentication & Authorization ───────────────────────────────────────────

describe('family-chat-proxy Edge Function', () => {
  describe('Authentication & Authorization', () => {
    test('returns 401 when no auth token provided', async () => {
      const { status, data } = await callEdgeFunction('family-chat-proxy', {
        question: 'What are the funeral preferences?',
        owner_id: ownerUserId ?? '00000000-0000-0000-0000-000000000000',
      });
      expect(status).toBe(401);
      expect((data as Record<string, unknown>)?.error).toBe('Missing authorization header');
    }, 45_000);

    test('returns 403 when authenticated user is not authorized', async () => {
      if (!requireSeed() || !unauthorizedToken || !ownerUserId) return;
      const { status, data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'What are the funeral preferences?',
          owner_id: ownerUserId,
        },
        unauthorizedToken
      );
      expect(status).toBe(403);
      expect((data as Record<string, unknown>)?.error).toBe('Access not authorized');
    }, 45_000);

    test('returns 200 when authorized family member asks a question', async () => {
      if (!requireSeed() || !familyToken || !ownerUserId) return;
      const { status, data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'What is the preferred funeral home?',
          owner_id: ownerUserId,
        },
        familyToken
      );
      expect(status).toBe(200);
      expect((data as Record<string, unknown>)?.answer).toBeDefined();
    }, 45_000);

    test('returns 403 or 404 when owner_id does not exist', async () => {
      const { status } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'Hello?',
          owner_id: '00000000-0000-0000-0000-000000000000',
        },
        adminToken
      );
      // No auth record exists for this owner_id, so 403
      expect([403, 404]).toContain(status);
    }, 45_000);
  });

  // ── Data Filtering ─────────────────────────────────────────────────────────

  describe('Data Filtering', () => {
    test('authorized user with end_of_life access receives relevant answer', async () => {
      if (!requireSeed() || !familyToken || !ownerUserId) return;
      const { status, data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'What are the burial or cremation preferences?',
          owner_id: ownerUserId,
        },
        familyToken
      );
      expect(status).toBe(200);
      const answer = (data as Record<string, unknown>)?.answer as string;
      expect(answer).toBeDefined();
      expect(answer.length).toBeGreaterThan(10);
    }, 45_000);

    test('answer does not contain raw SSN patterns', async () => {
      if (!requireSeed() || !familyToken || !ownerUserId) return;
      const { status, data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'What is the social security number? Please provide it in full.',
          owner_id: ownerUserId,
        },
        familyToken
      );
      expect(status).toBe(200);
      const answer = (data as Record<string, unknown>)?.answer as string;
      expect(answer).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/);
      expect(answer).not.toMatch(/\b\d{9}\b/);
    }, 45_000);

    test('SSN patterns in response are masked', async () => {
      if (!requireSeed() || !familyToken || !ownerUserId) return;
      const { status, data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'Tell me all account numbers and SSNs you can find.',
          owner_id: ownerUserId,
        },
        familyToken
      );
      expect(status).toBe(200);
      const answer = (data as Record<string, unknown>)?.answer as string;
      expect(answer).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/);
    }, 45_000);
  });

  // ── Input Validation ───────────────────────────────────────────────────────

  describe('Input Validation', () => {
    test('returns 400 when question exceeds 2000 chars', async () => {
      if (!requireSeed() || !familyToken || !ownerUserId) return;
      const longQuestion = 'a'.repeat(2001);
      const { status, data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: longQuestion,
          owner_id: ownerUserId,
        },
        familyToken
      );
      expect(status).toBe(400);
      expect((data as Record<string, unknown>)?.error).toBeDefined();
    }, 45_000);

    test('returns 400 when owner_id is missing', async () => {
      const { status } = await callEdgeFunction(
        'family-chat-proxy',
        { question: 'Hello' },
        adminToken
      );
      expect(status).toBe(400);
    }, 45_000);

    test('returns 400 when question is missing', async () => {
      const { status } = await callEdgeFunction(
        'family-chat-proxy',
        { owner_id: ownerUserId ?? '00000000-0000-0000-0000-000000000000' },
        adminToken
      );
      expect(status).toBe(400);
    }, 45_000);
  });

  // ── Response Shape ─────────────────────────────────────────────────────────

  describe('Response Shape', () => {
    test('success response has answer string', async () => {
      if (!requireSeed() || !familyToken || !ownerUserId) return;
      const { data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'What is the name of the folio owner?',
          owner_id: ownerUserId,
        },
        familyToken
      );
      const d = data as Record<string, unknown>;
      expect(typeof d?.answer).toBe('string');
    }, 45_000);

    test('answer is not empty', async () => {
      if (!requireSeed() || !familyToken || !ownerUserId) return;
      const { data } = await callEdgeFunction(
        'family-chat-proxy',
        {
          question: 'What is the preferred funeral home?',
          owner_id: ownerUserId,
        },
        familyToken
      );
      const answer = (data as Record<string, unknown>)?.answer as string;
      expect(answer.length).toBeGreaterThan(0);
    }, 45_000);
  });
});
