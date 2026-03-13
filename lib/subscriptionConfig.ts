/**
 * Subscription tier configuration
 * Maps each tier to the features it can access.
 */

export type SubscriptionTier = 'trial' | 'standard' | 'enhanced';

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
  // Enhanced-only sub-features
  | 'ai-obituary'
  | 'legacy-video';

// All features available in the app
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

// Standard has everything except AI obituary and legacy video
const STANDARD_FEATURES: FeatureKey[] = ALL_FEATURES.filter(
  (f) => f !== 'ai-obituary' && f !== 'legacy-video'
);

// Trial gets the same access as Standard (7-day free trial)
const TRIAL_FEATURES: FeatureKey[] = [...STANDARD_FEATURES];

export const TIER_ACCESS: Record<SubscriptionTier, Set<FeatureKey>> = {
  trial: new Set(TRIAL_FEATURES),
  standard: new Set(STANDARD_FEATURES),
  enhanced: new Set(ALL_FEATURES),
};

// Display info for each tier (used on pricing page and upgrade prompts)
export const TIER_INFO: Record<SubscriptionTier, {
  name: string;
  price: string;
  priceDetail: string;
  description: string;
}> = {
  trial: {
    name: 'Free Trial',
    price: '$0',
    priceDetail: '7 days',
    description: 'Full access to all Standard features free for 7 days.',
  },
  standard: {
    name: 'Standard',
    price: '$139',
    priceDetail: 'per year',
    description: 'Full access to all sections, documents, reports, and family access.',
  },
  enhanced: {
    name: 'Enhanced',
    price: '$159',
    priceDetail: 'per year',
    description: 'Everything in Standard plus AI-powered obituary and legacy video recording.',
  },
};

/**
 * Returns the minimum tier required to access a feature.
 */
export function getRequiredTier(feature: FeatureKey): SubscriptionTier {
  if (TIER_ACCESS.trial.has(feature)) return 'trial';
  if (TIER_ACCESS.standard.has(feature)) return 'standard';
  return 'enhanced';
}
