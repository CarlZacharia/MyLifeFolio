/** Safely extract a string from Record<string, unknown> */
export const str = (val: unknown, fallback = 'N/A'): string => {
  if (val === null || val === undefined || val === '') return fallback;
  return String(val);
};
