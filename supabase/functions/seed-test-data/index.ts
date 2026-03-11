// Supabase Edge Function: Seed test data
// Called from AdminTestPanel to create 5 test personas
// Requires admin user (is_admin = true in profiles)
// Data is identical to scripts/seed.ts — keep both in sync.

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno global available in Edge Functions runtime
declare const Deno: { env: { get(key: string): string | undefined } };

// Allowed origins for CORS — production and local development
const ALLOWED_ORIGINS = new Set([
  'https://mylifefolio.com',
  'https://www.mylifefolio.com',
  'http://localhost:5173',
  ...(Deno.env.get('ALLOWED_ORIGIN') ? [Deno.env.get('ALLOWED_ORIGIN')!] : []),
]);

/** Return the request Origin if it's in the whitelist, otherwise the first allowed origin */
function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.has(origin) ? origin : 'https://mylifefolio.com';
}

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

const TEST_DOMAIN = '@mylifefolio.test';
const TEST_PASSWORD = 'TestPass123!';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'No auth header' }), {
        status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify the caller is an admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await adminClient.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // ================================================================
    // HELPER FUNCTIONS
    // ================================================================

    const results: string[] = [];

    async function ensureUser(email: string, name: string): Promise<string> {
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u: any) => u.email === email);
      if (existing) {
        await adminClient.from('profiles').update({ name, email }).eq('id', existing.id);
        return existing.id;
      }
      const { data, error } = await adminClient.auth.admin.createUser({
        email, password: TEST_PASSWORD, email_confirm: true,
      });
      if (error) throw new Error(`Failed to create ${email}: ${error.message}`);
      // handle_new_user() trigger auto-creates profile row. Retry up to 5 times
      // waiting for it, then UPDATE. Fall back to INSERT if trigger didn't fire.
      const uid = data.user.id;
      let profileFound = false;
      for (let i = 0; i < 5; i++) {
        const { data: p } = await adminClient.from('profiles').select('id').eq('id', uid).maybeSingle();
        if (p) { profileFound = true; break; }
        await new Promise((r) => setTimeout(r, 200));
      }
      if (profileFound) {
        await adminClient.from('profiles').update({ name, email }).eq('id', uid);
      } else {
        await adminClient.from('profiles').insert({ id: uid, name, email });
      }
      return uid;
    }

    async function createIntake(userId: string, formData: any, clientName: string, spouseName: string) {
      const { data: rawData, error: rawErr } = await adminClient
        .from('intakes_raw')
        .insert({ user_id: userId, intake_type: 'EstatePlanning', form_data: formData, client_name: clientName, spouse_name: spouseName || null })
        .select('id').single();
      if (rawErr) throw new Error(`intakes_raw: ${rawErr.message}`);

      const fd = formData;
      const { data: intakeData, error: intakeErr } = await adminClient
        .from('folio_intakes')
        .insert({
          user_id: userId,
          intake_raw_id: rawData.id,
          client_name: clientName,
          client_aka: fd.aka || null,
          client_sex: fd.sex || null,
          client_birth_date: fd.birthDate || null,
          client_mailing_address: [fd.mailingAddress, fd.mailingCity, fd.mailingState, fd.mailingZip]
            .filter(Boolean).join(', ') || null,
          client_state_of_domicile: fd.stateOfDomicile || null,
          client_cell_phone: fd.cellPhone || null,
          client_email: fd.email || null,
          client_served_military: fd.clientServedMilitary || false,
          client_military_branch: fd.clientMilitaryBranch || null,
          client_has_prepaid_funeral: fd.clientHasPrepaidFuneral || false,
          client_preferred_funeral_home: fd.clientPreferredFuneralHome || null,
          client_burial_or_cremation: fd.clientBurialOrCremation || null,
          marital_status: fd.maritalStatus || null,
          number_of_children: fd.numberOfChildren || 0,
          spouse_name: fd.spouseName || null,
          spouse_sex: fd.spouseSex || null,
          spouse_birth_date: fd.spouseBirthDate || null,
          spouse_email: fd.spouseEmail || null,
          spouse_cell_phone: fd.spouseCellPhone || null,
          additional_comments: fd.additionalComments || null,
        })
        .select('id').single();
      if (intakeErr) throw new Error(`folio_intakes: ${intakeErr.message}`);
      return { rawId: rawData.id, intakeId: intakeData.id };
    }

    async function insertRows(table: string, rows: any[]) {
      if (rows.length === 0) return;
      const { error } = await adminClient.from(table).insert(rows);
      if (error) throw new Error(`${table}: ${error.message}`);
    }

    // ================================================================
    // PERSONA 1: Margaret Thornton — Full data
    // ================================================================

    const uid1 = await ensureUser(`margaret.thornton${TEST_DOMAIN}`, 'Margaret Thornton');
    const i1 = await createIntake(uid1, {
      name: 'Margaret Thornton',
      sex: 'Female',
      maritalStatus: 'Married',
      numberOfChildren: 3,
      aka: 'Maggie',
      mailingAddress: '4521 Palm Beach Blvd',
      mailingCity: 'Naples',
      mailingState: 'FL',
      mailingZip: '34102',
      stateOfDomicile: 'Florida',
      cellPhone: '(239) 555-0142',
      email: `margaret.thornton${TEST_DOMAIN}`,
      birthDate: '1948-06-15',
      spouseName: 'Robert Thornton',
      spouseSex: 'Male',
      spouseBirthDate: '1946-03-22',
      spouseEmail: 'robert.thornton@example.com',
      spouseCellPhone: '(239) 555-0143',
      clientServedMilitary: true,
      clientMilitaryBranch: 'Navy',
      clientHasPrepaidFuneral: true,
      clientPreferredFuneralHome: 'Naples Memorial Gardens',
      clientBurialOrCremation: 'Cremation',
      dateMarried: '1970-09-12',
      placeOfMarriage: 'Columbus, Ohio',
      additionalComments: 'Seed data — full persona for testing.',
    }, 'Margaret Thornton', 'Robert Thornton');

    // Children
    await insertRows('folio_children', [
      { intake_id: i1.intakeId, user_id: uid1, name: 'Sarah Thompson', birth_date: '1972-04-10', relationship: 'Daughter of Both', marital_status: 'Married', has_children: true, number_of_children: 2, sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, name: 'Michael Thornton', birth_date: '1975-08-23', relationship: 'Son of Both', marital_status: 'Married', has_children: true, number_of_children: 1, sort_order: 1 },
      { intake_id: i1.intakeId, user_id: uid1, name: 'Jennifer Thornton-Lee', birth_date: '1979-12-01', relationship: 'Daughter of Both', marital_status: 'Married', has_children: true, number_of_children: 1, sort_order: 2 },
    ]);

    // Real estate
    await insertRows('folio_real_estate', [
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client and Spouse', category: 'Primary residence', street: '4521 Palm Beach Blvd', city: 'Naples', state: 'FL', zip: '34102', value: 850000, mortgage_balance: 0, sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client and Spouse', category: 'Vacation home', street: '128 Lake Shore Dr', city: 'Asheville', state: 'NC', zip: '28801', value: 425000, mortgage_balance: 150000, sort_order: 1 },
    ]);

    // Bank accounts
    await insertRows('folio_bank_accounts', [
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client and Spouse', account_type: 'Checking', institution: 'Wells Fargo', amount: 45000, sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client and Spouse', account_type: 'Savings', institution: 'Wells Fargo', amount: 180000, sort_order: 1 },
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client', account_type: 'CD', institution: 'Ally Bank', amount: 50000, sort_order: 2 },
    ]);

    // Retirement accounts
    await insertRows('folio_retirement_accounts', [
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client', account_type: 'IRA', institution: 'Fidelity', value: 320000, sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Spouse', account_type: '401(k)', institution: 'Vanguard', value: 540000, sort_order: 1 },
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client', account_type: 'Pension', institution: 'Naples Community Hospital', value: 180000, sort_order: 2 },
    ]);

    // Life insurance
    await insertRows('folio_life_insurance', [
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client', company: 'Northwestern Mutual', policy_type: 'Whole Life', face_amount: 250000, cash_value: 85000, insured: 'Margaret Thornton', sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Spouse', company: 'MetLife', policy_type: 'Term 20', face_amount: 500000, insured: 'Robert Thornton', sort_order: 1 },
    ]);

    // Vehicles
    await insertRows('folio_vehicles', [
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Client', year_make_model: '2022 Lexus RX 350', value: 42000, sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, owner: 'Spouse', year_make_model: '2021 Ford F-150', value: 35000, sort_order: 1 },
    ]);

    // Legacy — charity organizations
    await insertRows('legacy_charity_organizations', [
      { intake_id: i1.intakeId, user_id: uid1, organization_name: 'Habitat for Humanity — Collier County', website: 'https://habitatcollier.org', sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, organization_name: 'Naples Community Hospital Foundation', sort_order: 1 },
    ]);

    // Legacy — charity preferences
    await insertRows('legacy_charity_preferences', [{
      intake_id: i1.intakeId, user_id: uid1,
      donations_in_lieu_of_flowers: true,
      scholarship_fund: 'Thornton Nursing Scholarship at Ohio State',
      religious_donations: 'Naples United Methodist Church',
      legacy_giving_notes: 'Annual gifts to Habitat for Humanity',
      why_these_causes: 'Education and housing are foundations of a good life',
    }]);

    // Legacy — obituary
    await insertRows('legacy_obituary', [{
      intake_id: i1.intakeId, user_id: uid1,
      preferred_name: 'Margaret', nicknames: 'Maggie, Mags',
      date_of_birth: 'June 15, 1948', place_of_birth: 'Columbus, Ohio',
      hometowns: 'Columbus OH, Naples FL',
      religious_affiliation: 'Methodist',
      military_service: 'Served as Navy nurse, 1966-1970',
      education: 'Ohio State University, BS Nursing',
      career_highlights: 'Head nurse at Naples Community Hospital for 25 years',
      community_involvement: 'Garden Club president, Meals on Wheels volunteer',
      awards_honors: 'Nurse of the Year 1995, Community Service Award 2010',
      spouses: 'Robert Thornton (married 1970)',
      children: 'Sarah Thompson, Michael Thornton, Jennifer Thornton-Lee',
      grandchildren: 'Emma (12), Jack (9), Lily (7), Owen (4)',
      siblings: 'Dorothy Williams (sister), deceased brother Thomas',
      parents: 'Harold and Edith Summers',
      preceded_in_death: 'Brother Thomas Summers, parents',
      tone: 'Warm, celebrating a life of service',
      what_to_remember: 'Her legendary garden parties and infectious laugh',
      personal_message: 'Live fully, love deeply, and always keep fresh flowers on the table.',
      preferred_funeral_home: 'Naples Memorial Gardens',
      burial_or_cremation: 'Cremation',
      service_preferences: 'Small family gathering, outdoor memorial',
      charitable_donations: 'Naples Community Hospital Foundation',
    }]);

    // Legacy — obituary spouse
    await insertRows('legacy_obituary_spouse', [{
      intake_id: i1.intakeId, user_id: uid1,
      preferred_name: 'Robert', nicknames: 'Bob, Bobby',
      date_of_birth: 'March 22, 1946', place_of_birth: 'Dayton, Ohio',
      hometowns: 'Dayton OH, Naples FL',
      education: 'University of Dayton, MBA',
      career_highlights: 'Retired VP of Operations at Procter & Gamble',
      spouses: 'Margaret Thornton (married 1970)',
      children: 'Sarah, Michael, Jennifer',
      tone: 'Distinguished, warm',
    }]);

    // Legacy — personal history
    await insertRows('legacy_personal_history', [{
      intake_id: i1.intakeId, user_id: uid1,
      birthplace: 'Columbus, Ohio',
      childhood_memories: 'Playing in the backyard with siblings, summer trips to Lake Erie',
      parents_background: 'Father was a schoolteacher, mother was a homemaker',
      schools_attended: 'Bexley High School, Ohio State University',
      education_memories: 'Joined the nursing program after volunteering at a hospital',
      first_job: 'Candy striper at Riverside Methodist Hospital',
      career_milestones: 'Became head nurse at 32, mentored over 100 nursing students',
      proudest_professional: 'Starting the pediatric outreach program in Naples',
      how_we_met: 'Met Robert at a USO dance in Norfolk, Virginia',
      wedding_story: 'Married at St. Andrews Methodist Church with 200 guests',
      raising_children: 'Balanced nursing career with raising three children',
      important_decisions: 'Moving to Florida in 1985 for better opportunities',
      biggest_challenges: 'Caring for aging parents while working full time',
      risks_taken: 'Left a secure hospital job to start a home health agency',
    }]);

    // Legacy — reflections
    await insertRows('legacy_reflections', [{
      intake_id: i1.intakeId, user_id: uid1,
      what_matters_most: 'Family, faith, and making a difference in peoples lives',
      advice_to_younger: "Don't wait for the perfect moment — just begin",
      core_beliefs: 'Kindness is never wasted, hard work pays off',
      greatest_regrets: 'Not traveling more when we were younger',
      greatest_joys: 'Watching my grandchildren grow',
      how_remembered: 'As someone who always had time for others',
      personal_values: 'Family, Service, Faith, Kindness',
    }]);

    // Legacy — surprises
    await insertRows('legacy_surprises', [{
      intake_id: i1.intakeId, user_id: uid1,
      hidden_talents: 'Can play the ukulele and speaks basic Italian',
      unusual_experiences: 'Delivered a baby on a Greyhound bus in 1978',
      fun_facts: 'Has visited every national park east of the Mississippi',
      adventures: 'Sailed across the Gulf of Mexico with Robert',
      untold_stories: 'Once had lunch with Jimmy Carter at a charity event',
    }]);

    // Legacy — favorites
    await insertRows('legacy_favorites', [{
      intake_id: i1.intakeId, user_id: uid1,
      favorite_music: 'Frank Sinatra, The Beatles, Norah Jones',
      favorite_books: 'To Kill a Mockingbird, The Notebook',
      favorite_movies: 'The Sound of Music, Casablanca',
      favorite_foods: 'Key lime pie, fresh grouper, tomato soup',
      favorite_restaurants: 'The Bay House, USS Nemo',
      favorite_vacation_destinations: 'Tuscany, Asheville NC, Sanibel Island',
      favorite_quotes_sayings: '"Bloom where you are planted"',
      other_favorites: 'Gardening, bird watching, crossword puzzles',
    }]);

    // Legacy — letters
    await insertRows('legacy_letters', [
      { intake_id: i1.intakeId, user_id: uid1, recipient_type: 'Spouse', recipient_name: 'Robert', letter_body: 'My dearest Robert, fifty-five years of marriage and I would do it all again...', format: 'text', sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, recipient_type: 'Child', recipient_name: 'Sarah', letter_body: 'My sweet Sarah, you were my first and taught me what it means to be a mother...', format: 'text', sort_order: 1 },
      { intake_id: i1.intakeId, user_id: uid1, recipient_type: 'Child', recipient_name: 'Michael', letter_body: "Michael, you have your father's quiet strength and my stubborn determination...", format: 'text', sort_order: 2 },
    ]);

    // Legacy — stories
    await insertRows('legacy_stories', [
      { intake_id: i1.intakeId, user_id: uid1, story_title: 'The Night on the Greyhound', story_body: 'It was 1978, and I was traveling from Columbus to Cincinnati when a young woman went into labor...', people_involved: 'A grateful mother named Diane', approximate_date: '1978', location: 'Greyhound bus, Ohio', lessons_learned: 'Always be ready to help', sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, story_title: 'Sailing the Gulf', story_body: 'Robert surprised me for our 40th anniversary with a week-long sailing trip across the Gulf of Mexico...', people_involved: 'Robert Thornton', approximate_date: '2010', location: 'Gulf of Mexico', lessons_learned: 'Adventure has no age limit', sort_order: 1 },
    ]);

    // Legacy — memories
    await insertRows('legacy_memories', [
      { intake_id: i1.intakeId, user_id: uid1, memory_title: 'First Grandchild Emma', description: 'The day Emma was born — Sarah called us at 3am', approximate_year: '2014', location: 'Naples, FL', sort_order: 0 },
      { intake_id: i1.intakeId, user_id: uid1, memory_title: 'Garden Party 2005', description: 'The annual garden party where the sprinklers went off during dinner', approximate_year: '2005', location: 'Our backyard', sort_order: 1 },
    ]);

    // LTC
    await insertRows('folio_long_term_care', [{
      intake_id: i1.intakeId, user_id: uid1, person_type: 'client',
      primary_goals_concerns: 'Want to stay home as long as possible',
      ltc_concern_level: 'Moderate',
      overall_health: 'Good for age, mild arthritis',
      diagnoses: ['Arthritis', 'Hypertension'],
      current_living_situation: 'Own home',
      receives_home_help: false,
      likelihood_of_ltc_in_5_years: 'Possible',
      care_preference: 'Home care',
      has_ltc_insurance: true,
      ltc_insurance_company: 'Genworth',
      ltc_insurance_daily_benefit: '$200',
      ltc_insurance_term: '5 years',
      medicare_types: ['Part A', 'Part B'],
      care_setting_importance: {
        stayWithSpouse: 'Very Important',
        nearFamily: 'Very Important',
        privateRoom: 'Important',
        petFriendly: 'Somewhat Important',
        socialActivities: 'Important',
        onSiteMedicalStaff: 'Very Important',
        religiousCultural: 'Somewhat Important',
      },
    }]);

    // Current estate plan
    await insertRows('folio_current_estate_plan', [{
      intake_id: i1.intakeId, user_id: uid1, person_type: 'client',
      has_will: true, has_trust: true, has_financial_poa: true,
      has_health_care_poa: true, has_living_will: true,
      will_date_signed: '2018-03-15', will_state_signed: 'Florida',
      trust_date_signed: '2018-03-15', trust_state_signed: 'Florida',
      trust_name: 'Thornton Family Revocable Trust',
    }]);

    // Distribution plan
    await insertRows('folio_distribution_plans', [{
      intake_id: i1.intakeId, user_id: uid1, person_type: 'client',
      distribution_type: 'sweetheart', is_sweetheart_plan: true,
      has_specific_gifts: false, residuary_share_type: 'equal',
    }]);

    results.push('Margaret Thornton (Full)');

    // ================================================================
    // PERSONA 2: James Wilson — Moderate data, single widower
    // ================================================================

    const uid2 = await ensureUser(`james.wilson${TEST_DOMAIN}`, 'James Wilson');
    const i2 = await createIntake(uid2, {
      name: 'James Wilson',
      sex: 'Male',
      maritalStatus: 'Widowed',
      numberOfChildren: 2,
      mailingAddress: '789 Maple Avenue',
      mailingCity: 'Columbus',
      mailingState: 'OH',
      mailingZip: '43215',
      stateOfDomicile: 'Ohio',
      cellPhone: '(614) 555-0198',
      email: `james.wilson${TEST_DOMAIN}`,
      birthDate: '1952-11-30',
      clientBurialOrCremation: 'Burial',
      clientPreferredFuneralHome: 'Schoedinger Funeral Home',
      additionalComments: 'Seed data — moderate persona, widower.',
    }, 'James Wilson', '');

    // Children
    await insertRows('folio_children', [
      { intake_id: i2.intakeId, user_id: uid2, name: 'Andrew Wilson', birth_date: '1980-02-14', relationship: 'Son of Both', marital_status: 'Single', has_children: false, sort_order: 0 },
      { intake_id: i2.intakeId, user_id: uid2, name: 'Katherine Wilson-Park', birth_date: '1983-07-09', relationship: 'Daughter of Both', marital_status: 'Married', has_children: true, number_of_children: 2, sort_order: 1 },
    ]);

    // Real estate
    await insertRows('folio_real_estate', [
      { intake_id: i2.intakeId, user_id: uid2, owner: 'Client', category: 'Primary residence', street: '789 Maple Avenue', city: 'Columbus', state: 'OH', zip: '43215', value: 310000, mortgage_balance: 85000, sort_order: 0 },
    ]);

    // Bank accounts
    await insertRows('folio_bank_accounts', [
      { intake_id: i2.intakeId, user_id: uid2, owner: 'Client', account_type: 'Checking', institution: 'Huntington Bank', amount: 12000, sort_order: 0 },
      { intake_id: i2.intakeId, user_id: uid2, owner: 'Client', account_type: 'Savings', institution: 'Huntington Bank', amount: 65000, sort_order: 1 },
    ]);

    // Retirement
    await insertRows('folio_retirement_accounts', [
      { intake_id: i2.intakeId, user_id: uid2, owner: 'Client', account_type: 'IRA', institution: 'Charles Schwab', value: 280000, sort_order: 0 },
    ]);

    // Vehicles
    await insertRows('folio_vehicles', [
      { intake_id: i2.intakeId, user_id: uid2, owner: 'Client', year_make_model: '2019 Honda CR-V', value: 22000, sort_order: 0 },
    ]);

    // Current estate plan
    await insertRows('folio_current_estate_plan', [{
      intake_id: i2.intakeId, user_id: uid2, person_type: 'client',
      has_will: true, has_financial_poa: true, has_health_care_poa: true,
      will_date_signed: '2015-06-10', will_state_signed: 'Ohio',
    }]);

    results.push('James Wilson (Moderate)');

    // ================================================================
    // PERSONA 3: David Chen — Heavy assets
    // ================================================================

    const uid3 = await ensureUser(`chen.family${TEST_DOMAIN}`, 'David Chen');
    const i3 = await createIntake(uid3, {
      name: 'David Chen',
      sex: 'Male',
      maritalStatus: 'Married',
      numberOfChildren: 2,
      mailingAddress: '15200 Sunset Blvd, Unit 4A',
      mailingCity: 'Pacific Palisades',
      mailingState: 'CA',
      mailingZip: '90272',
      stateOfDomicile: 'California',
      cellPhone: '(310) 555-0277',
      email: `chen.family${TEST_DOMAIN}`,
      birthDate: '1965-09-08',
      spouseName: 'Linda Chen',
      spouseSex: 'Female',
      spouseBirthDate: '1968-01-14',
      spouseEmail: 'linda.chen@example.com',
      spouseCellPhone: '(310) 555-0278',
      dateMarried: '1993-05-22',
      additionalComments: 'Seed data — heavy assets persona.',
    }, 'David Chen', 'Linda Chen');

    // Children
    await insertRows('folio_children', [
      { intake_id: i3.intakeId, user_id: uid3, name: 'Kevin Chen', birth_date: '1996-03-12', relationship: 'Son of Both', marital_status: 'Single', sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, name: 'Amy Chen', birth_date: '1999-10-25', relationship: 'Daughter of Both', marital_status: 'Single', sort_order: 1 },
    ]);

    // Real estate (3 properties)
    await insertRows('folio_real_estate', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client and Spouse', category: 'Primary residence', street: '15200 Sunset Blvd, Unit 4A', city: 'Pacific Palisades', state: 'CA', zip: '90272', value: 3200000, mortgage_balance: 800000, sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', category: 'Investment property', street: '422 Commerce Dr', city: 'San Jose', state: 'CA', zip: '95112', value: 1500000, mortgage_balance: 600000, sort_order: 1 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client and Spouse', category: 'Vacation home', street: '88 Ski Run Blvd', city: 'South Lake Tahoe', state: 'CA', zip: '96150', value: 950000, mortgage_balance: 250000, sort_order: 2 },
    ]);

    // Bank accounts
    await insertRows('folio_bank_accounts', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client and Spouse', account_type: 'Checking', institution: 'Chase', amount: 125000, sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', account_type: 'Savings', institution: 'Goldman Sachs Marcus', amount: 500000, sort_order: 1 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client and Spouse', account_type: 'Money Market', institution: 'Schwab', amount: 250000, sort_order: 2 },
    ]);

    // Investments (non-qualified)
    await insertRows('folio_investments', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', institution: 'Morgan Stanley', description: 'Managed equity portfolio', value: 1200000, sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client and Spouse', institution: 'Vanguard', description: 'Index fund portfolio', value: 850000, sort_order: 1 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Spouse', institution: 'Fidelity', description: 'Bond ladder', value: 400000, sort_order: 2 },
    ]);

    // Retirement accounts
    await insertRows('folio_retirement_accounts', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', account_type: 'Solo 401(k)', institution: 'Fidelity', value: 1800000, sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Spouse', account_type: 'IRA', institution: 'Schwab', value: 620000, sort_order: 1 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', account_type: 'Roth IRA', institution: 'Vanguard', value: 350000, sort_order: 2 },
    ]);

    // Business interests
    await insertRows('folio_business_interests', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', business_name: 'Chen Technology Solutions LLC', entity_type: 'LLC', ownership_percentage: '100%', full_value: 4500000, has_buy_sell_agreement: false, sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', business_name: 'Pacific Ventures LP', entity_type: 'Partnership', ownership_percentage: '35%', full_value: 2000000, has_buy_sell_agreement: true, notes: 'LP agreement restricts transfers', sort_order: 1 },
    ]);

    // Digital assets
    await insertRows('folio_digital_assets', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', asset_type: 'Cryptocurrency', platform: 'Coinbase', description: 'Bitcoin and Ethereum', value: 320000, sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', asset_type: 'Domain Names', platform: 'GoDaddy', description: 'Portfolio of 15 tech domains', value: 45000, sort_order: 1 },
    ]);

    // Life insurance
    await insertRows('folio_life_insurance', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', company: 'Pacific Life', policy_type: 'Universal Life', face_amount: 2000000, cash_value: 450000, insured: 'David Chen', sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', company: 'Prudential', policy_type: 'Term 30', face_amount: 3000000, insured: 'David Chen', sort_order: 1 },
    ]);

    // Vehicles
    await insertRows('folio_vehicles', [
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', year_make_model: '2024 Tesla Model S Plaid', value: 95000, sort_order: 0 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Spouse', year_make_model: '2023 BMW X5', value: 68000, sort_order: 1 },
      { intake_id: i3.intakeId, user_id: uid3, owner: 'Client', year_make_model: '1967 Porsche 911S (classic)', value: 250000, notes: 'Garaged, collector vehicle', sort_order: 2 },
    ]);

    // Current estate plan
    await insertRows('folio_current_estate_plan', [{
      intake_id: i3.intakeId, user_id: uid3, person_type: 'client',
      has_will: true, has_trust: true, is_joint_trust: true,
      has_irrevocable_trust: true, has_financial_poa: true, has_health_care_poa: true,
      trust_name: 'Chen Family Trust',
      trust_date_signed: '2020-01-15', trust_state_signed: 'California',
      irrevocable_trust_name: 'Chen Dynasty Trust',
      irrevocable_trust_date_signed: '2022-06-01',
      irrevocable_trust_reason: 'Asset protection and generation-skipping',
    }]);

    results.push('David Chen (Heavy Assets)');

    // ================================================================
    // PERSONA 4: Rosa Martinez — Legacy-focused
    // ================================================================

    const uid4 = await ensureUser(`rosa.martinez${TEST_DOMAIN}`, 'Rosa Martinez');
    const i4 = await createIntake(uid4, {
      name: 'Rosa Martinez',
      sex: 'Female',
      maritalStatus: 'Married',
      numberOfChildren: 4,
      mailingAddress: '2210 Bluebonnet Lane',
      mailingCity: 'San Antonio',
      mailingState: 'TX',
      mailingZip: '78209',
      stateOfDomicile: 'Texas',
      cellPhone: '(210) 555-0333',
      email: `rosa.martinez${TEST_DOMAIN}`,
      birthDate: '1955-12-24',
      spouseName: 'Carlos Martinez',
      spouseSex: 'Male',
      spouseBirthDate: '1953-08-17',
      spouseEmail: 'carlos.martinez@example.com',
      dateMarried: '1976-06-19',
      additionalComments: 'Seed data — legacy-focused persona.',
    }, 'Rosa Martinez', 'Carlos Martinez');

    // Children
    await insertRows('folio_children', [
      { intake_id: i4.intakeId, user_id: uid4, name: 'Maria Gonzalez', birth_date: '1978-03-15', relationship: 'Daughter of Both', marital_status: 'Married', has_children: true, number_of_children: 3, sort_order: 0 },
      { intake_id: i4.intakeId, user_id: uid4, name: 'Carlos Martinez Jr.', birth_date: '1980-11-02', relationship: 'Son of Both', marital_status: 'Married', has_children: true, number_of_children: 2, sort_order: 1 },
      { intake_id: i4.intakeId, user_id: uid4, name: 'Sofia Martinez', birth_date: '1984-07-20', relationship: 'Daughter of Both', marital_status: 'Divorced', has_children: true, number_of_children: 1, sort_order: 2 },
      { intake_id: i4.intakeId, user_id: uid4, name: 'Diego Martinez', birth_date: '1988-01-10', relationship: 'Son of Both', marital_status: 'Single', has_children: false, sort_order: 3 },
    ]);

    // Minimal assets
    await insertRows('folio_real_estate', [
      { intake_id: i4.intakeId, user_id: uid4, owner: 'Client and Spouse', category: 'Primary residence', street: '2210 Bluebonnet Lane', city: 'San Antonio', state: 'TX', zip: '78209', value: 380000, mortgage_balance: 0, sort_order: 0 },
    ]);

    await insertRows('folio_bank_accounts', [
      { intake_id: i4.intakeId, user_id: uid4, owner: 'Client and Spouse', account_type: 'Checking', institution: 'USAA', amount: 18000, sort_order: 0 },
      { intake_id: i4.intakeId, user_id: uid4, owner: 'Client and Spouse', account_type: 'Savings', institution: 'USAA', amount: 95000, sort_order: 1 },
    ]);

    // Legacy — obituary
    await insertRows('legacy_obituary', [{
      intake_id: i4.intakeId, user_id: uid4,
      preferred_name: 'Rosa', nicknames: 'Rosita, Abuelita',
      date_of_birth: 'December 24, 1955', place_of_birth: 'Laredo, Texas',
      hometowns: 'Laredo TX, San Antonio TX',
      religious_affiliation: 'Catholic',
      education: 'Our Lady of the Lake University, BA Education',
      career_highlights: 'Elementary school teacher for 35 years at Sacred Heart Academy',
      community_involvement: 'Parish council, St. Vincent de Paul Society, San Antonio Food Bank',
      awards_honors: 'Texas Teacher of the Year finalist 2001',
      spouses: 'Carlos Martinez (married 1976)',
      children: 'Maria, Carlos Jr., Sofia, Diego',
      grandchildren: 'Isabella, Mateo, Elena, Lucas, Sofia Jr., Gabriel',
      siblings: 'Three sisters, two brothers — all living',
      parents: 'Pedro and Carmen Reyes',
      preceded_in_death: 'Parents Pedro and Carmen Reyes',
      tone: 'Joyful, family-centered, faith-filled',
      quotes_to_include: '"La familia lo es todo" — Family is everything',
      what_to_remember: 'Her tamales at Christmas and the way she made every child feel special',
      personal_message: 'Teach your children to be kind. That is enough.',
      preferred_funeral_home: 'Porter Loring Mortuary',
      burial_or_cremation: 'Burial',
      service_preferences: 'Full Catholic mass at San Fernando Cathedral',
      charitable_donations: 'San Antonio Food Bank, Sacred Heart Academy Scholarship Fund',
    }]);

    // Legacy — obituary spouse
    await insertRows('legacy_obituary_spouse', [{
      intake_id: i4.intakeId, user_id: uid4,
      preferred_name: 'Carlos', nicknames: 'Charlie',
      date_of_birth: 'August 17, 1953', place_of_birth: 'San Antonio, Texas',
      military_service: 'US Army, Vietnam era veteran',
      career_highlights: 'Retired master electrician, IBEW Local 60',
      spouses: 'Rosa Martinez (married 1976)',
      tone: 'Humble, hardworking',
    }]);

    // Legacy — personal history
    await insertRows('legacy_personal_history', [{
      intake_id: i4.intakeId, user_id: uid4,
      birthplace: 'Laredo, Texas',
      childhood_memories: 'Growing up in a house full of music, helping Mama make tortillas every Saturday',
      parents_background: 'Papa worked on the railroad, Mama ran a small seamstress business',
      schools_attended: 'Sacred Heart Elementary, Laredo High School, Our Lady of the Lake University',
      education_memories: 'First in the family to attend college — Papa cried at graduation',
      first_job: 'Helping Mama with alterations at age 10',
      career_milestones: 'Taught over 1,000 students, many came back to thank me years later',
      proudest_professional: 'When former student became a doctor and credited my encouragement',
      how_we_met: 'Carlos was fixing the wiring at our church and asked me to dance at the fiesta',
      wedding_story: 'Married at San Fernando Cathedral — the whole barrio celebrated',
      raising_children: 'Four children, lots of homework help at the kitchen table',
      important_decisions: 'Staying in San Antonio instead of moving to Houston for higher pay',
      biggest_challenges: 'Balancing teaching with caring for my aging parents',
      risks_taken: 'Starting a summer tutoring program with my own money',
    }]);

    // Legacy — reflections
    await insertRows('legacy_reflections', [{
      intake_id: i4.intakeId, user_id: uid4,
      what_matters_most: 'Faith, family, and educating children',
      advice_to_younger: 'Be patient with yourself and generous with others',
      core_beliefs: 'God is good, family is sacred, education changes lives',
      greatest_regrets: 'Not learning to play guitar like Papa',
      greatest_joys: 'Every quinceañera, every graduation, every new grandchild',
      how_remembered: 'As Abuelita who always had food and love to share',
      personal_values: 'Faith, Family, Education, Generosity, Community',
    }]);

    // Legacy — surprises
    await insertRows('legacy_surprises', [{
      intake_id: i4.intakeId, user_id: uid4,
      hidden_talents: 'Makes prize-winning salsa verde, can fix a leaky faucet',
      unusual_experiences: 'Met Pope John Paul II on a pilgrimage to Rome in 1995',
      fun_facts: 'Has never missed a Sunday mass in 50 years',
      adventures: 'Roadtrip to all 50 states with Carlos over 10 summers',
      untold_stories: 'Snuck out of the house at 16 to see Selena perform',
    }]);

    // Legacy — favorites
    await insertRows('legacy_favorites', [{
      intake_id: i4.intakeId, user_id: uid4,
      favorite_music: 'Selena, Vicente Fernandez, Fleetwood Mac',
      favorite_books: 'The House on Mango Street, Don Quixote, The Bible',
      favorite_movies: "Coco, West Side Story, It's a Wonderful Life",
      favorite_foods: 'Tamales, mole poblano, tres leches cake',
      favorite_restaurants: 'Mi Tierra Cafe, La Gloria',
      favorite_vacation_destinations: 'Mexico City, Big Bend, South Padre Island',
      favorite_quotes_sayings: '"La familia lo es todo" and "Dios sabe lo que hace"',
    }]);

    // Legacy — charity organizations
    await insertRows('legacy_charity_organizations', [
      { intake_id: i4.intakeId, user_id: uid4, organization_name: 'San Antonio Food Bank', website: 'https://safoodbank.org', sort_order: 0 },
      { intake_id: i4.intakeId, user_id: uid4, organization_name: 'Sacred Heart Academy Scholarship Fund', sort_order: 1 },
      { intake_id: i4.intakeId, user_id: uid4, organization_name: 'St. Vincent de Paul Society — San Antonio', sort_order: 2 },
    ]);

    // Legacy — charity preferences
    await insertRows('legacy_charity_preferences', [{
      intake_id: i4.intakeId, user_id: uid4,
      donations_in_lieu_of_flowers: true,
      scholarship_fund: 'Sacred Heart Academy Scholarship Fund',
      religious_donations: 'San Fernando Cathedral',
      legacy_giving_notes: 'Want to endow a scholarship for first-generation college students',
      why_these_causes: 'Education changed my life — I want that for other children',
    }]);

    // Legacy — letters (extensive)
    await insertRows('legacy_letters', [
      { intake_id: i4.intakeId, user_id: uid4, recipient_type: 'Spouse', recipient_name: 'Carlos', letter_body: 'Mi amor, you have been my rock for fifty years. From that first dance at the fiesta...', format: 'text', sort_order: 0 },
      { intake_id: i4.intakeId, user_id: uid4, recipient_type: 'Child', recipient_name: 'Maria', letter_body: 'Mija, you are the strongest woman I know. You get that from your abuela...', format: 'text', sort_order: 1 },
      { intake_id: i4.intakeId, user_id: uid4, recipient_type: 'Child', recipient_name: 'Carlos Jr.', letter_body: "Carlitos, you carry your father's name with honor...", format: 'text', sort_order: 2 },
      { intake_id: i4.intakeId, user_id: uid4, recipient_type: 'Child', recipient_name: 'Sofia', letter_body: 'Sofia, you are braver than you know. Divorce does not define you...', format: 'text', sort_order: 3 },
      { intake_id: i4.intakeId, user_id: uid4, recipient_type: 'Child', recipient_name: 'Diego', letter_body: 'Diego, my baby boy, you march to your own drum and I love that about you...', format: 'text', sort_order: 4 },
      { intake_id: i4.intakeId, user_id: uid4, recipient_type: 'Grandchild', recipient_name: 'All my grandchildren', letter_body: 'To my beautiful grandchildren: Always remember where you come from...', format: 'text', sort_order: 5 },
    ]);

    // Legacy — stories
    await insertRows('legacy_stories', [
      { intake_id: i4.intakeId, user_id: uid4, story_title: 'Meeting the Pope', story_body: 'In 1995, our parish organized a pilgrimage to Rome. I never imagined I would shake the hand of Pope John Paul II...', people_involved: 'Carlos, Father Miguel, parish group', approximate_date: '1995', location: 'Vatican City, Rome', lessons_learned: 'Miracles happen to ordinary people', sort_order: 0 },
      { intake_id: i4.intakeId, user_id: uid4, story_title: 'The Summer Tutoring Program', story_body: 'I started with 5 students in my garage. By the third summer, we had 40 kids and three volunteers...', people_involved: 'Neighborhood children, volunteer parents', approximate_date: '1990', location: 'San Antonio, TX', lessons_learned: 'Small acts can grow into something big', sort_order: 1 },
      { intake_id: i4.intakeId, user_id: uid4, story_title: "Papa's Last Lesson", story_body: 'Before Papa passed, he told me: "Rosita, the train doesn\'t stop for anyone. Make every station count."', people_involved: 'Papa Pedro Reyes', approximate_date: '2002', location: 'Laredo, TX', lessons_learned: 'Make every moment count', sort_order: 2 },
    ]);

    // Legacy — memories
    await insertRows('legacy_memories', [
      { intake_id: i4.intakeId, user_id: uid4, memory_title: "Isabella's Quinceañera", description: 'The most beautiful celebration — three generations dancing together', approximate_year: '2018', location: 'San Fernando Cathedral', sort_order: 0 },
      { intake_id: i4.intakeId, user_id: uid4, memory_title: 'The 50 States Road Trip', description: 'Carlos and I drove to all 50 states over 10 summers. Alaska was the hardest!', approximate_year: '2000-2010', location: 'All over the USA', sort_order: 1 },
      { intake_id: i4.intakeId, user_id: uid4, memory_title: 'Christmas Tamale Marathon', description: 'Every Christmas Eve, the whole family gathers to make 300 tamales', approximate_year: 'Every year', location: 'Our kitchen', sort_order: 2 },
    ]);

    // Legacy — videos
    await insertRows('legacy_videos', [
      { intake_id: i4.intakeId, user_id: uid4, video_title: "Rosa's Tamale Recipe", recording_date: '2024-12-24', description: 'Step-by-step tamale tutorial filmed by Diego', sort_order: 0 },
      { intake_id: i4.intakeId, user_id: uid4, video_title: 'Message to Grandchildren', recording_date: '2025-01-15', description: 'A personal message to all six grandchildren', is_private: true, sort_order: 1 },
    ]);

    results.push('Rosa Martinez (Legacy)');

    // ================================================================
    // PERSONA 5: Emily Blank — Minimal/empty data
    // ================================================================

    const uid5 = await ensureUser(`empty.intake${TEST_DOMAIN}`, 'Emily Blank');
    await createIntake(uid5, {
      name: 'Emily Blank',
      sex: 'Female',
      maritalStatus: 'Single',
      stateOfDomicile: 'New York',
      email: `empty.intake${TEST_DOMAIN}`,
      additionalComments: 'Seed data — near-empty intake for testing empty states.',
    }, 'Emily Blank', '');

    results.push('Emily Blank (Minimal)');

    // ================================================================

    return new Response(JSON.stringify({
      success: true,
      message: `Seeded ${results.length} personas`,
      personas: results,
    }), {
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
