/**
 * Vault Crypto Utilities
 *
 * Client-side encryption for the Digital Credentials Vault.
 * Uses Web Crypto API (AES-GCM 256-bit) with PBKDF2 key derivation.
 * No third-party crypto libraries — native browser APIs only.
 */

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 32;
const IV_LENGTH = 12; // AES-GCM standard IV length

// Base58 alphabet (Bitcoin-style, no 0/O/I/l ambiguity)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uint8ToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToUint8(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeBase58(bytes: Uint8Array): string {
  // Convert bytes to a big integer
  let num = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    num = num * BigInt(256) + BigInt(bytes[i]);
  }
  // Convert to base58
  let result = '';
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    result = BASE58_ALPHABET[remainder] + result;
  }
  // Preserve leading zeros
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) {
      result = BASE58_ALPHABET[0] + result;
    } else {
      break;
    }
  }
  return result || BASE58_ALPHABET[0];
}

function decodeBase58(str: string): Uint8Array {
  let num = BigInt(0);
  for (const char of str) {
    const idx = BASE58_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error('Invalid base58 character');
    num = num * BigInt(58) + BigInt(idx);
  }
  // Convert bigint to bytes
  const hex = num.toString(16).padStart(2, '0');
  const paddedHex = hex.length % 2 ? '0' + hex : hex;
  const bytes = hexToUint8(paddedHex);
  // Count leading zeros
  let leadingZeros = 0;
  for (const char of str) {
    if (char === BASE58_ALPHABET[0]) leadingZeros++;
    else break;
  }
  const result = new Uint8Array(leadingZeros + bytes.length);
  result.set(bytes, leadingZeros);
  return result;
}

// ─── Key Derivation ──────────────────────────────────────────────────────────

/**
 * Derive an AES-GCM 256-bit key from a passphrase and salt using PBKDF2.
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable — needed for recovery key wrapping
    ['encrypt', 'decrypt']
  );
}

// ─── Encrypt / Decrypt Fields ────────────────────────────────────────────────

/**
 * Encrypt a plaintext string.
 * Returns a base64-encoded JSON string: { iv: string, ciphertext: string }
 */
export async function encryptField(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    encoder.encode(plaintext)
  );

  const payload = JSON.stringify({
    iv: uint8ToBase64(iv),
    ciphertext: uint8ToBase64(new Uint8Array(cipherBuffer)),
  });

  return btoa(payload);
}

/**
 * Decrypt an encrypted field.
 * Expects the base64-encoded JSON format produced by encryptField.
 */
export async function decryptField(encryptedJson: string, key: CryptoKey): Promise<string> {
  const payload = JSON.parse(atob(encryptedJson));
  const iv = base64ToUint8(payload.iv);
  const ciphertext = base64ToUint8(payload.ciphertext);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(plainBuffer);
}

// ─── Salt & Recovery Key Generation ──────────────────────────────────────────

/**
 * Generate a random 32-byte salt.
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a recovery key: 32 random bytes, base58-encoded.
 */
export function generateRecoveryKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return encodeBase58(bytes);
}

/**
 * Convert a salt to hex string for storage in Supabase.
 */
export function saltToHex(salt: Uint8Array): string {
  return uint8ToHex(salt);
}

/**
 * Convert a hex string back to Uint8Array salt.
 */
export function hexToSalt(hex: string): Uint8Array {
  return hexToUint8(hex);
}

// ─── Recovery Key Wrapping ──────────────────────────────────────────────────

/**
 * Encrypt the derived master key with the recovery key.
 * The recovery key is used to derive a separate AES key, which wraps the master key.
 * Returns base64-encoded ciphertext for storage in Supabase.
 */
export async function encryptKeyWithRecoveryKey(
  masterKey: CryptoKey,
  recoveryKey: string
): Promise<string> {
  // Export the master key as raw bytes
  const rawKey = await crypto.subtle.exportKey('raw', masterKey);

  // Derive an AES key from the recovery key
  const recoverySalt = new TextEncoder().encode('mylifefolio-recovery-v1');
  const recoveryDerived = await deriveKey(recoveryKey, recoverySalt);

  // Encrypt the raw master key bytes with the recovery-derived key
  return encryptField(
    uint8ToBase64(new Uint8Array(rawKey)),
    recoveryDerived
  );
}

/**
 * Recover the master key from the recovery key and stored ciphertext.
 */
export async function recoverKeyFromRecoveryKey(
  recoveryKey: string,
  ciphertext: string
): Promise<CryptoKey> {
  // Derive the same AES key from the recovery key
  const recoverySalt = new TextEncoder().encode('mylifefolio-recovery-v1');
  const recoveryDerived = await deriveKey(recoveryKey, recoverySalt);

  // Decrypt to get the raw master key bytes
  const rawKeyBase64 = await decryptField(ciphertext, recoveryDerived);
  const rawKeyBytes = base64ToUint8(rawKeyBase64);

  // Import the raw key bytes back as a CryptoKey
  return crypto.subtle.importKey(
    'raw',
    rawKeyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

// ─── Passphrase Strength Meter ──────────────────────────────────────────────

export type PassphraseStrength = 'weak' | 'fair' | 'good' | 'strong';

export function evaluatePassphraseStrength(passphrase: string): {
  strength: PassphraseStrength;
  score: number; // 0–100
  feedback: string;
} {
  let score = 0;

  if (passphrase.length >= 12) score += 20;
  if (passphrase.length >= 16) score += 10;
  if (passphrase.length >= 20) score += 10;
  if (/[a-z]/.test(passphrase)) score += 10;
  if (/[A-Z]/.test(passphrase)) score += 10;
  if (/[0-9]/.test(passphrase)) score += 10;
  if (/[^a-zA-Z0-9]/.test(passphrase)) score += 15;
  // Bonus for variety
  const uniqueChars = new Set(passphrase).size;
  if (uniqueChars >= 10) score += 10;
  if (uniqueChars >= 15) score += 5;

  score = Math.min(100, score);

  let strength: PassphraseStrength;
  let feedback: string;

  if (score < 30) {
    strength = 'weak';
    feedback = 'Too weak. Use at least 12 characters with mixed case, numbers, and symbols.';
  } else if (score < 55) {
    strength = 'fair';
    feedback = 'Fair. Consider adding more length or variety.';
  } else if (score < 80) {
    strength = 'good';
    feedback = 'Good passphrase strength.';
  } else {
    strength = 'strong';
    feedback = 'Strong passphrase.';
  }

  return { strength, score, feedback };
}
