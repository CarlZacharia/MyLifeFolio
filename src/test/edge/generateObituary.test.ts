// @vitest-environment node

/**
 * Integration tests for the generate-obituary Edge Function.
 * Calls the REAL deployed function — Claude API tokens are consumed.
 *
 * Run with: npm run test:edge
 */

import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import {
  callEdgeFunction,
  getAdminAuthToken,
  getValidAuthToken,
  createAdminClient,
  PERSONAS,
  SEED_PASSWORD,
} from './edgeHelpers';
import { SupabaseClient } from '@supabase/supabase-js';

let authToken: string;
let admin: SupabaseClient;

// Seed-dependent: may be undefined if seed data doesn't exist
let marriedIntakeId: string | undefined;

beforeAll(async () => {
  admin = createAdminClient();

  // Use the auto-created admin user for auth (does not require seed)
  authToken = await getAdminAuthToken();

  // Try to look up the married persona's intake_id for rate-limit tests
  try {
    const seedToken = await getValidAuthToken(PERSONAS.married, SEED_PASSWORD);
    if (seedToken) {
      const { data: users } = await admin.auth.admin.listUsers();
      const user = users?.users?.find((u) => u.email === PERSONAS.married);
      if (user) {
        const { data: intake } = await admin
          .from('folio_intakes')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (intake) marriedIntakeId = intake.id;
      }
    }
  } catch {
    // Seed data not available — rate limit tests will be skipped
  }
}, 30_000);

// Reset generation_count after rate-limit tests
afterEach(async () => {
  if (!marriedIntakeId) return;
  await admin
    .from('legacy_obituary')
    .update({ generation_count: 0 })
    .eq('intake_id', marriedIntakeId);
  await admin
    .from('legacy_obituary_spouse')
    .update({ generation_count: 0 })
    .eq('intake_id', marriedIntakeId);
}, 10_000);

const MINIMAL_OBITUARY_DATA = {
  preferredName: 'Test Person',
  nicknames: '',
  dateOfBirth: '',
  placeOfBirth: '',
  dateOfDeath: '',
  placeOfDeath: '',
  hometowns: '',
  religiousAffiliation: '',
  militaryService: '',
  education: '',
  careerHighlights: '',
  communityInvolvement: '',
  awardsHonors: '',
  spouses: '',
  children: '',
  grandchildren: '',
  siblings: '',
  parents: '',
  othersToMention: '',
  precededInDeath: '',
  tone: 'Brief',
  quotesToInclude: '',
  whatToRemember: '',
  personalMessage: '',
  preferredFuneralHome: '',
  burialOrCremation: '',
  servicePreferences: '',
  charitableDonations: '',
};

// ── Authentication ───────────────────────────────────────────────────────────

describe('generate-obituary Edge Function', () => {
  describe('Authentication', () => {
    test('returns 401 when no auth token provided', async () => {
      const { status, data } = await callEdgeFunction('generate-obituary', {
        obituaryData: MINIMAL_OBITUARY_DATA,
      });
      expect(status).toBe(401);
      expect((data as Record<string, unknown>)?.error).toBe('Unauthorized');
    }, 30_000);

    test('returns 401 when invalid auth token provided', async () => {
      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: MINIMAL_OBITUARY_DATA },
        'invalid-token-abc123'
      );
      expect(status).toBe(401);
      expect((data as Record<string, unknown>)?.error).toBe('Unauthorized');
    }, 30_000);

    test('returns 200 when valid auth token provided', async () => {
      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: MINIMAL_OBITUARY_DATA },
        authToken
      );
      expect(status).toBe(200);
      expect((data as Record<string, unknown>)?.success).toBe(true);
    }, 30_000);
  });

  // ── Rate Limiting ──────────────────────────────────────────────────────────

  describe('Rate Limiting', () => {
    test('succeeds when generation_count is below 5', async () => {
      if (!marriedIntakeId) {
        console.log('SKIP: married persona not seeded — run npm run seed');
        return;
      }
      await admin
        .from('legacy_obituary')
        .update({ generation_count: 0 })
        .eq('intake_id', marriedIntakeId);

      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        {
          obituaryData: MINIMAL_OBITUARY_DATA,
          intake_id: marriedIntakeId,
          person_type: 'client',
        },
        authToken
      );
      expect(status).toBe(200);
      expect((data as Record<string, unknown>)?.success).toBe(true);
    }, 30_000);

    test('returns 429 with limitReached=true when generation_count >= 5', async () => {
      if (!marriedIntakeId) {
        console.log('SKIP: married persona not seeded — run npm run seed');
        return;
      }
      await admin
        .from('legacy_obituary')
        .update({ generation_count: 5 })
        .eq('intake_id', marriedIntakeId);

      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        {
          obituaryData: MINIMAL_OBITUARY_DATA,
          intake_id: marriedIntakeId,
          person_type: 'client',
        },
        authToken
      );
      expect(status).toBe(429);
      const d = data as Record<string, unknown>;
      expect(d?.success).toBe(false);
      expect(d?.limitReached).toBe(true);
    }, 30_000);

    test('client and spouse have independent rate limits', async () => {
      if (!marriedIntakeId) {
        console.log('SKIP: married persona not seeded — run npm run seed');
        return;
      }
      await admin
        .from('legacy_obituary')
        .update({ generation_count: 5 })
        .eq('intake_id', marriedIntakeId);
      await admin
        .from('legacy_obituary_spouse')
        .update({ generation_count: 0 })
        .eq('intake_id', marriedIntakeId);

      const { status } = await callEdgeFunction(
        'generate-obituary',
        {
          obituaryData: { ...MINIMAL_OBITUARY_DATA, preferredName: 'Robert' },
          intake_id: marriedIntakeId,
          person_type: 'spouse',
        },
        authToken
      );
      expect(status).toBe(200);
    }, 30_000);
  });

  // ── Input Handling ─────────────────────────────────────────────────────────

  describe('Input Handling', () => {
    test('generates obituary with full data — response contains preferredName', async () => {
      const fullData = {
        ...MINIMAL_OBITUARY_DATA,
        preferredName: 'Margaret Thornton',
        dateOfBirth: 'June 15, 1948',
        placeOfBirth: 'Columbus, Ohio',
        spouses: 'Robert Thornton',
        children: 'Sarah, Michael, Jennifer',
        tone: 'Warm & Personal',
      };
      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: fullData },
        authToken
      );
      expect(status).toBe(200);
      const d = data as Record<string, unknown>;
      expect(d?.success).toBe(true);
      expect((d?.obituary as string)).toContain('Margaret');
    }, 30_000);

    test('generates obituary with minimal data — only preferredName', async () => {
      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: MINIMAL_OBITUARY_DATA },
        authToken
      );
      expect(status).toBe(200);
      const d = data as Record<string, unknown>;
      expect(d?.success).toBe(true);
      expect((d?.obituary as string)).toContain('Test Person');
    }, 30_000);

    test('returns 500 when preferredName is missing', async () => {
      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: { ...MINIMAL_OBITUARY_DATA, preferredName: '' } },
        authToken
      );
      expect(status).toBe(500);
      expect((data as Record<string, unknown>)?.success).toBe(false);
    }, 30_000);

    test('formal tone does not produce casual language', async () => {
      const { status, data } = await callEdgeFunction(
        'generate-obituary',
        {
          obituaryData: { ...MINIMAL_OBITUARY_DATA, preferredName: 'John Smith', tone: 'Formal' },
        },
        authToken
      );
      expect(status).toBe(200);
      const obituary = (data as Record<string, unknown>)?.obituary as string;
      expect(obituary).toBeDefined();
      expect(obituary).not.toMatch(/^(Hey|Hi)\b/);
    }, 30_000);
  });

  // ── Response Shape ─────────────────────────────────────────────────────────

  describe('Response Shape', () => {
    test('success response has obituary string and usage object', async () => {
      const { data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: MINIMAL_OBITUARY_DATA },
        authToken
      );
      const d = data as Record<string, unknown>;
      expect(typeof d?.obituary).toBe('string');
      expect(d?.usage).toBeDefined();
      const usage = d?.usage as Record<string, unknown>;
      expect(typeof usage?.input_tokens).toBe('number');
      expect(typeof usage?.output_tokens).toBe('number');
    }, 30_000);

    test('obituary text is at least 100 characters', async () => {
      const { data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: MINIMAL_OBITUARY_DATA },
        authToken
      );
      const obituary = (data as Record<string, unknown>)?.obituary as string;
      expect(obituary.length).toBeGreaterThanOrEqual(100);
    }, 30_000);

    test('obituary text is under 6000 characters', async () => {
      const { data } = await callEdgeFunction(
        'generate-obituary',
        { obituaryData: MINIMAL_OBITUARY_DATA },
        authToken
      );
      const obituary = (data as Record<string, unknown>)?.obituary as string;
      expect(obituary.length).toBeLessThan(6000);
    }, 30_000);
  });
});
