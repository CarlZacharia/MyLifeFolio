/**
 * Encryption Utilities
 *
 * Client-side helpers for encrypting/decrypting sensitive data
 * via Supabase Edge Function. The actual encryption happens server-side
 * to keep the encryption key secure.
 */

import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Call the encrypt-sensitive-data edge function directly via fetch.
 * Bypasses supabase.functions.invoke() to ensure correct auth headers.
 */
async function callEncryptFunction(
  action: 'encrypt' | 'decrypt',
  data: Record<string, any>
): Promise<Record<string, any>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session — cannot call encryption service');
  }

  const url = `${SUPABASE_URL}/functions/v1/encrypt-sensitive-data`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action, data }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Encryption service returned ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || `${action} failed`);
  }

  return result.data;
}

/**
 * Encrypt sensitive fields in form data using server-side Edge Function
 */
export async function encryptSensitiveData(
  data: Record<string, any>
): Promise<Record<string, any>> {
  return callEncryptFunction('encrypt', data);
}

/**
 * Decrypt sensitive fields in form data using server-side Edge Function
 */
export async function decryptSensitiveData(
  data: Record<string, any>
): Promise<Record<string, any>> {
  return callEncryptFunction('decrypt', data);
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

/**
 * Check if data contains any sensitive field with a non-empty value.
 * When no sensitive data is present, encryption/decryption can be skipped.
 */
export function hasSensitiveData(data: Record<string, any>): boolean {
  return SENSITIVE_FIELDS.some(field => field in data && data[field]);
}
