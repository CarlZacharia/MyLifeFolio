/**
 * Shared admin identity utilities.
 * Admin access is restricted to specific email addresses.
 */

export const ADMIN_EMAILS = [
  'czacharia@zacbrownlaw.com',
  'support@seniorcares.com',
];

export const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
