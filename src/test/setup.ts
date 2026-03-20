import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── Global Supabase mock ──────────────────────────────────────────────────
// This mock is applied globally so no test ever hits a real Supabase instance.

const mockSelectChain = {
  eq: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  then: vi.fn((cb: (val: { data: unknown[]; error: null }) => void) => {
    return Promise.resolve(cb({ data: [], error: null }));
  }),
};

// Make select/insert/update/delete all return the chainable object
const mockFrom = vi.fn(() => ({
  select: vi.fn(() => mockSelectChain),
  insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })), error: null })),
  update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })),
  delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })),
}));

const mockStorageFrom = vi.fn(() => ({
  upload: vi.fn().mockResolvedValue({ data: { path: 'mock/path' }, error: null }),
  createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://mock-signed-url.test' }, error: null }),
  remove: vi.fn().mockResolvedValue({ data: null, error: null }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: mockFrom,
    storage: { from: mockStorageFrom },
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@test.com' } },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'test-user-id', email: 'test@test.com' } } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

// ── Global obituaryGenerator mock ─────────────────────────────────────────

vi.mock('../../lib/obituaryGenerator', () => ({
  generateObituary: vi.fn().mockResolvedValue({
    success: true,
    obituary: 'Mock generated obituary text for testing purposes.',
  }),
}));

// ── Global fetch mock (for Edge Functions) ────────────────────────────────

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({ success: true }),
});

// ── Suppress jsdom navigation errors ──────────────────────────────────────
// window.location.reload is not implemented in jsdom
Object.defineProperty(window, 'location', {
  writable: true,
  value: { ...window.location, reload: vi.fn() },
});

// ── Clipboard mock ────────────────────────────────────────────────────────
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// ── URL.createObjectURL mock ──────────────────────────────────────────────
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();
