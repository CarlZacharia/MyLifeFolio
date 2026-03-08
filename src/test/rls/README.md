# RLS (Row-Level Security) Tests

These tests verify that Supabase RLS policies correctly enforce data isolation between users.

## Prerequisites

A real Supabase connection is required — these tests do not use mocks. You can run against either a **local Docker instance** or the **hosted instance**.

### Option 1: Local Docker (recommended for CI)

Add these to `.env`:

```env
SUPABASE_LOCAL_URL=http://127.0.0.1:54321
SUPABASE_LOCAL_ANON_KEY=<your local anon key>
SUPABASE_LOCAL_SERVICE_ROLE_KEY=<your local service role key>
```

When these are set, the tests use the local instance and ignore hosted credentials.

### Option 2: Hosted fallback

If the `SUPABASE_LOCAL_*` variables are **not** set, the tests fall back to:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

The service role key must not be the placeholder value `your-service-role-key-here`.

### Resolution order

| Purpose | 1st choice (local) | 2nd choice (hosted) |
|---------|-------------------|-------------------|
| URL | `SUPABASE_LOCAL_URL` | `VITE_SUPABASE_URL` |
| Anon key | `SUPABASE_LOCAL_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` |
| Service role | `SUPABASE_LOCAL_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |

## Running

```bash
npm run test:rls
```

The test output will log which instance is being used:

```
[RLS Tests] Using LOCAL Docker Supabase instance: http://127.0.0.1:54321
```

or

```
[RLS Tests] Using HOSTED Supabase instance: https://your-project.supabase.co
```

## What gets tested

| Table | Policies tested |
|-------|----------------|
| `folio_intakes` | SELECT/INSERT/UPDATE/DELETE own; blocked cross-user read/insert/update/delete |
| `vault_documents` | SELECT/INSERT/DELETE own; blocked cross-user read/insert |
| `legacy_obituary` | SELECT/INSERT/UPDATE own; blocked cross-user read/insert/delete |
| `profiles` | SELECT/UPDATE own; admin SELECT all; admin cannot UPDATE others |
| `folio_authorized_users` | Owner CRUD; authorized user can read own active record; inactive blocked; stranger blocked |
| `folio_documents` | Owner CRUD; authorized user reads via `visible_to`; not-in-visible_to blocked; stranger blocked |
| `folio_access_log` | Owner reads own; accessor inserts with own email; spoofed email blocked |
| Cross-table | CASCADE delete; full user isolation across all tables |

## Architecture

- **`rlsHelpers.ts`** — Client factories, test user management, data factories
- **`rls.test.ts`** — All test suites (45 tests)
- Uses `// @vitest-environment node` to bypass jsdom (no browser environment needed)
- Each test creates unique users with random UUID email suffixes
- Cleanup happens in `afterEach` via CASCADE DELETE of test users

## Test users

Tests create temporary users with emails like `rls-test-a1b2c3d4@test.mylifefolio.com`. They are automatically cleaned up after each test via `auth.admin.deleteUser()`, which CASCADE deletes all child rows.

## Troubleshooting

- **"Missing environment variables"** — Set either the `SUPABASE_LOCAL_*` trio or the hosted trio in `.env`. See Resolution order above.
- **"SUPABASE_SERVICE_ROLE_KEY is still the placeholder"** — Replace `your-service-role-key-here` in `.env` with the real key from your Supabase dashboard (Settings → API → service_role key). This only applies when using hosted mode.
- **Timeouts** — Each test has a 30s timeout. If tests are slow, check your network connection (hosted) or that Docker is running (local).
- **42501 errors in unexpected places** — This means an RLS policy is blocking an operation. This is expected for cross-user tests.
- **"Request rate limit reached"** — The hosted Supabase free tier rate-limits auth operations. The 45 tests create ~70 sign-ins in rapid succession, which triggers the limit. **Use a local Docker instance** to avoid this. Alternatively, you can increase the rate limit in Supabase Dashboard → Auth → Rate Limits.
