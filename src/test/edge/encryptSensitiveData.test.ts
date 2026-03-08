// @vitest-environment node

/**
 * Integration tests for the encrypt-sensitive-data Edge Function.
 * Calls the REAL deployed function.
 *
 * Run with: npm run test:edge
 */

import { describe, test, expect, beforeAll } from 'vitest';
import {
  callEdgeFunction,
  getAdminAuthToken,
} from './edgeHelpers';

let authToken: string;

beforeAll(async () => {
  // encrypt-sensitive-data relies on JWT gateway validation
  authToken = await getAdminAuthToken();
}, 30_000);

// ── Encryption ───────────────────────────────────────────────────────────────

describe('encrypt-sensitive-data Edge Function', () => {
  describe('Encryption', () => {
    test('encrypts socialSecurityNumber field — result differs from input', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        {
          action: 'encrypt',
          data: { socialSecurityNumber: '123-45-6789', name: 'Test Person' },
        },
        authToken
      );
      expect(status).toBe(200);
      const d = data as Record<string, unknown>;
      expect(d?.success).toBe(true);
      const result = d?.data as Record<string, unknown>;
      expect(result?.socialSecurityNumber).toBeDefined();
      expect(result?.socialSecurityNumber).not.toBe('123-45-6789');
      expect(typeof result?.socialSecurityNumber).toBe('string');
      // Encrypted value should be a base64 string, much longer than input
      expect((result?.socialSecurityNumber as string).length).toBeGreaterThan(20);
    }, 20_000);

    test('encrypts spouseSocialSecurityNumber field', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        {
          action: 'encrypt',
          data: { spouseSocialSecurityNumber: '987-65-4321' },
        },
        authToken
      );
      expect(status).toBe(200);
      const result = (data as Record<string, unknown>)?.data as Record<string, unknown>;
      expect(result?.spouseSocialSecurityNumber).not.toBe('987-65-4321');
      expect((result?.spouseSocialSecurityNumber as string).length).toBeGreaterThan(20);
    }, 20_000);

    test('non-sensitive fields pass through unchanged', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        {
          action: 'encrypt',
          data: {
            name: 'John Doe',
            email: 'john@example.com',
            stateOfDomicile: 'Florida',
          },
        },
        authToken
      );
      expect(status).toBe(200);
      const result = (data as Record<string, unknown>)?.data as Record<string, unknown>;
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
      expect(result?.stateOfDomicile).toBe('Florida');
    }, 20_000);

    test('empty object returns empty object', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        { action: 'encrypt', data: {} },
        authToken
      );
      expect(status).toBe(200);
      const result = (data as Record<string, unknown>)?.data as Record<string, unknown>;
      expect(Object.keys(result ?? {})).toHaveLength(0);
    }, 20_000);

    test('field with null value passes through unchanged', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        {
          action: 'encrypt',
          data: { socialSecurityNumber: null, name: 'Test' },
        },
        authToken
      );
      expect(status).toBe(200);
      const result = (data as Record<string, unknown>)?.data as Record<string, unknown>;
      expect(result?.socialSecurityNumber).toBeNull();
      expect(result?.name).toBe('Test');
    }, 20_000);
  });

  // ── Decryption ─────────────────────────────────────────────────────────────

  describe('Decryption', () => {
    test('decrypt reverses encrypt — round-trip returns original value', async () => {
      const original = '111-22-3333';

      // Step 1: Encrypt
      const { data: encData } = await callEdgeFunction(
        'encrypt-sensitive-data',
        {
          action: 'encrypt',
          data: { socialSecurityNumber: original },
        },
        authToken
      );
      const encrypted = ((encData as Record<string, unknown>)?.data as Record<string, unknown>)
        ?.socialSecurityNumber as string;
      expect(encrypted).not.toBe(original);

      // Step 2: Decrypt
      const { status, data: decData } = await callEdgeFunction(
        'encrypt-sensitive-data',
        {
          action: 'decrypt',
          data: { socialSecurityNumber: encrypted },
        },
        authToken
      );
      expect(status).toBe(200);
      const decrypted = ((decData as Record<string, unknown>)?.data as Record<string, unknown>)
        ?.socialSecurityNumber as string;
      expect(decrypted).toBe(original);
    }, 20_000);

    test('non-sensitive fields pass through unchanged during decrypt', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        {
          action: 'decrypt',
          data: { name: 'Jane Doe', email: 'jane@example.com' },
        },
        authToken
      );
      expect(status).toBe(200);
      const result = (data as Record<string, unknown>)?.data as Record<string, unknown>;
      expect(result?.name).toBe('Jane Doe');
      expect(result?.email).toBe('jane@example.com');
    }, 20_000);
  });

  // ── Input Validation ───────────────────────────────────────────────────────

  describe('Input Validation', () => {
    test('returns 400 for invalid action value', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        { action: 'transform', data: { foo: 'bar' } },
        authToken
      );
      expect(status).toBe(400);
      expect((data as Record<string, unknown>)?.error).toBeDefined();
    }, 20_000);

    test('returns 400 when action is missing', async () => {
      const { status, data } = await callEdgeFunction(
        'encrypt-sensitive-data',
        { data: { foo: 'bar' } },
        authToken
      );
      expect(status).toBe(400);
      expect((data as Record<string, unknown>)?.error).toBeDefined();
    }, 20_000);
  });
});
