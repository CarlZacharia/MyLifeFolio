import { supabase } from './supabase';

export interface GenerateObituaryResult {
  success: boolean;
  obituary?: string;
  error?: string;
  isTimeout?: boolean;
  limitReached?: boolean;
}

const TIMEOUT_MS = 30000; // 30 seconds

/**
 * Calls the server-side Supabase Edge Function to generate an obituary.
 * Raw form data is ONLY sent to our own backend — never to a third-party client-side.
 * The edge function holds the Anthropic API key and makes the Claude call server-side.
 */
export async function generateObituary(
  obituaryData: Record<string, unknown>,
  intakeId: string | null,
  personType: 'client' | 'spouse' = 'client'
): Promise<GenerateObituaryResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'You must be logged in to generate an obituary.' };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      return { success: false, error: 'Supabase URL is not configured.' };
    }

    // Strip the generation count — don't send internal tracking to the API
    const { obituaryGenerationCount: _, ...dataToSend } = obituaryData as Record<string, unknown> & { obituaryGenerationCount?: number };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${supabaseUrl}/functions/v1/generate-obituary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          obituaryData: dataToSend,
          intake_id: intakeId,
          person_type: personType,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
        return {
          success: false,
          isTimeout: true,
          error: 'The request took too long. Claude may be under heavy load — please try again in a moment.',
        };
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 429) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        limitReached: true,
        error: errorData?.error || 'You have reached the maximum number of obituary generations.',
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.error || `Server error: ${response.status}`,
      };
    }

    const data = await response.json();
    if (!data.success || !data.obituary) {
      return { success: false, error: data.error || 'No obituary was generated.' };
    }

    return { success: true, obituary: data.obituary };
  } catch (err) {
    console.error('Error generating obituary:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}
