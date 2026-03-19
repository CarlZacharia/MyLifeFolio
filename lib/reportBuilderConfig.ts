/**
 * Report Builder configuration.
 *
 * Defines the 5 report groups that organize the 12 folio categories,
 * and maps each category's sub-items to the existing report component IDs
 * so the custom report preview can render the right sections.
 */

// ─── Report group definitions ────────────────────────────────────────────────

export interface ReportGroupCategory {
  /** Matches folioCategories[].id in MyLifeFolioHome.tsx */
  id: string;
  label: string;
  items: string[];
}

export interface ReportGroup {
  id: string;
  label: string;
  categories: ReportGroupCategory[];
}

export const REPORT_GROUPS: ReportGroup[] = [
  {
    id: 'personal-family',
    label: 'Personal & Family',
    categories: [
      {
        id: 'personal-information',
        label: 'Personal Information',
        items: [
          'Client & spouse details',
          'Contact info & identification',
          'Domicile & marital status',
          'Military service',
          'Safe deposit box',
          'Medicare & medical insurance',
        ],
      },
      {
        id: 'family-dependents',
        label: 'Family & Dependents',
        items: [
          'Children & grandchildren',
          'Other beneficiaries',
          'Charitable organizations',
          'Beneficiary concerns',
          'Pet care',
        ],
      },
      {
        id: 'people-advisors',
        label: 'My People & Advisors',
        items: [
          'Attorney, accountant, financial advisor',
          'Insurance & real estate agents',
          'Business advisor & other',
          'Friends & neighbors',
        ],
      },
    ],
  },
  {
    id: 'financial-insurance',
    label: 'Financial & Insurance',
    categories: [
      {
        id: 'financial-life',
        label: 'Financial Life',
        items: [
          'Assets: financial, real property, vehicles, business, digital, personal property',
          'Income sources',
          'Expenses',
          'Debts',
        ],
      },
      {
        id: 'insurance-coverage',
        label: 'Insurance Coverage',
        items: [
          'Medical & vehicle insurance',
          'Homeowners & umbrella',
          'Long-term care & disability',
          'Life insurance & other policies',
        ],
      },
    ],
  },
  {
    id: 'medical-care',
    label: 'Medical & Care',
    categories: [
      {
        id: 'emergency-care',
        label: 'Medical Data',
        items: [
          'Medical providers',
          'Medications',
          'Equipment and Devices',
          'Pharmacies',
          'Medical conditions',
        ],
      },
      {
        id: 'care-decisions',
        label: 'Care Decisions',
        items: [
          'Care setting & medical preferences',
          'Diet, hygiene & daily routine',
          'Activities, family & social',
          'Cognitive, communication & spiritual',
          'Financial & end-of-life preferences',
        ],
      },
      {
        id: 'end-of-life',
        label: 'End of Life Issues',
        items: [
          'Advance directives',
          'Prepaid funeral & desires',
          'Funeral home & burial',
          'Religious preferences',
        ],
      },
    ],
  },
  {
    id: 'legal-documents',
    label: 'Legal & Documents',
    categories: [
      {
        id: 'legal-documents',
        label: 'Legal Documents',
        items: [
          'Will (Last Will & Testament)',
          'Revocable living trust',
          'Irrevocable trust',
          'Financial power of attorney',
          'Health care power of attorney',
        ],
      },
      {
        id: 'document-uploads',
        label: 'Documents Vault',
        items: [
          'Estate Planning & Legal',
          'Real Estate & Property',
          'Financial & Accounts',
          'Insurance',
          'Personal Identity',
          'Military & Government',
          'Medical & Health',
          'Family & Genealogy',
          'Personal Legacy & Memorabilia',
          'Digital Assets',
          'Other',
        ],
      },
    ],
  },
  {
    id: 'legacy-digital',
    label: 'Legacy & Digital',
    categories: [
      {
        id: 'legacy-life-story',
        label: 'Legacy & Life Story',
        items: [
          'Obituary Info',
          'Charitable Wishes',
          'Letters to Family',
          'Personal History',
          'Life Stories',
          'Reflections',
          'Surprises',
          'Favorites',
          'Video Legacy',
          'Memory Vault',
        ],
      },
      {
        id: 'digital-life',
        label: 'Digital Life',
        items: [
          'Online account credentials',
          'Digital assets & cryptocurrency',
          'Subscriptions & recurring services',
          'Social media & email accounts',
          'Domain names & digital businesses',
        ],
      },
    ],
  },
];

// ─── Category → existing report component mapping ────────────────────────────
// Maps a folio category id to the report IDs (from REPORTS in ReportsSection)
// that should render when that category is selected in the custom builder.

export const CATEGORY_TO_REPORT_IDS: Record<string, string[]> = {
  'personal-information': ['family-contact'],
  'family-dependents': ['family-contact'],
  'people-advisors': ['advisor-directory'],
  'financial-life': ['asset-inventory'],
  'insurance-coverage': ['insurance-summary'],
  'emergency-care': ['emergency-medical'],
  'care-decisions': ['need-care'],
  'end-of-life': ['funeral-instructions'],
  'legal-documents': ['estate-planning'],
  'document-uploads': [], // Documents vault doesn't map to a pre-existing report
  'legacy-life-story': ['funeral-instructions'],
  'digital-life': ['digital-life'],
};

// ─── Preset report configurations ────────────────────────────────────────────

export interface PresetReport {
  id: string;
  name: string;
  description: string;
  /** categoryId → selected sub-item labels */
  sections: Record<string, string[]>;
}

export const PRESET_REPORTS: PresetReport[] = [
  {
    id: 'preset-complete',
    name: 'Complete Folio Report',
    description: 'Every section from all categories',
    sections: Object.fromEntries(
      REPORT_GROUPS.flatMap((g) => g.categories).map((c) => [c.id, [...c.items]])
    ),
  },
  {
    id: 'preset-emergency',
    name: 'Emergency & Medical',
    description: 'Medical data, care decisions, and personal contacts',
    sections: {
      'personal-information': ['Client & spouse details', 'Contact info & identification'],
      'emergency-care': ['Medical providers', 'Medications', 'Equipment and Devices', 'Pharmacies', 'Medical conditions'],
      'people-advisors': ['Attorney, accountant, financial advisor', 'Friends & neighbors'],
    },
  },
  {
    id: 'preset-financial',
    name: 'Financial Overview',
    description: 'Assets, insurance, income, and debts',
    sections: {
      'financial-life': ['Assets: financial, real property, vehicles, business, digital, personal property', 'Income sources', 'Expenses', 'Debts'],
      'insurance-coverage': ['Medical & vehicle insurance', 'Homeowners & umbrella', 'Long-term care & disability', 'Life insurance & other policies'],
    },
  },
  {
    id: 'preset-estate',
    name: 'Estate Planning Summary',
    description: 'Legal documents, beneficiaries, and distribution plans',
    sections: {
      'legal-documents': ['Will (Last Will & Testament)', 'Revocable living trust', 'Irrevocable trust', 'Financial power of attorney', 'Health care power of attorney'],
      'family-dependents': ['Children & grandchildren', 'Other beneficiaries', 'Charitable organizations', 'Beneficiary concerns'],
      'people-advisors': ['Attorney, accountant, financial advisor'],
    },
  },
  {
    id: 'preset-end-of-life',
    name: 'End of Life & Legacy',
    description: 'Funeral wishes, legacy items, and care decisions',
    sections: {
      'end-of-life': ['Advance directives', 'Prepaid funeral & desires', 'Funeral home & burial', 'Religious preferences'],
      'care-decisions': ['Care setting & medical preferences', 'Diet, hygiene & daily routine', 'Activities, family & social', 'Cognitive, communication & spiritual', 'Financial & end-of-life preferences'],
      'legacy-life-story': ['Obituary Info', 'Charitable Wishes', 'Letters to Family', 'Personal History', 'Life Stories', 'Reflections', 'Surprises', 'Favorites', 'Video Legacy', 'Memory Vault'],
    },
  },
];

// ─── Helper: get all item labels for a given category ────────────────────────

export function getAllItemsForCategory(categoryId: string): string[] {
  for (const group of REPORT_GROUPS) {
    const cat = group.categories.find((c) => c.id === categoryId);
    if (cat) return cat.items;
  }
  return [];
}

// ─── Helper: count total selected items ──────────────────────────────────────

export function countSelectedItems(sections: Record<string, string[]>): number {
  return Object.values(sections).reduce((sum, items) => sum + items.length, 0);
}

// ─── Helper: count total possible items ──────────────────────────────────────

export function countTotalItems(): number {
  return REPORT_GROUPS.flatMap((g) => g.categories).reduce((sum, c) => sum + c.items.length, 0);
}
