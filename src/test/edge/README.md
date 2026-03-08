# Edge Function Integration Tests

These tests call **real deployed Supabase Edge Functions** over HTTP. They are not mocked — actual Claude API calls are made, and real tokens are consumed.

## Prerequisites

1. **Edge Functions must be deployed** before running tests:
   ```bash
   npx supabase functions deploy
   ```

2. **Seed data must exist** — the tests rely on seeded personas:
   ```bash
   npm run seed
   ```

3. **Environment variables** in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Test Users

| User | Email | Purpose |
|------|-------|---------|
| Margaret Thornton | `margaret.thornton@mylifefolio.test` | Obituary generation tests (has obituary data) |
| Rosa Martinez | `rosa.martinez@mylifefolio.test` | Family chat proxy owner (has rich legacy data) |
| Emily Blank | `empty.intake@mylifefolio.test` | Unauthorized user for 403 tests |
| Edge Admin | `edge-admin@zacbrownlaw.com` | Admin auth token (created automatically) |
| Edge Family | `edge-family@mylifefolio.test` | Authorized family member (created in beforeAll, deleted in afterAll) |

All seed personas use password: `TestPass123!`

## Running

```bash
npm run test:edge
```

## Expected Run Time

**2–3 minutes** due to Claude API calls in `generate-obituary` and `family-chat-proxy` tests.

## Token Usage

Each test run consumes approximately:
- **generate-obituary**: ~8 calls × ~500 input tokens + ~300 output tokens ≈ 6,400 tokens
- **family-chat-proxy**: ~7 calls × ~2,000 input tokens + ~200 output tokens ≈ 15,400 tokens
- **Total**: ~22,000 tokens per run (~$0.08 with Sonnet pricing)

## Test Structure

```
src/test/edge/
├── edgeHelpers.ts                  # Shared helpers: callEdgeFunction, auth tokens, persona emails
├── generateObituary.test.ts        # 13 tests: auth, rate limiting, input handling, response shape
├── familyChatProxy.test.ts         # 12 tests: auth/authz, data filtering, input validation, response
├── encryptSensitiveData.test.ts    # 9 tests: encryption, decryption, input validation
└── README.md                       # This file
```
