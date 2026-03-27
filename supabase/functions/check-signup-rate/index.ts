// Supabase Edge Function to rate-limit signup attempts by IP address
// Allows max 3 attempts per IP within a rolling 24-hour window

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

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    const { email, ip_address } = await req.json();

    if (!ip_address || typeof ip_address !== 'string') {
      return new Response(JSON.stringify({ error: 'ip_address is required' }), {
        status: 400,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Service role client to query/insert signup_attempts (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Count attempts from this IP in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await supabaseAdmin
      .from('signup_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip_address)
      .gte('attempted_at', twentyFourHoursAgo);

    if (countError) {
      console.error('Failed to count signup attempts:', countError);
      throw new Error(`Failed to check rate limit: ${countError.message}`);
    }

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({
          allowed: false,
          reason: 'Too many signup attempts from this device. Please try again tomorrow.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
        }
      );
    }

    // Under the limit — record this attempt
    const { error: insertError } = await supabaseAdmin
      .from('signup_attempts')
      .insert({ ip_address, email: email || null });

    if (insertError) {
      console.error('Failed to insert signup attempt:', insertError);
      throw new Error(`Failed to record attempt: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      {
        status: 200,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('check-signup-rate error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
});
