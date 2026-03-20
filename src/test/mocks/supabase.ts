import { vi } from 'vitest';

/**
 * Reusable Supabase mock with override helpers.
 *
 * Usage:
 *   import { mockSupabaseError, mockStorageError, resetSupabaseMocks } from '../mocks/supabase';
 *
 *   beforeEach(() => resetSupabaseMocks());
 *   test('handles DB error', () => {
 *     mockSupabaseError('vault_documents', 'select', 'Row-level security violation');
 *     // ...render and assert
 *   });
 */

// Re-import the mocked supabase so we can manipulate it
import { supabase } from '../../../lib/supabase';

// ── Chain builder ─────────────────────────────────────────────────────────

function buildSelectChain(data: unknown[] = [], error: { message: string } | null = null) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const chainProxy = () => chain;

  chain.eq = vi.fn().mockImplementation(chainProxy);
  chain.like = vi.fn().mockImplementation(chainProxy);
  chain.order = vi.fn().mockImplementation(chainProxy);
  chain.limit = vi.fn().mockImplementation(chainProxy);
  chain.maybeSingle = vi.fn().mockResolvedValue({ data: data[0] ?? null, error });
  chain.single = vi.fn().mockResolvedValue({ data: data[0] ?? null, error });
  // Allow awaiting the chain directly (for queries without .single/.maybeSingle)
  chain.then = vi.fn((resolve: (v: { data: unknown[]; error: typeof error }) => void) =>
    Promise.resolve(resolve({ data, error }))
  );

  return chain;
}

function buildMutationChain(data: unknown = null, error: { message: string } | null = null) {
  return {
    eq: vi.fn().mockResolvedValue({ data, error }),
    select: vi.fn(() => ({
      single: vi.fn().mockResolvedValue({ data, error }),
    })),
  };
}

// ── Override helpers ──────────────────────────────────────────────────────

const tableOverrides: Record<string, Record<string, { data?: unknown; error?: { message: string } }>> = {};
const storageOverrides: Record<string, { error?: { message: string } }> = {};

export function mockSupabaseError(table: string, operation: string, errorMessage: string) {
  if (!tableOverrides[table]) tableOverrides[table] = {};
  tableOverrides[table][operation] = { error: { message: errorMessage } };
}

export function mockSupabaseData(table: string, operation: string, data: unknown) {
  if (!tableOverrides[table]) tableOverrides[table] = {};
  tableOverrides[table][operation] = { data };
}

export function mockStorageError(operation: string, errorMessage: string) {
  storageOverrides[operation] = { error: { message: errorMessage } };
}

export function resetSupabaseMocks() {
  // Clear override maps
  Object.keys(tableOverrides).forEach((k) => delete tableOverrides[k]);
  Object.keys(storageOverrides).forEach((k) => delete storageOverrides[k]);

  // Reset the `from` mock to use overrides
  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    const overrides = tableOverrides[table] || {};

    const selectError = overrides.select?.error ?? null;
    const selectData = (overrides.select?.data ?? []) as unknown[];

    const insertError = overrides.insert?.error ?? null;
    const insertData = overrides.insert?.data ?? null;

    const deleteError = overrides.delete?.error ?? null;

    return {
      select: vi.fn(() => buildSelectChain(selectData, selectError)),
      insert: vi.fn(() => buildMutationChain(insertData, insertError)),
      update: vi.fn(() => buildMutationChain(null, overrides.update?.error ?? null)),
      delete: vi.fn(() => buildMutationChain(null, deleteError)),
    };
  });

  // Reset storage mock to use overrides
  (supabase.storage.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
    upload: vi.fn().mockResolvedValue(
      storageOverrides.upload?.error
        ? { data: null, error: storageOverrides.upload.error }
        : { data: { path: 'mock/path' }, error: null }
    ),
    createSignedUrl: vi.fn().mockResolvedValue(
      storageOverrides.createSignedUrl?.error
        ? { data: null, error: storageOverrides.createSignedUrl.error }
        : { data: { signedUrl: 'https://mock-signed-url.test' }, error: null }
    ),
    remove: vi.fn().mockResolvedValue(
      storageOverrides.remove?.error
        ? { data: null, error: storageOverrides.remove.error }
        : { data: null, error: null }
    ),
  }));

  // Reset auth mocks to defaults
  (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: { user: { id: 'test-user-id', email: 'test@test.com' } },
    error: null,
  });
  (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: { session: { access_token: 'mock-token', user: { id: 'test-user-id', email: 'test@test.com' } } },
    error: null,
  });
  (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: { user: { id: 'test-user-id' } },
    error: null,
  });
}
