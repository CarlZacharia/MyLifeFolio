/**
 * Physical Document Storage Location — category & sub-item definitions.
 *
 * "Static" sub-items are fixed rows (e.g. Will, Trust).
 * "Dynamic" sub-items are populated at runtime from folio_real_estate / folio_vehicles.
 */

// ── Vault category cross-reference mapping ─────────────────────────────────
// Maps a physical-location category to the vault upload category id used in
// documentVaultCategories.ts so we can cross-reference uploaded documents.
export const VAULT_CATEGORY_XREF: Record<string, string> = {
  'estate-planning': 'estate-planning-legal',
  'insurance': 'insurance',
  'real-property': 'real-estate-property',
  'financial-accounts': 'financial-accounts',
  'tax-records': 'real-estate-property',       // property tax → real estate vault; prior returns → other
  'business-interests': 'financial-accounts',   // closest match
  'vehicle-titles': 'other',                    // no dedicated vault category
  'safe-deposit-box': 'other',
  'personal-identity': 'personal-identity',
  'funeral-cemetery': 'estate-planning-legal',
  'military': 'military-government',
  'other': 'other',
};

// ── Keyword hints for cross-referencing vault uploads ────────────────────
// For each sub-item, these keywords are matched (case-insensitive) against
// vault_documents.document_name to surface a "View uploaded document" link.
export interface SubItemKeywords {
  [subItem: string]: string[];
}

export const SUB_ITEM_KEYWORDS: Record<string, SubItemKeywords> = {
  'estate-planning': {
    'Will': ['will', 'last will'],
    'Trust': ['trust'],
    'POA (Financial)': ['power of attorney', 'poa', 'financial poa', 'durable poa'],
    'Health Care Surrogate / POA': ['health care', 'surrogate', 'healthcare poa', 'medical poa', 'hcpoa'],
    'Living Will / Advance Directive': ['living will', 'advance directive', 'directive'],
    'Prenuptial Agreement': ['prenuptial', 'prenup', 'premarital'],
  },
  'insurance': {
    'Life Insurance': ['life insurance', 'life policy'],
    'Homeowners Insurance': ['homeowner', 'homeowners', 'home insurance', 'hazard'],
    'Auto Insurance': ['auto insurance', 'car insurance', 'vehicle insurance'],
    'Umbrella Insurance': ['umbrella'],
    'Long-Term Care Insurance': ['long-term care', 'ltc', 'long term care'],
    'Medicare Supplement': ['medicare', 'medigap', 'supplement'],
  },
  'real-property': {
    // Dynamic — keywords built from property address at runtime
  },
  'financial-accounts': {
    'Brokerage Statements': ['brokerage', 'investment statement', 'account statement'],
    'Retirement Account Beneficiary Designations': ['beneficiary designation', 'retirement', 'ira', '401k', '403b'],
  },
  'tax-records': {
    'Prior Tax Returns': ['tax return', 'tax filing', '1040'],
    'Property Tax Records': ['property tax'],
  },
  'business-interests': {
    'Buy-Sell Agreement': ['buy-sell', 'buy sell'],
    'Operating Agreement': ['operating agreement', 'llc agreement'],
  },
  'vehicle-titles': {
    // Dynamic — keywords built from vehicle year/make/model at runtime
  },
  'safe-deposit-box': {
    'Box Location': ['safe deposit', 'safety deposit'],
    'Key Location': ['safe deposit key', 'box key'],
  },
  'personal-identity': {
    'Birth Certificate(s)': ['birth certificate'],
    'Marriage Certificate': ['marriage certificate', 'marriage license'],
    'Divorce Decree(s)': ['divorce decree', 'divorce'],
    'Social Security Card(s)': ['social security', 'ss card'],
    'Passport(s)': ['passport'],
    'Naturalization / Citizenship Papers': ['naturalization', 'citizenship'],
    'Adoption Decree(s)': ['adoption'],
  },
  'funeral-cemetery': {
    'Pre-Paid Funeral Contract': ['funeral contract', 'funeral', 'pre-paid funeral', 'prepaid funeral'],
    'Burial Plot Deed / Cremation Instructions': ['burial', 'plot deed', 'cremation', 'cemetery'],
  },
  'military': {
    'DD-214': ['dd-214', 'dd214', 'discharge'],
    'VA Benefit Letters': ['va benefit', 'veterans benefit', 'va letter'],
  },
  'other': {
    // Dynamic — user adds custom rows
  },
};

// ── Category definitions ────────────────────────────────────────────────────

export interface PhysicalDocSubItem {
  label: string;
  dynamic?: false;
}

export interface PhysicalDocCategory {
  id: string;
  label: string;
  subItems: PhysicalDocSubItem[];
  /** If true, rows are populated dynamically from an asset table instead of subItems */
  dynamicSource?: 'folio_real_estate' | 'folio_vehicles';
  /** Additional static sub-items that appear alongside dynamic rows */
  staticSubItems?: PhysicalDocSubItem[];
  /** Whether the user can add custom rows (used by "Other" category) */
  allowCustomRows?: boolean;
}

export const PHYSICAL_DOC_CATEGORIES: PhysicalDocCategory[] = [
  {
    id: 'estate-planning',
    label: 'Estate Planning',
    subItems: [
      { label: 'Will' },
      { label: 'Trust' },
      { label: 'POA (Financial)' },
      { label: 'Health Care Surrogate / POA' },
      { label: 'Living Will / Advance Directive' },
      { label: 'Prenuptial Agreement' },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    subItems: [
      { label: 'Life Insurance' },
      { label: 'Homeowners Insurance' },
      { label: 'Auto Insurance' },
      { label: 'Umbrella Insurance' },
      { label: 'Long-Term Care Insurance' },
      { label: 'Medicare Supplement' },
    ],
  },
  {
    id: 'real-property',
    label: 'Real Property',
    subItems: [],
    dynamicSource: 'folio_real_estate',
    staticSubItems: [
      { label: 'Mortgage Documents' },
    ],
  },
  {
    id: 'financial-accounts',
    label: 'Financial Accounts',
    subItems: [
      { label: 'Brokerage Statements' },
      { label: 'Retirement Account Beneficiary Designations' },
    ],
  },
  {
    id: 'tax-records',
    label: 'Tax Records',
    subItems: [
      { label: 'Prior Tax Returns' },
      { label: 'Property Tax Records' },
    ],
  },
  {
    id: 'business-interests',
    label: 'Business Interests',
    subItems: [
      { label: 'Buy-Sell Agreement' },
      { label: 'Operating Agreement' },
    ],
  },
  {
    id: 'vehicle-titles',
    label: 'Vehicle Titles',
    subItems: [],
    dynamicSource: 'folio_vehicles',
  },
  {
    id: 'safe-deposit-box',
    label: 'Safe Deposit Box',
    subItems: [
      { label: 'Box Location' },
      { label: 'Key Location' },
    ],
  },
  {
    id: 'personal-identity',
    label: 'Personal Identity & Vital Records',
    subItems: [
      { label: 'Birth Certificate(s)' },
      { label: 'Marriage Certificate' },
      { label: 'Divorce Decree(s)' },
      { label: 'Social Security Card(s)' },
      { label: 'Passport(s)' },
      { label: 'Naturalization / Citizenship Papers' },
      { label: 'Adoption Decree(s)' },
    ],
  },
  {
    id: 'funeral-cemetery',
    label: 'Funeral & Cemetery',
    subItems: [
      { label: 'Pre-Paid Funeral Contract' },
      { label: 'Burial Plot Deed / Cremation Instructions' },
    ],
  },
  {
    id: 'military',
    label: 'Military',
    subItems: [
      { label: 'DD-214' },
      { label: 'VA Benefit Letters' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    subItems: [],
    allowCustomRows: true,
  },
];

export const PHYSICAL_DOC_CATEGORY_MAP = Object.fromEntries(
  PHYSICAL_DOC_CATEGORIES.map((c) => [c.id, c])
);
