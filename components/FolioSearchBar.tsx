import React, { useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useFormContext } from '../lib/FormContext';

interface SearchResult {
  label: string;
  page: string;
  context: string; // e.g. "Section" or "Dr. Smith — Medical Providers"
  hint?: string; // breadcrumb hint, e.g. "Medical Data > Medical Conditions tab > Allergies section"
  key: string; // unique key for React
  subTab?: number; // tab index within the section
  isParentHeader?: boolean; // non-clickable section group header
}

// ─── Static section index with sub-entries ──────────────────────────────────

interface SubEntry {
  label: string;
  subTab: number;
  keywords: string[];
  hint?: string; // breadcrumb path describing where this is found
}

interface StaticEntry {
  label: string;
  page: string;
  keywords: string[];
  subEntries?: SubEntry[];
}

const SEARCH_INDEX: StaticEntry[] = [
  {
    label: 'Personal Information',
    page: 'category-personal-information',
    keywords: ['personal', 'name', 'address', 'phone', 'email', 'birth', 'birthday', 'ssn', 'social security', 'domicile', 'military', 'aka', 'spouse', 'marital', 'marriage', 'safe deposit', 'mailing', 'contact', 'identification', 'sex', 'gender'],
  },
  {
    label: 'Medical Data',
    page: 'category-emergency-care',
    keywords: ['medical', 'health'],
    subEntries: [
      { label: 'Medical Providers', subTab: 0, keywords: ['doctor', 'physician', 'provider', 'specialist', 'pcp', 'primary care', 'hospital', 'urgent care', 'rehab', 'hospice', 'physical therapy', 'home health'], hint: 'Medical Data > Medical Providers tab' },
      { label: 'Medications', subTab: 1, keywords: ['medication', 'medicine', 'prescription', 'drug', 'dosage', 'rx', 'pill', 'tablet', 'capsule'], hint: 'Medical Data > Medications tab' },
      { label: 'Equipment & Devices', subTab: 2, keywords: ['equipment', 'device', 'medical device', 'cpap', 'wheelchair', 'walker', 'oxygen', 'hearing aid', 'monitor', 'epipen'], hint: 'Medical Data > Equipment & Devices tab' },
      { label: 'Pharmacies', subTab: 3, keywords: ['pharmacy', 'pharmacist', 'drugstore', 'cvs', 'walgreens', 'rite aid'], hint: 'Medical Data > Pharmacies tab' },
      { label: 'Medical Conditions', subTab: 4, keywords: ['condition', 'diagnosis', 'disease', 'illness', 'chronic', 'diabetes', 'heart', 'cancer', 'hypertension', 'arthritis'], hint: 'Medical Data > Medical Conditions tab' },
      { label: 'Allergies', subTab: 4, keywords: ['allergy', 'allergies', 'allergen', 'allergic', 'anaphylaxis', 'reaction', 'hives'], hint: 'Medical Data > Medical Conditions tab > Allergies section' },
      { label: 'Surgeries & Hospitalizations', subTab: 4, keywords: ['surgery', 'surgeries', 'operation', 'procedure', 'hospitalization', 'hospital stay', 'surgical'], hint: 'Medical Data > Medical Conditions tab > Surgeries section' },
      { label: 'Basic Info & Vitals', subTab: 4, keywords: ['vitals', 'blood type', 'height', 'weight', 'basic info'], hint: 'Medical Data > Medical Conditions tab > Basic Info section' },
      { label: 'Medicare', subTab: 0, keywords: ['medicare', 'insurance medical', 'medical insurance', 'part a', 'part b', 'part d', 'medigap', 'supplement'], hint: 'Medical Data > shown at top of Medical Providers tab' },
    ],
  },
  {
    label: 'Financial Life',
    page: 'category-financial-life',
    keywords: ['financial', 'money', 'net worth'],
    subEntries: [
      { label: 'Assets', subTab: 0, keywords: ['asset', 'assets', 'bank', 'account', 'savings', 'checking', 'investment', 'brokerage', 'stock', 'bonds', 'retirement', 'ira', '401k', '403b', 'roth', 'real estate', 'property', 'house', 'home', 'vehicle', 'car', 'truck', 'business', 'digital asset', 'crypto', 'nft', 'personal property', 'jewelry', 'art', 'collectible', 'life insurance'], hint: 'Financial Life > Assets tab (with sub-tabs for each asset type)' },
      { label: 'Bank Accounts', subTab: 0, keywords: ['bank', 'checking', 'savings', 'cd', 'money market'], hint: 'Financial Life > Assets tab > Financial sub-tab' },
      { label: 'Investments', subTab: 0, keywords: ['investment', 'brokerage', 'stock', 'bonds', 'mutual fund', 'etf'], hint: 'Financial Life > Assets tab > Financial sub-tab' },
      { label: 'Retirement Accounts', subTab: 0, keywords: ['retirement', 'ira', '401k', '403b', 'roth', 'pension', 'rmd'], hint: 'Financial Life > Assets tab > Financial sub-tab' },
      { label: 'Real Estate', subTab: 0, keywords: ['real estate', 'property', 'house', 'home', 'condo', 'rental', 'mortgage', 'deed'], hint: 'Financial Life > Assets tab > Real Property sub-tab' },
      { label: 'Vehicles', subTab: 0, keywords: ['vehicle', 'car', 'truck', 'auto', 'boat'], hint: 'Financial Life > Assets tab > Vehicles sub-tab' },
      { label: 'Business Interests', subTab: 0, keywords: ['business', 'llc', 'corporation', 'partnership', 'ownership', 'buy-sell'], hint: 'Financial Life > Assets tab > Business sub-tab' },
      { label: 'Income', subTab: 1, keywords: ['income', 'salary', 'wages', 'pension', 'social security', 'rental income', 'royalties', 'dividend', 'interest income', 'annuity'], hint: 'Financial Life > Income tab' },
      { label: 'Expenses', subTab: 2, keywords: ['expense', 'expenses', 'bills', 'payments', 'spending', 'monthly', 'utilities', 'rent', 'mortgage payment'], hint: 'Financial Life > Expenses tab' },
      { label: 'Subscriptions', subTab: 3, keywords: ['subscription', 'subscriptions', 'recurring', 'streaming', 'netflix', 'spotify', 'membership', 'service', 'auto-renew'], hint: 'Financial Life > Subscriptions tab' },
      { label: 'Debts', subTab: 4, keywords: ['debt', 'debts', 'loan', 'owe', 'owed', 'credit card', 'student loan', 'personal loan', 'line of credit', 'balance'], hint: 'Financial Life > Debts tab' },
      { label: 'Gifts & Advancements', subTab: 5, keywords: ['gift', 'gifts', 'advancement', 'advancements', 'lifetime gift', 'inheritance', 'reduce share', 'gave', 'given', 'transfer'], hint: 'Financial Life > Gifts & Advancements tab' },
    ],
  },
  {
    label: 'My People & Advisors',
    page: 'category-people-advisors',
    keywords: ['advisor', 'advisors', 'attorney', 'lawyer', 'accountant', 'cpa', 'financial advisor', 'friends', 'neighbors', 'contacts', 'people', 'insurance agent', 'banker', 'real estate agent'],
  },
  {
    label: 'Legal Documents',
    page: 'category-legal-documents',
    keywords: ['legal', 'will', 'trust', 'power of attorney', 'poa', 'estate plan', 'executor', 'trustee', 'guardian', 'healthcare agent', 'living will', 'advance directive', 'documents', 'irrevocable', 'revocable', 'personal representative'],
  },
  {
    label: 'Family & Dependents',
    page: 'category-family-dependents',
    keywords: ['family', 'children', 'child', 'son', 'daughter', 'dependent', 'dependents', 'beneficiary', 'beneficiaries', 'charity', 'charities', 'pet', 'pets', 'dog', 'cat', 'animal'],
  },
  {
    label: 'Insurance Coverage',
    page: 'category-insurance-coverage',
    keywords: ['insurance', 'life insurance', 'policy', 'coverage', 'premium', 'long term care', 'ltc', 'disability', 'umbrella', 'homeowners', 'auto insurance'],
  },
  {
    label: 'Care Decisions',
    page: 'category-care-decisions',
    keywords: ['care', 'care decisions', 'preferences', 'assisted living', 'nursing home', 'home care', 'caregiver', 'long term care', 'aging', 'dementia', 'alzheimer', 'daily routine', 'diet', 'hygiene'],
  },
  {
    label: 'End of Life Issues',
    page: 'category-end-of-life',
    keywords: ['end of life', 'funeral', 'burial', 'cremation', 'church', 'obituary', 'death', 'prepaid funeral', 'memorial', 'wishes', 'cemetery', 'military honors'],
  },
  {
    label: 'Legacy & Life Story',
    page: 'category-legacy-life-story',
    keywords: ['legacy', 'life story'],
    subEntries: [
      { label: 'Obituary Info', subTab: 0, keywords: ['obituary', 'obit'], hint: 'Legacy & Life Story > Obituary Info tab' },
      { label: 'Charitable Wishes', subTab: 1, keywords: ['charitable', 'charity wishes', 'donation', 'donate'], hint: 'Legacy & Life Story > Charitable Wishes tab' },
      { label: 'Letters to Family', subTab: 2, keywords: ['letter', 'letters', 'message', 'family letter'], hint: 'Legacy & Life Story > Letters to Family tab' },
      { label: 'Personal History', subTab: 3, keywords: ['personal history', 'history', 'timeline', 'milestones'], hint: 'Legacy & Life Story > Personal History tab' },
      { label: 'Life Stories', subTab: 4, keywords: ['life story', 'stories', 'memoir', 'narrative'], hint: 'Legacy & Life Story > Life Stories tab' },
      { label: 'Reflections', subTab: 5, keywords: ['reflection', 'reflections', 'thoughts', 'wisdom'], hint: 'Legacy & Life Story > Reflections tab' },
      { label: 'Surprises', subTab: 6, keywords: ['surprise', 'surprises', 'hidden', 'secret'], hint: 'Legacy & Life Story > Surprises tab' },
      { label: 'Favorites', subTab: 7, keywords: ['favorite', 'favorites', 'preferred', 'best'], hint: 'Legacy & Life Story > Favorites tab' },
      { label: 'Video Legacy', subTab: 8, keywords: ['video', 'recording', 'film', 'footage'], hint: 'Legacy & Life Story > Video Legacy tab' },
      { label: 'Memory Vault', subTab: 9, keywords: ['memory vault', 'memories', 'keepsake', 'memorabilia'], hint: 'Legacy & Life Story > Memory Vault tab' },
    ],
  },
  {
    label: 'Documents Vault',
    page: 'category-document-uploads',
    keywords: ['documents', 'vault', 'upload', 'files', 'scan', 'deed', 'certificate', 'passport', 'dd-214'],
  },
  {
    label: 'Digital Life',
    page: 'category-digital-life',
    keywords: ['digital life', 'online accounts', 'credentials', 'passwords', 'digital', 'domain', 'website'],
    subEntries: [
      { label: 'Online Account Credentials', subTab: 0, keywords: ['credential', 'password', 'login', 'username', 'online account'], hint: 'Digital Life > Online Account Credentials tab' },
      { label: 'Digital Assets', subTab: 1, keywords: ['digital asset', 'crypto', 'cryptocurrency', 'bitcoin', 'nft', 'wallet'], hint: 'Digital Life > Digital Assets tab' },
      { label: 'Subscriptions', subTab: 2, keywords: ['subscription', 'recurring', 'streaming', 'membership'], hint: 'Digital Life > Subscriptions tab' },
      { label: 'Social Media & Email', subTab: 3, keywords: ['social media', 'facebook', 'instagram', 'twitter', 'linkedin', 'email account', 'gmail'], hint: 'Digital Life > Social Media & Email tab' },
      { label: 'Domains & Digital Business', subTab: 4, keywords: ['domain', 'website', 'digital business', 'hosting', 'url'], hint: 'Digital Life > Domains & Digital Business tab' },
    ],
  },
  {
    label: 'Reports',
    page: 'category-reports',
    keywords: ['report', 'reports', 'summary', 'print', 'export', 'pdf', 'document', 'emergency medical', 'family contact', 'asset inventory', 'insurance summary', 'advisor directory', 'estate planning', 'funeral instructions', 'what to do', 'family briefing'],
  },
  {
    label: 'Family Access',
    page: 'family-access-settings',
    keywords: ['family access', 'share', 'sharing', 'authorize', 'authorized', 'portal', 'family member'],
  },
];

// ─── Mapping from page to parent label (for dynamic data results) ────────

const PAGE_TO_PARENT: Record<string, string> = {};
SEARCH_INDEX.forEach((e) => { PAGE_TO_PARENT[e.page] = e.label; });

// ─── Map sub-tab context strings to tab indices (for dynamic data) ───────

const DATA_CONTEXT_TO_SUBTAB: Record<string, { page: string; subTab: number }> = {
  // Medical Data subs
  'Medical Provider': { page: 'category-emergency-care', subTab: 0 },
  'Practice': { page: 'category-emergency-care', subTab: 0 },
  'Medication': { page: 'category-emergency-care', subTab: 1 },
  'Prescriber': { page: 'category-emergency-care', subTab: 1 },
  'Allergy': { page: 'category-emergency-care', subTab: 4 },
  'Medical Condition': { page: 'category-emergency-care', subTab: 4 },
  'Treating Physician': { page: 'category-emergency-care', subTab: 4 },
  'Pharmacy': { page: 'category-emergency-care', subTab: 3 },
  'Medical Equipment': { page: 'category-emergency-care', subTab: 2 },
  'Supplier': { page: 'category-emergency-care', subTab: 2 },
  // Financial Life subs
  'Bank': { page: 'category-financial-life', subTab: 0 },
  'Investment': { page: 'category-financial-life', subTab: 0 },
  'Retirement': { page: 'category-financial-life', subTab: 0 },
  'Real Estate': { page: 'category-financial-life', subTab: 0 },
  'Vehicle': { page: 'category-financial-life', subTab: 0 },
  'Business': { page: 'category-financial-life', subTab: 0 },
  'Digital Asset': { page: 'category-financial-life', subTab: 0 },
  'Subscription': { page: 'category-financial-life', subTab: 3 },
};

// ─── Dynamic data index builder ──────────────────────────────────────────────

interface DataEntry {
  value: string;
  label: string;
  context: string;
  page: string;
  subTab?: number;
}

function buildDataIndex(formData: ReturnType<typeof useFormContext>['formData']): DataEntry[] {
  const entries: DataEntry[] = [];

  const add = (value: string | undefined | null, label: string, context: string, page: string, subTab?: number) => {
    if (value && value.trim()) {
      entries.push({ value: value.trim(), label, context, page, subTab });
    }
  };

  // Helper: try to infer subTab from context prefix
  const addWithInfer = (value: string | undefined | null, label: string, context: string, page: string) => {
    const prefix = context.split(' — ')[0];
    const mapping = DATA_CONTEXT_TO_SUBTAB[prefix];
    add(value, label, context, page, mapping?.subTab);
  };

  // ── Personal Information ──
  add(formData.name, formData.name, 'Client Name — Personal', 'category-personal-information');
  add(formData.aka, formData.aka, 'Client AKA — Personal', 'category-personal-information');
  add(formData.spouseName, formData.spouseName, 'Spouse Name — Personal', 'category-personal-information');
  add(formData.spouseAka, formData.spouseAka, 'Spouse AKA — Personal', 'category-personal-information');
  add(formData.email, formData.email, 'Client Email — Personal', 'category-personal-information');
  add(formData.spouseEmail, formData.spouseEmail, 'Spouse Email — Personal', 'category-personal-information');
  add(formData.cellPhone, formData.cellPhone, 'Client Cell — Personal', 'category-personal-information');
  add(formData.spouseCellPhone, formData.spouseCellPhone, 'Spouse Cell — Personal', 'category-personal-information');
  add(formData.mailingAddress, formData.mailingAddress, 'Mailing Address — Personal', 'category-personal-information');
  add(formData.mailingCity, formData.mailingCity, 'City — Personal', 'category-personal-information');
  add(formData.stateOfDomicile, formData.stateOfDomicile, 'State of Domicile — Personal', 'category-personal-information');

  // ── Medical Providers ──
  formData.medicalProviders.forEach((p) => {
    addWithInfer(p.name, p.name, `Medical Provider — ${p.specialistType || p.providerCategory || 'Provider'}`, 'category-emergency-care');
    addWithInfer(p.firmName, p.firmName, `Practice — ${p.name || 'Provider'}`, 'category-emergency-care');
    add(p.phone, p.phone, `Phone — ${p.name || 'Provider'}`, 'category-emergency-care', 0);
  });

  // ── Medications ──
  formData.medications.forEach((m) => {
    addWithInfer(m.medicationName, m.medicationName, `Medication${m.dosage ? ' — ' + m.dosage : ''}`, 'category-emergency-care');
    addWithInfer(m.prescribingPhysician, m.prescribingPhysician, `Prescriber — ${m.medicationName || 'Medication'}`, 'category-emergency-care');
  });

  // ── Allergies ──
  formData.allergies.forEach((a) => {
    addWithInfer(a.allergen, a.allergen, `Allergy — ${a.allergyType || 'Allergen'}`, 'category-emergency-care');
  });

  // ── Medical Conditions ──
  formData.medicalConditions.forEach((c) => {
    add(c.conditionName, c.conditionName, 'Medical Condition', 'category-emergency-care', 4);
    addWithInfer(c.treatingPhysician, c.treatingPhysician, `Treating Physician — ${c.conditionName || 'Condition'}`, 'category-emergency-care');
  });

  // ── Pharmacies ──
  formData.pharmacies.forEach((p) => {
    addWithInfer(p.pharmacyName, p.pharmacyName, `Pharmacy${p.pharmacyChain ? ' — ' + p.pharmacyChain : ''}`, 'category-emergency-care');
    add(p.phone, p.phone, `Phone — ${p.pharmacyName || 'Pharmacy'}`, 'category-emergency-care', 3);
  });

  // ── Medical Equipment ──
  formData.medicalEquipment.forEach((e) => {
    addWithInfer(e.equipmentName, e.equipmentName, `Medical Equipment — ${e.equipmentType || 'Device'}`, 'category-emergency-care');
    addWithInfer(e.supplierName, e.supplierName, `Supplier — ${e.equipmentName || 'Equipment'}`, 'category-emergency-care');
  });

  // ── Bank Accounts ──
  formData.bankAccounts.forEach((b) => {
    add(b.institution, b.institution, `Bank — ${b.accountType || 'Account'}`, 'category-financial-life', 0);
  });

  // ── Investments ──
  formData.nonQualifiedInvestments.forEach((inv) => {
    add(inv.institution, inv.institution, `Investment — ${inv.description || 'Account'}`, 'category-financial-life', 0);
    add(inv.description, inv.description, `Investment at ${inv.institution || 'Institution'}`, 'category-financial-life', 0);
  });

  // ── Retirement Accounts ──
  formData.retirementAccounts.forEach((r) => {
    add(r.institution, r.institution, `Retirement — ${r.accountType || 'Account'}`, 'category-financial-life', 0);
  });

  // ── Real Estate ──
  formData.realEstate.forEach((re) => {
    const addr = [re.street, re.city, re.state].filter(Boolean).join(', ');
    add(addr || undefined, addr, `Real Estate — ${re.category || 'Property'}`, 'category-financial-life', 0);
  });

  // ── Vehicles ──
  formData.vehicles.forEach((v) => {
    add(v.yearMakeModel, v.yearMakeModel, 'Vehicle', 'category-financial-life', 0);
  });

  // ── Life Insurance ──
  formData.lifeInsurance.forEach((li) => {
    add(li.company, li.company, `Life Insurance — ${li.policyType || 'Policy'}`, 'category-insurance-coverage');
    add(li.insured, li.insured, `Insured — ${li.company || 'Policy'}`, 'category-insurance-coverage');
  });

  // ── Insurance Policies ──
  formData.insurancePolicies.forEach((p) => {
    add(p.provider, p.provider, `Insurance — ${p.coverageType || 'Policy'}`, 'category-insurance-coverage');
    add(p.contactName, p.contactName, `Agent — ${p.provider || 'Policy'}`, 'category-insurance-coverage');
  });

  // ── Business Interests ──
  formData.businessInterests.forEach((bi) => {
    add(bi.businessName, bi.businessName, `Business — ${bi.entityType || 'Interest'}`, 'category-financial-life', 0);
    add(bi.coOwners, bi.coOwners, `Co-Owners — ${bi.businessName || 'Business'}`, 'category-financial-life', 0);
  });

  // ── Digital Assets ──
  formData.digitalAssets.forEach((da) => {
    add(da.platform, da.platform, `Digital Asset — ${da.assetType || 'Platform'}`, 'category-financial-life', 0);
    add(da.description, da.description, `Digital Asset at ${da.platform || 'Platform'}`, 'category-financial-life', 0);
  });

  // ── Advisors ──
  formData.advisors.forEach((a) => {
    add(a.name, a.name, `Advisor — ${a.advisorType || 'Professional'}`, 'category-people-advisors');
    add(a.firmName, a.firmName, `Firm — ${a.name || 'Advisor'}`, 'category-people-advisors');
    add(a.phone, a.phone, `Phone — ${a.name || 'Advisor'}`, 'category-people-advisors');
    add(a.email, a.email, `Email — ${a.name || 'Advisor'}`, 'category-people-advisors');
  });

  // ── Friends & Neighbors ──
  formData.friendsNeighbors.forEach((f) => {
    add(f.name, f.name, `Friend/Neighbor — ${f.relationship || 'Contact'}`, 'category-people-advisors');
    add(f.phone, f.phone, `Phone — ${f.name || 'Contact'}`, 'category-people-advisors');
  });

  // ── Children ──
  formData.children.forEach((c) => {
    add(c.name, c.name, `Child — ${c.relationship || 'Family'}`, 'category-family-dependents');
  });

  // ── Other Beneficiaries ──
  formData.otherBeneficiaries.forEach((b) => {
    add(b.name, b.name, `Beneficiary — ${b.relationship || 'Other'}`, 'category-family-dependents');
  });

  // ── Charities ──
  formData.charities.forEach((c) => {
    add(c.name, c.name, 'Charitable Organization', 'category-family-dependents');
  });

  // ── Subscriptions ──
  formData.subscriptions.forEach((s) => {
    add(s.serviceName, s.serviceName, `Subscription — ${s.category || 'Service'}`, 'category-financial-life', 3);
  });

  // ── Gifts & Advancements ──
  formData.giftsAndAdvancements.forEach((g) => {
    add(g.recipientName, g.recipientName, `Gift to ${g.relationship || 'Recipient'} — ${g.giftType || 'Gift'}`, 'category-financial-life', 5);
  });

  // ── Legal / Estate Plan — key fiduciaries ──
  const cep = formData.clientCurrentEstatePlan;
  add(cep.willPersonalRep, cep.willPersonalRep, 'Personal Representative — Will', 'category-legal-documents');
  add(cep.willPersonalRepAlternate1, cep.willPersonalRepAlternate1, 'Alternate PR #1 — Will', 'category-legal-documents');
  add(cep.trustName, cep.trustName, 'Trust Name', 'category-legal-documents');
  add(cep.trustTrustee, cep.trustTrustee, 'Trustee — Trust', 'category-legal-documents');
  add(cep.trustTrusteeAlternate1, cep.trustTrusteeAlternate1, 'Alternate Trustee #1', 'category-legal-documents');
  add(cep.financialPOAAgent1, cep.financialPOAAgent1, 'Financial POA Agent', 'category-legal-documents');
  add(cep.healthCarePOAAgent1, cep.healthCarePOAAgent1, 'Health Care POA Agent', 'category-legal-documents');
  add(cep.irrevocableTrustName, cep.irrevocableTrustName, 'Irrevocable Trust Name', 'category-legal-documents');

  // ── Funeral / End of Life ──
  add(formData.clientPreferredFuneralHome, formData.clientPreferredFuneralHome, 'Preferred Funeral Home — Client', 'category-end-of-life');
  add(formData.clientPreferredChurch, formData.clientPreferredChurch, 'Preferred Church — Client', 'category-end-of-life');
  add(formData.spousePreferredFuneralHome, formData.spousePreferredFuneralHome, 'Preferred Funeral Home — Spouse', 'category-end-of-life');
  add(formData.spousePreferredChurch, formData.spousePreferredChurch, 'Preferred Church — Spouse', 'category-end-of-life');

  // ── Legacy charity organizations ──
  formData.legacyCharityOrganizations.forEach((o) => {
    add(o.organizationName, o.organizationName, 'Legacy Charity Organization', 'category-legacy-life-story', 1);
  });

  // ── Debts ──
  (formData.debts || []).forEach((d) => {
    add(d.description, d.description, `Debt — ${d.type || 'Other'}`, 'category-financial-life', 4);
  });

  return entries;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface FolioSearchBarProps {
  onNavigate: (page: string, subTab?: number) => void;
}

const FolioSearchBar: React.FC<FolioSearchBarProps> = ({ onNavigate }) => {
  const [inputValue, setInputValue] = useState('');
  const { formData } = useFormContext();

  // Build the data index — memoized so it only rebuilds when formData changes
  const dataIndex = useMemo(() => buildDataIndex(formData), [formData]);

  const searchResults = useMemo((): SearchResult[] => {
    const q = inputValue.toLowerCase().trim();
    if (!q || q.length < 2) return [];

    const results: SearchResult[] = [];
    const seen = new Set<string>();
    const parentPagesAdded = new Set<string>();

    // Helper: insert a parent header + matching sub-entries for a section
    const addParentAndSubs = (entry: StaticEntry, matchingSubs: SubEntry[]) => {
      // Add parent header (non-clickable label)
      const parentKey = `parent-${entry.page}`;
      if (!parentPagesAdded.has(entry.page)) {
        parentPagesAdded.add(entry.page);
        results.push({
          label: entry.label,
          page: entry.page,
          context: 'Section',
          key: parentKey,
          isParentHeader: true,
        });
      }
      // Add matching sub-entries indented
      matchingSubs.forEach((sub) => {
        const subKey = `sub-${entry.page}-${sub.subTab}-${sub.label}`;
        if (!seen.has(subKey)) {
          seen.add(subKey);
          results.push({
            label: sub.label,
            page: entry.page,
            context: entry.label,
            hint: sub.hint,
            key: subKey,
            subTab: sub.subTab,
          });
        }
      });
    };

    // 1. Static section & sub-entry matches
    SEARCH_INDEX.forEach((entry) => {
      const parentMatches =
        entry.label.toLowerCase().includes(q) ||
        entry.keywords.some((kw) => kw.includes(q));

      const matchingSubs = (entry.subEntries || []).filter(
        (sub) =>
          sub.label.toLowerCase().includes(q) ||
          sub.keywords.some((kw) => kw.includes(q))
      );

      if (parentMatches && entry.subEntries && entry.subEntries.length > 0) {
        // Parent matched and has subs — show parent header + ALL subs
        addParentAndSubs(entry, entry.subEntries);
      } else if (matchingSubs.length > 0) {
        // Only sub-entries matched — show parent header + matching subs
        addParentAndSubs(entry, matchingSubs);
      } else if (parentMatches) {
        // Parent matched, no sub-entries — show as a regular clickable result
        const key = `section-${entry.page}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            label: entry.label,
            page: entry.page,
            context: 'Section',
            key,
          });
        }
      }
    });

    // 2. Data value matches — grouped under their parent section
    const dataMatches: SearchResult[] = [];
    dataIndex.forEach((entry, i) => {
      if (entry.value.toLowerCase().includes(q)) {
        const dedupeKey = entry.value.toLowerCase() + entry.page + (entry.subTab ?? '');
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          dataMatches.push({
            label: entry.label,
            page: entry.page,
            context: entry.context,
            key: `data-${entry.page}-${i}`,
            subTab: entry.subTab,
          });
        }
      }
    });

    // Group data matches under parent headers
    const dataByPage = new Map<string, SearchResult[]>();
    dataMatches.forEach((dm) => {
      const arr = dataByPage.get(dm.page) || [];
      arr.push(dm);
      dataByPage.set(dm.page, arr);
    });

    dataByPage.forEach((items, page) => {
      const parentLabel = PAGE_TO_PARENT[page] || page;
      // Add parent header if not already present
      if (!parentPagesAdded.has(page)) {
        parentPagesAdded.add(page);
        results.push({
          label: parentLabel,
          page,
          context: 'Section',
          key: `parent-data-${page}`,
          isParentHeader: true,
        });
      }
      items.forEach((item) => results.push(item));
    });

    // Cap at 20 results to keep the dropdown manageable
    return results.slice(0, 20);
  }, [inputValue, dataIndex]);

  return (
    <Autocomplete
      freeSolo
      options={searchResults}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      getOptionDisabled={(option) => !!option.isParentHeader}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => {
        if (value && typeof value !== 'string' && !value.isParentHeader) {
          onNavigate(value.page, value.subTab);
          setInputValue('');
        }
      }}
      renderOption={(props, option) => {
        if (option.isParentHeader) {
          // Non-clickable section header
          return (
            <Box
              component="li"
              {...props}
              key={option.key}
              sx={{
                pointerEvents: 'none',
                bgcolor: 'grey.50',
                borderTop: '1px solid',
                borderColor: 'divider',
                py: '4px !important',
                px: '12px !important',
                '&:first-of-type': { borderTop: 'none' },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.68rem',
                  letterSpacing: '0.05em',
                }}
              >
                {option.label}
              </Typography>
            </Box>
          );
        }

        // Clickable sub-item — indented, with optional hint
        return (
          <Box component="li" {...props} key={option.key}>
            <Box sx={{ display: 'flex', flexDirection: 'column', pl: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {option.label}
              </Typography>
              {option.hint ? (
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', fontSize: '0.65rem', fontStyle: 'italic' }}
                >
                  {option.hint}
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                >
                  {option.context}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      filterOptions={(x) => x}
      size="small"
      sx={{
        width: { xs: 180, md: 260 },
        '& .MuiOutlinedInput-root': {
          bgcolor: 'rgba(255,255,255,0.12)',
          color: 'white',
          fontSize: '0.85rem',
          borderRadius: 1,
          '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
          '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
        },
        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.6)', opacity: 1 },
        '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.6)' },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search folio..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

export default FolioSearchBar;
