/**
 * Seed Reset Script — MyLifeFolio
 *
 * Deletes all @mylifefolio.test users and their cascaded data.
 * FK cascade handles cleanup of intakes_raw, folio_intakes, and all child tables.
 *
 * Usage: npx tsx scripts/seed-reset.ts
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'your-service-role-key-here') {
  console.error('ERROR: Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Safety: block production
if (SUPABASE_URL.includes('prod') || !SUPABASE_URL.includes('supabase.co')) {
  console.error('ERROR: This script should only run against dev/staging Supabase.');
  process.exit(1);
}

const TEST_DOMAIN = '@mylifefolio.test';
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('========================================');
  console.log('MyLifeFolio Test Data Reset');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log('========================================');

  // 1. List all users
  const { data: allUsers, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    console.error('Failed to list users:', listErr.message);
    process.exit(1);
  }

  // 2. Filter to test domain only
  const testUsers = allUsers.users.filter((u) => u.email?.endsWith(TEST_DOMAIN));

  if (testUsers.length === 0) {
    console.log('\nNo test users found. Nothing to reset.');
    return;
  }

  console.log(`\nFound ${testUsers.length} test user(s):`);
  testUsers.forEach((u) => console.log(`  - ${u.email} (${u.id})`));

  // 3. Safety check: confirm no non-test users will be affected
  const nonTestCount = allUsers.users.length - testUsers.length;
  console.log(`\n${nonTestCount} non-test user(s) will NOT be affected.`);

  // 4. Delete each test user
  // Deleting auth.users cascades to profiles (profiles.id → auth.users ON DELETE CASCADE)
  // Deleting profiles does NOT cascade to intakes_raw/folio_intakes (those reference auth.users directly)
  // But intakes_raw.user_id and folio_intakes.user_id both have ON DELETE CASCADE to auth.users
  // So deleting the auth user cascades everything.
  for (const user of testUsers) {
    console.log(`\n  Deleting ${user.email}...`);

    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.error(`    FAILED to delete ${user.email}: ${delErr.message}`);
    } else {
      console.log(`    ✓ Deleted ${user.email} and all cascaded data`);
    }
  }

  console.log('\n========================================');
  console.log('Reset complete!');
  console.log('========================================');
}

main();
