/**
 * Masks sensitive data like SSNs, account numbers, and policy numbers.
 * Shows only last 4 digits unless the user has "full_sensitive" access.
 */

const SENSITIVE_PATTERNS: Record<string, RegExp> = {
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  accountNumber: /\b\d{6,17}\b/g,
};

function maskValue(value: string): string {
  if (!value || value.length < 4) return '****';
  return '****' + value.slice(-4);
}

/**
 * Recursively traverse an object and mask sensitive field values.
 * Fields considered sensitive: socialSecurityNumber, policyNo, accountNumber-like fields.
 */
export function maskSensitiveFields(
  data: Record<string, unknown>,
  hasFullSensitive: boolean
): Record<string, unknown> {
  if (hasFullSensitive) return data;

  const sensitiveKeys = [
    'socialSecurityNumber',
    'spouseSocialSecurityNumber',
    'policyNo',
    'microchipNumber',
    'registrationNumber',
    'safeDepositBoxNumber',
    'petInsurancePolicyNumber',
  ];

  function processValue(key: string, value: unknown): unknown {
    if (value === null || value === undefined) return value;

    if (typeof value === 'string') {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
        return maskValue(value);
      }
      // Mask SSN patterns in any string value
      return value.replace(SENSITIVE_PATTERNS.ssn, (match) => maskValue(match.replace(/-/g, '')));
    }

    if (Array.isArray(value)) {
      return value.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          return processObject(item as Record<string, unknown>);
        }
        return processValue(String(i), item);
      });
    }

    if (typeof value === 'object') {
      return processObject(value as Record<string, unknown>);
    }

    return value;
  }

  function processObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processValue(key, value);
    }
    return result;
  }

  return processObject(data);
}
