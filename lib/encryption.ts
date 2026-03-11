/**
 * Encryption Utilities
 *
 * Client-side helpers for encrypting/decrypting sensitive data
 * via Supabase Edge Function. The actual encryption happens server-side
 * to keep the encryption key secure.
 */

import { supabase } from './supabase';

/**
 * Get the current session's access token for edge function calls
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

/**
 * Encrypt sensitive fields in form data using server-side Edge Function
 */
export async function encryptSensitiveData(
  data: Record<string, any>
): Promise<Record<string, any>> {
  try {
    const headers = await getAuthHeaders();
    const { data: result, error } = await supabase.functions.invoke(
      'encrypt-sensitive-data',
      {
        headers,
        body: {
          action: 'encrypt',
          data: data,
        },
      }
    );

    if (error) {
      throw error;
    }

    if (!result.success) {
      throw new Error(result.error || 'Encryption failed');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Decrypt sensitive fields in form data using server-side Edge Function
 */
export async function decryptSensitiveData(
  data: Record<string, any>
): Promise<Record<string, any>> {
  try {
    const headers = await getAuthHeaders();
    const { data: result, error } = await supabase.functions.invoke(
      'encrypt-sensitive-data',
      {
        headers,
        body: {
          action: 'decrypt',
          data: data,
        },
      }
    );

    if (error) {
      throw error;
    }

    if (!result.success) {
      throw new Error(result.error || 'Decryption failed');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * List of sensitive field names that should be encrypted
 */
export const SENSITIVE_FIELDS = [
  'socialSecurityNumber',
  'spouseSocialSecurityNumber',
] as const;

/**
 * Check if a field name is sensitive and should be encrypted
 */
export function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_FIELDS.includes(fieldName as any);
}
