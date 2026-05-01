/**
 * Single source of truth for the 12 folio category modules:
 * - Which categories exist
 * - Which 4 are enabled by default for new users
 * - Which Family Access section a category gates
 * - Which standard reports each category powers
 *
 * The dashboard, FamilyAccessManager, ReportsSection, and the family-access
 * ReportViewer all read from here so a disabled module disappears everywhere.
 */

export type FolioCategoryId =
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
  | 'digital-life';

export const ALL_CATEGORY_IDS: FolioCategoryId[] = [
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
];

/**
 * Default enabled set for new users — chosen to surface the foundational
 * "who are you / who are your people / what does your estate look like"
 * layer, with the other 8 available via "Add modules" on the dashboard.
 */
export const DEFAULT_ENABLED_CATEGORIES: FolioCategoryId[] = [
  'personal-information',
  'family-dependents',
  'people-advisors',
  'legal-documents',
];

/**
 * Family-Access section keys (from FamilyAccessManager.ALL_SECTIONS) gated by
 * a specific module. If the module is disabled by the owner, the section is
 * removed from the access UI and stripped from any existing grants at render.
 *
 * 'full_sensitive' is intentionally NOT mapped — it's a global toggle
 * orthogonal to specific modules and should always be available.
 */
export const ACCESS_SECTION_REQUIRES: Record<string, FolioCategoryId> = {
  personal: 'personal-information',
  family: 'family-dependents',
  financial: 'financial-life',
  advisors: 'people-advisors',
  insurance: 'insurance-coverage',
  medical: 'emergency-care',
  legal: 'legal-documents',
  end_of_life: 'end-of-life',
};

/**
 * Reports keyed by their `id` in the REPORTS array. Listed module(s) must ALL
 * be enabled for the report to be selectable / renderable. Empty list means
 * the report has no module dependency.
 */
export const REPORT_REQUIRES: Record<string, FolioCategoryId[]> = {
  'emergency-medical': ['emergency-care'],
  'family-contact': ['family-dependents'],
  'asset-inventory': ['financial-life'],
  'insurance-summary': ['insurance-coverage'],
  'advisor-directory': ['people-advisors'],
  'estate-planning': ['legal-documents'],
  'legal-documents': ['legal-documents'],
  'need-care': ['care-decisions'],
  'funeral-instructions': ['end-of-life'],
  'what-to-do': ['legal-documents'],
  'digital-life': ['digital-life'],
  'family-briefing': ['family-dependents'],
  'ppm-client': ['legal-documents'],
  'ppm-spouse': ['legal-documents'],
};

export function reportIsAvailable(
  reportId: string,
  enabled: FolioCategoryId[] | string[],
): boolean {
  const reqs = REPORT_REQUIRES[reportId];
  if (!reqs || reqs.length === 0) return true;
  const set = new Set(enabled);
  return reqs.every((r) => set.has(r));
}

export function accessSectionIsAvailable(
  sectionKey: string,
  enabled: FolioCategoryId[] | string[],
): boolean {
  const req = ACCESS_SECTION_REQUIRES[sectionKey];
  if (!req) return true; // unmapped sections (e.g. full_sensitive) always available
  return enabled.includes(req);
}
