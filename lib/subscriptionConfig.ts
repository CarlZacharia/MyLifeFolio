/**
 * Subscription tier configuration.
 *
 * As of 2026-05-01, MyLifeFolio has only two tiers:
 *   • 'trial' — free for 6 months from signup
 *   • 'paid'  — $149/year
 *
 * Both tiers grant full access to every feature. The 'standard' / 'enhanced'
 * split was retired; AI obituary and legacy video are now available to all
 * users. Tier-aware code remains so that future paywalls can reuse this
 * config, but `canAccess()` in SubscriptionContext currently returns true for
 * any active or trialing user.
 */

export type SubscriptionTier = 'trial' | 'paid';

export type FeatureKey =
  // Main folio categories (match folioCategories ids in MyLifeFolioHome)
  | 'personal-information'
  | 'family-dependents'
  | 'financial-life'
  | 'people-advisors'
  | 'insurance-coverage'
  | 'emergency-care'
  | 'care-decisions'
  | 'end-of-life'
  | 'legacy-life-story'
  | 'legal-documents'
  | 'document-uploads'
  | 'digital-life'
  // Row 4 cards
  | 'reports'
  | 'family-access'
  // Premium-feeling features (now included for everyone)
  | 'ai-obituary'
  | 'legacy-video';

const ALL_FEATURES: FeatureKey[] = [
  'personal-information',
  'family-dependents',
  'financial-life',
  'people-advisors',
  'insurance-coverage',
  'emergency-care',
  'care-decisions',
  'end-of-life',
  'legacy-life-story',
  'legal-documents',
  'document-uploads',
  'digital-life',
  'reports',
  'family-access',
  'ai-obituary',
  'legacy-video',
];

// Trial and Paid both get the full feature set.
export const TIER_ACCESS: Record<SubscriptionTier, Set<FeatureKey>> = {
  trial: new Set(ALL_FEATURES),
  paid: new Set(ALL_FEATURES),
};

// Display info for each tier (used on PricingPage and elsewhere in the UI).
export const TIER_INFO: Record<SubscriptionTier, {
  name: string;
  price: string;
  priceDetail: string;
  description: string;
}> = {
  trial: {
    name: 'Free Trial',
    price: '$0',
    priceDetail: '6 months',
    description: 'Full access to MyLifeFolio for the first 6 months — no credit card required.',
  },
  paid: {
    name: 'MyLifeFolio Subscription',
    price: '$149',
    priceDetail: 'per year',
    description: 'Full access — every category, every report, family access, and legacy video.',
  },
};

/** Annual price as a number, for billing/checkout flows. */
export const PAID_ANNUAL_PRICE_USD = 149;

/** Trial length in months (single source of truth — keep in sync with the SQL trigger). */
export const TRIAL_LENGTH_MONTHS = 6;

/** Days the user has to renew or delete after trial ends. */
export const GRACE_PERIOD_DAYS = 30;

/**
 * Returns the minimum tier required to access a feature.
 * With every feature available to both tiers today this always returns
 * 'trial', but the function is kept for forward compatibility.
 */
export function getRequiredTier(_feature: FeatureKey): SubscriptionTier {
  return 'trial';
}
