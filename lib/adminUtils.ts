/**
 * Shared admin identity utilities.
 * Admin domains: @mylifefolio.com and @zacbrownlaw.com
 */

export const ADMIN_DOMAINS = ['mylifefolio.com', 'zacbrownlaw.com'];

export const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ADMIN_DOMAINS.includes(domain);
};
