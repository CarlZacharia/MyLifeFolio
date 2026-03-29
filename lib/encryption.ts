/**
 * Encryption Utilities — Electron Desktop Version
 *
 * In the desktop app, sensitive data is protected by the local passphrase
 * and the SQLite database itself. The server-side encryption edge function
 * is no longer needed. Data is stored as-is in the local database.
 *
 * TODO: For additional security, implement local field-level encryption
 * using the passphrase-derived key. For now, the passphrase-protected
 * database provides the security boundary.
 */

/**
 * Encrypt sensitive fields — desktop pass-through (stored locally)
 */
export async function encryptSensitiveData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any>> {
  // In the desktop version, data is stored locally in the passphrase-protected database
  return data;
}

/**
 * Decrypt sensitive fields — desktop pass-through (stored locally)
 */
export async function decryptSensitiveData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any>> {
  return data;
}

/**
 * List of sensitive field names
 */
export const SENSITIVE_FIELDS = [
  'socialSecurityNumber',
  'spouseSocialSecurityNumber',
] as const;

/**
 * Check if a field name is sensitive
 */
export function isSensitiveField(fieldName: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return SENSITIVE_FIELDS.includes(fieldName as any);
}

/**
 * Check if data contains any sensitive field with a non-empty value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasSensitiveData(data: Record<string, any>): boolean {
  return SENSITIVE_FIELDS.some(field => field in data && data[field]);
}
