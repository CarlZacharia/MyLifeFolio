// Supabase Edge Function to generate signed download URLs for folio documents.
// Handles both folio-documents bucket (direct uploads) and vault-documents bucket
// (shared from vault). Uses service role to bypass storage RLS for vault files.
// Authorization is enforced via folio_documents RLS (visible_to array).

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno global available in Edge Functions runtime
declare const Deno: { env: { get(key: string): string | undefined } };

const ALLOWED_ORIGINS = new Set([
  'https://mylifefolio.com',
  'https://www.mylifefolio.com',
  'http://localhost:5173',
  'http://localhost:5174',
  ...(Deno.env.get('ALLOWED_ORIGIN') ? [Deno.env.get('ALLOWED_ORIGIN')!] : []),
]);

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.has(origin) ? origin : 'https://mylifefolio.com';
}

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: corsHeaders(req),
      });
    }

    // Create user-scoped client — RLS will enforce visible_to access
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: corsHeaders(req),
      });
    }

    const { documentId } = await req.json();
    if (!documentId || typeof documentId !== 'string') {
      return new Response(JSON.stringify({ error: 'documentId is required' }), {
        status: 400,
        headers: corsHeaders(req),
      });
    }

    // Query folio_documents — RLS ensures the user has access (owner or in visible_to)
    const { data: doc, error: docError } = await supabaseUser
      .from('folio_documents')
      .select('id, storage_path, storage_bucket, file_name')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: 'Document not found or access denied' }), {
        status: 404,
        headers: corsHeaders(req),
      });
    }

    // Use service role to generate signed URL (bypasses storage RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const bucket = doc.storage_bucket || 'folio-documents';
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(doc.storage_path, 300); // 5-minute expiry

    if (error) {
      console.error('createSignedUrl error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders(req),
      });
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl, fileName: doc.file_name }), {
      status: 200,
      headers: corsHeaders(req),
    });
  } catch (err) {
    console.error('folio-document-download error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders(req),
    });
  }
});
