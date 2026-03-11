import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Track the current access token so it can be injected into every request.
// This works around a supabase-js issue where the Authorization header
// defaults to the anon key instead of the authenticated user's JWT.
let _accessToken: string | null = null;

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    global: {
      fetch: async (url: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (_accessToken) {
          headers.set('Authorization', `Bearer ${_accessToken}`);
        }
        return fetch(url, { ...init, headers });
      },
    },
  }
);

// Keep the access token in sync with auth state changes.
// This fires for INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT.
supabase.auth.onAuthStateChange((_event, session) => {
  _accessToken = session?.access_token ?? null;
});
