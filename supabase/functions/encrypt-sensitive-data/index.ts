/**
 * Supabase Edge Function: encrypt-sensitive-data
 *
 * Encrypts sensitive fields (SSNs, account numbers, etc.) using AES-256-GCM
 * encryption with a server-side key. This ensures the encryption key never
 * reaches the client browser.
 *
 * Usage:
 * POST /encrypt-sensitive-data
 * Body: { action: 'encrypt' | 'decrypt', data: { field: value, ... } }
 *
 * Environment Variables Required:
 * - ENCRYPTION_KEY: 32-byte base64-encoded encryption key
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// List of fields that should be encrypted
const SENSITIVE_FIELDS = [
  'socialSecurityNumber',
  'spouseSocialSecurityNumber',
  'clientSocialSecurityNumber', // Alternative naming
  'spouseSocialSecurityNumber', // Alternative naming
  // Add more sensitive fields here as needed:
  // 'bankAccountNumber',
  // 'routingNumber',
  // 'creditCardNumber',
];

/**
 * Encrypt a string using AES-256-GCM
 */
async function encryptString(plaintext: string, key: CryptoKey): Promise<string> {
  if (!plaintext) return '';

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate a random IV (initialization vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a string using AES-256-GCM
 */
async function decryptString(ciphertext: string, key: CryptoKey): Promise<string> {
  if (!ciphertext) return '';

  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Import encryption key from environment variable
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const encryptionKeyBase64 = Deno.env.get('ENCRYPTION_KEY');

  if (!encryptionKeyBase64) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }

  // Decode base64 key
  const keyData = Uint8Array.from(atob(encryptionKeyBase64), c => c.charCodeAt(0));

  // Import as CryptoKey
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive fields in an object
 */
async function encryptSensitiveFields(
  data: Record<string, any>,
  key: CryptoKey
): Promise<Record<string, any>> {
  const result = { ...data };

  for (const field of SENSITIVE_FIELDS) {
    if (field in result && result[field]) {
      result[field] = await encryptString(String(result[field]), key);
    }
  }

  return result;
}

/**
 * Decrypt sensitive fields in an object
 */
async function decryptSensitiveFields(
  data: Record<string, any>,
  key: CryptoKey
): Promise<Record<string, any>> {
  const result = { ...data };

  for (const field of SENSITIVE_FIELDS) {
    if (field in result && result[field]) {
      try {
        result[field] = await decryptString(String(result[field]), key);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Leave encrypted if decryption fails
      }
    }
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Supabase automatically validates the JWT token at the gateway level
    // when "JWT verification" is enabled for this function.
    // No need to manually check auth headers here.

    // Parse request body
    const { action, data } = await req.json();

    if (!action || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing action or data' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get encryption key
    const key = await getEncryptionKey();

    // Perform encryption or decryption
    let result;
    if (action === 'encrypt') {
      result = await encryptSensitiveFields(data, key);
    } else if (action === 'decrypt') {
      result = await decryptSensitiveFields(data, key);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "encrypt" or "decrypt"' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
