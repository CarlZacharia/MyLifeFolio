// Supabase Edge Function to generate a professional obituary via Claude API
// Keeps the API key secure on the server side

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno global available in Edge Functions runtime
declare const Deno: { env: { get(key: string): string | undefined } };

// Allowed origins for CORS — production only
const ALLOWED_ORIGINS = new Set([
  'https://mylifefolio.com',
  'https://www.mylifefolio.com',

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

const MAX_GENERATIONS = 5;

interface ObituaryFields {
  preferredName: string;
  nicknames: string;
  dateOfBirth: string;
  placeOfBirth: string;
  dateOfDeath: string;
  placeOfDeath: string;
  hometowns: string;
  religiousAffiliation: string;
  militaryService: string;
  education: string;
  careerHighlights: string;
  communityInvolvement: string;
  awardsHonors: string;
  spouses: string;
  children: string;
  grandchildren: string;
  siblings: string;
  parents: string;
  othersToMention: string;
  precededInDeath: string;
  tone: string;
  quotesToInclude: string;
  whatToRemember: string;
  personalMessage: string;
  preferredFuneralHome: string;
  burialOrCremation: string;
  servicePreferences: string;
  charitableDonations: string;
}

function buildPrompt(fields: ObituaryFields): string {
  const toneGuide: Record<string, string> = {
    'Formal': 'Use a traditional, dignified tone appropriate for a newspaper obituary.',
    'Warm & Personal': 'Use a warm, personal tone that feels like a loving tribute written by someone who knew them well.',
    'Lighthearted': 'Use a lighthearted, even gently humorous tone that celebrates the joy this person brought to others.',
    'Religious/Faith-Based': 'Incorporate faith-based language and themes of spiritual comfort, eternal rest, and God\'s grace.',
    'Brief': 'Keep the obituary concise and factual — a short, respectful announcement.',
  };

  const tone = toneGuide[fields.tone] || toneGuide['Warm & Personal'];

  // Build a structured data summary, only including non-empty fields
  const sections: string[] = [];

  sections.push('=== THE BASICS ===');
  if (fields.preferredName) sections.push(`Full Name: ${fields.preferredName}`);
  if (fields.nicknames) sections.push(`Nicknames: ${fields.nicknames}`);
  if (fields.dateOfBirth) sections.push(`Date of Birth: ${fields.dateOfBirth}`);
  if (fields.placeOfBirth) sections.push(`Place of Birth: ${fields.placeOfBirth}`);
  if (fields.dateOfDeath) sections.push(`Date of Death: ${fields.dateOfDeath}`);
  if (fields.placeOfDeath) sections.push(`Place of Death: ${fields.placeOfDeath}`);

  sections.push('\n=== LIFE STORY ===');
  if (fields.hometowns) sections.push(`Hometowns: ${fields.hometowns}`);
  if (fields.religiousAffiliation) sections.push(`Religious/Spiritual Affiliation: ${fields.religiousAffiliation}`);
  if (fields.militaryService) sections.push(`Military Service: ${fields.militaryService}`);
  if (fields.education) sections.push(`Education: ${fields.education}`);
  if (fields.careerHighlights) sections.push(`Career Highlights: ${fields.careerHighlights}`);
  if (fields.communityInvolvement) sections.push(`Community Involvement: ${fields.communityInvolvement}`);
  if (fields.awardsHonors) sections.push(`Awards & Honors: ${fields.awardsHonors}`);

  sections.push('\n=== FAMILY ===');
  if (fields.spouses) sections.push(`Spouse(s): ${fields.spouses}`);
  if (fields.children) sections.push(`Children: ${fields.children}`);
  if (fields.grandchildren) sections.push(`Grandchildren & Great-Grandchildren: ${fields.grandchildren}`);
  if (fields.siblings) sections.push(`Siblings: ${fields.siblings}`);
  if (fields.parents) sections.push(`Parents: ${fields.parents}`);
  if (fields.othersToMention) sections.push(`Others to Mention: ${fields.othersToMention}`);
  if (fields.precededInDeath) sections.push(`Preceded in Death By: ${fields.precededInDeath}`);

  sections.push('\n=== THE PERSON\'S VOICE ===');
  if (fields.quotesToInclude) sections.push(`Favorite Quotes: ${fields.quotesToInclude}`);
  if (fields.whatToRemember) sections.push(`What they want people to remember: ${fields.whatToRemember}`);
  if (fields.personalMessage) sections.push(`Personal message to leave behind: ${fields.personalMessage}`);

  sections.push('\n=== FINAL ARRANGEMENTS ===');
  if (fields.preferredFuneralHome) sections.push(`Funeral Home: ${fields.preferredFuneralHome}`);
  if (fields.burialOrCremation) sections.push(`Burial/Cremation: ${fields.burialOrCremation}`);
  if (fields.servicePreferences) sections.push(`Service Preferences: ${fields.servicePreferences}`);
  if (fields.charitableDonations) sections.push(`Charitable Donations / In Lieu of Flowers: ${fields.charitableDonations}`);

  return `You are a professional obituary writer. Using the information provided below, compose a complete, publication-ready obituary.

TONE INSTRUCTIONS: ${tone}

WRITING GUIDELINES:
- Write in third person
- Open with a statement about the person's passing (or birth/life if date of death is not provided)
- Weave the facts into a natural, flowing narrative — do NOT use bullet points or section headers
- Include all family members mentioned, using proper obituary conventions (e.g., "survived by", "preceded in death by")
- If military service is mentioned, honor it appropriately
- If charitable donations are specified, include the "In lieu of flowers" line at the end
- If a personal message or favorite quote is provided, incorporate it naturally
- Include service/arrangement details at the end if provided
- The obituary should feel complete and ready to publish
- Do NOT fabricate any facts — only use information that is provided
- If a detail is not provided, omit it entirely. Never infer, assume, or invent.
- If the date of death is blank, write as if the person is still living and note "[Date of death to be added]"

---

PERSON'S INFORMATION:
${sections.join('\n')}`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    // --- Authenticate the requesting user ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);
    if (authError || !user) {
      console.error('Auth validation failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // --- Verify the caller has an active subscription ---
    // (As of the trial+paid collapse, AI obituary is included for everyone
    // with an active subscription — no separate Enhanced tier exists.)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single();

    // AI obituary is available to all active subscribers (trial + paid).
    // Reject only when there's no active row at all.
    if (!subscription || subscription.status !== 'active') {
      return new Response(
        JSON.stringify({ success: false, error: 'An active MyLifeFolio subscription is required to generate AI obituaries.' }),
        { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { obituaryData, intake_id, person_type = 'client' } = await req.json() as {
      obituaryData: ObituaryFields;
      intake_id?: string;
      person_type?: 'client' | 'spouse';
    };

    if (!obituaryData || !obituaryData.preferredName) {
      throw new Error('Obituary data with at least a name is required');
    }

    // ── Ownership verification ────────────────────────────────────────
    // Use service role client to bypass RLS for rate-limit bookkeeping
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller owns this intake before processing
    if (intake_id) {
      const { data: intake, error: intakeError } = await adminClient
        .from('folio_intakes')
        .select('user_id')
        .eq('id', intake_id)
        .maybeSingle();

      if (intakeError || !intake) {
        return new Response(
          JSON.stringify({ success: false, error: 'Intake not found.' }),
          { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      if (intake.user_id !== user.id) {
        return new Response(
          JSON.stringify({ success: false, error: 'You do not have access to this intake.' }),
          { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }

    // ── Rate limit check ──────────────────────────────────────────────
    const tableName = person_type === 'spouse' ? 'legacy_obituary_spouse' : 'legacy_obituary';
    let currentCount = 0;

    if (intake_id) {
      const { data: row, error: lookupError } = await adminClient
        .from(tableName)
        .select('generation_count')
        .eq('intake_id', intake_id)
        .maybeSingle();

      if (lookupError) {
        console.error('Rate limit lookup error:', lookupError);
        // Don't block generation on a lookup failure — proceed with caution
      } else if (row) {
        currentCount = row.generation_count ?? 0;
      }

      if (currentCount >= MAX_GENERATIONS) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Generation limit reached. You have used all 5 AI-generated obituary drafts.',
            limitReached: true,
          }),
          {
            headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
            status: 429,
          }
        );
      }
    }

    // ── Call Claude API ───────────────────────────────────────────────
    const prompt = buildPrompt(obituaryData);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();

    // ── Increment generation count after successful generation ────────
    if (intake_id) {
      const { error: updateError } = await adminClient
        .from(tableName)
        .update({
          generation_count: currentCount + 1,
          last_generated_at: new Date().toISOString(),
        })
        .eq('intake_id', intake_id);

      if (updateError) {
        console.error('Failed to increment generation_count:', updateError);
        // Don't fail the response — the obituary was already generated
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        obituary: claudeResponse.content[0].text,
        usage: claudeResponse.usage,
      }),
      {
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-obituary function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
