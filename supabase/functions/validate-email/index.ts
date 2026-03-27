// Supabase Edge Function to validate email addresses against disposable domain blocklist

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

// In-memory cache: persists for the lifetime of this function instance
let cachedBlocklist: Set<string> | null = null;

const BLOCKLIST_URL =
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf';

async function getBlocklist(): Promise<Set<string>> {
  if (cachedBlocklist) return cachedBlocklist;

  const res = await fetch(BLOCKLIST_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch blocklist: ${res.status}`);
  }

  const text = await res.text();
  cachedBlocklist = new Set(
    text
      .split('\n')
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.length > 0)
  );

  return cachedBlocklist;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const domain = email.split('@')[1].toLowerCase();
    const blocklist = await getBlocklist();

    if (blocklist.has(domain)) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'Please use a permanent email address to create your account.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ valid: true }),
      {
        status: 200,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('validate-email error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
});
