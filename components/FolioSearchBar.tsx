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
  key: string; // unique key for React
}

// ─── Static section index ────────────────────────────────────────────────────

interface StaticEntry {
  label: string;
  page: string;
  keywords: string[];
}

const SEARCH_INDEX: StaticEntry[] = [
  {
    label: 'Personal Information',
    page: 'category-personal-information',
    keywords: ['personal', 'name', 'address', 'phone', 'email', 'birth', 'birthday', 'ssn', 'social security', 'domicile', 'military', 'aka', 'spouse', 'marital', 'marriage', 'safe deposit', 'mailing'],
  },
  {
    label: 'Medical Data',
    page: 'category-emergency-care',
    keywords: ['medical', 'doctor', 'physician', 'hospital', 'medication', 'prescription', 'allergy', 'allergies', 'health', 'provider', 'medicare', 'insurance medical', 'diagnosis'],
  },
  {
    label: 'Financial Life',
    page: 'category-financial-life',
    keywords: ['financial', 'bank', 'account', 'investment', 'retirement', 'ira', '401k', 'asset', 'assets', 'income', 'money', 'savings', 'checking', 'brokerage', 'stock', 'bonds', 'real estate', 'property', 'vehicle', 'car', 'business', 'digital assets', 'crypto', 'royalties', 'expenses'],
  },
  {
    label: 'My People & Advisors',
    page: 'category-people-advisors',
    keywords: ['advisor', 'advisors', 'attorney', 'lawyer', 'accountant', 'cpa', 'financial advisor', 'friends', 'neighbors', 'contacts', 'people'],
  },
  {
    label: 'Legal Documents',
    page: 'category-legal-documents',
    keywords: ['legal', 'will', 'trust', 'power of attorney', 'poa', 'estate plan', 'executor', 'trustee', 'guardian', 'healthcare agent', 'living will', 'advance directive', 'documents', 'irrevocable'],
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
    keywords: ['care', 'care decisions', 'preferences', 'assisted living', 'nursing home', 'home care', 'caregiver', 'long term care', 'aging', 'dementia', 'alzheimer'],
  },
  {
    label: 'End of Life Issues',
    page: 'category-end-of-life',
    keywords: ['end of life', 'funeral', 'burial', 'cremation', 'church', 'obituary', 'death', 'prepaid funeral', 'memorial', 'wishes'],
  },
  {
    label: 'Legacy & Life Story',
    page: 'category-legacy-life-story',
    keywords: ['legacy', 'life story', 'obituary', 'letters', 'video', 'memory', 'reflections', 'favorites', 'charity wishes', 'charitable'],
  },
  {
    label: 'Documents Vault',
    page: 'category-document-uploads',
    keywords: ['documents', 'vault', 'upload', 'files', 'scan', 'deed', 'certificate', 'passport', 'dd-214'],
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

// ─── Dynamic data index builder ──────────────────────────────────────────────

interface DataEntry {
  value: string;
  label: string;
  context: string;
  page: string;
}

function buildDataIndex(formData: ReturnType<typeof useFormContext>['formData']): DataEntry[] {
  const entries: DataEntry[] = [];

  const add = (value: string | undefined | null, label: string, context: string, page: string) => {
    if (value && value.trim()) {
      entries.push({ value: value.trim(), label, context, page });
    }
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
    add(p.name, p.name, `Medical Provider — ${p.specialistType || p.providerCategory || 'Provider'}`, 'category-emergency-care');
    add(p.firmName, p.firmName, `Practice — ${p.name || 'Provider'}`, 'category-emergency-care');
    add(p.phone, p.phone, `Phone — ${p.name || 'Provider'}`, 'category-emergency-care');
  });

  // ── Medications ──
  formData.medications.forEach((m) => {
    add(m.medicationName, m.medicationName, `Medication${m.dosage ? ' — ' + m.dosage : ''}`, 'category-emergency-care');
    add(m.prescribingPhysician, m.prescribingPhysician, `Prescriber — ${m.medicationName || 'Medication'}`, 'category-emergency-care');
  });

  // ── Allergies ──
  formData.allergies.forEach((a) => {
    add(a.allergen, a.allergen, `Allergy — ${a.allergyType || 'Allergen'}`, 'category-emergency-care');
  });

  // ── Medical Conditions ──
  formData.medicalConditions.forEach((c) => {
    add(c.conditionName, c.conditionName, 'Medical Condition', 'category-emergency-care');
    add(c.treatingPhysician, c.treatingPhysician, `Treating Physician — ${c.conditionName || 'Condition'}`, 'category-emergency-care');
  });

  // ── Pharmacies ──
  formData.pharmacies.forEach((p) => {
    add(p.pharmacyName, p.pharmacyName, `Pharmacy${p.pharmacyChain ? ' — ' + p.pharmacyChain : ''}`, 'category-emergency-care');
    add(p.phone, p.phone, `Phone — ${p.pharmacyName || 'Pharmacy'}`, 'category-emergency-care');
  });

  // ── Medical Equipment ──
  formData.medicalEquipment.forEach((e) => {
    add(e.equipmentName, e.equipmentName, `Medical Equipment — ${e.equipmentType || 'Device'}`, 'category-emergency-care');
    add(e.supplierName, e.supplierName, `Supplier — ${e.equipmentName || 'Equipment'}`, 'category-emergency-care');
  });

  // ── Bank Accounts ──
  formData.bankAccounts.forEach((b) => {
    add(b.institution, b.institution, `Bank — ${b.accountType || 'Account'}`, 'category-financial-life');
  });

  // ── Investments ──
  formData.nonQualifiedInvestments.forEach((inv) => {
    add(inv.institution, inv.institution, `Investment — ${inv.description || 'Account'}`, 'category-financial-life');
    add(inv.description, inv.description, `Investment at ${inv.institution || 'Institution'}`, 'category-financial-life');
  });

  // ── Retirement Accounts ──
  formData.retirementAccounts.forEach((r) => {
    add(r.institution, r.institution, `Retirement — ${r.accountType || 'Account'}`, 'category-financial-life');
  });

  // ── Real Estate ──
  formData.realEstate.forEach((re) => {
    const addr = [re.street, re.city, re.state].filter(Boolean).join(', ');
    add(addr || undefined, addr, `Real Estate — ${re.category || 'Property'}`, 'category-financial-life');
  });

  // ── Vehicles ──
  formData.vehicles.forEach((v) => {
    add(v.yearMakeModel, v.yearMakeModel, 'Vehicle', 'category-financial-life');
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
    add(bi.businessName, bi.businessName, `Business — ${bi.entityType || 'Interest'}`, 'category-financial-life');
    add(bi.coOwners, bi.coOwners, `Co-Owners — ${bi.businessName || 'Business'}`, 'category-financial-life');
  });

  // ── Digital Assets ──
  formData.digitalAssets.forEach((da) => {
    add(da.platform, da.platform, `Digital Asset — ${da.assetType || 'Platform'}`, 'category-financial-life');
    add(da.description, da.description, `Digital Asset at ${da.platform || 'Platform'}`, 'category-financial-life');
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
    add(s.serviceName, s.serviceName, `Subscription — ${s.category || 'Service'}`, 'category-financial-life');
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
    add(o.organizationName, o.organizationName, 'Legacy Charity Organization', 'category-legacy-life-story');
  });

  return entries;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface FolioSearchBarProps {
  onNavigate: (page: string) => void;
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

    // 1. Static section matches first
    SEARCH_INDEX.forEach((entry) => {
      if (
        entry.label.toLowerCase().includes(q) ||
        entry.keywords.some((kw) => kw.includes(q))
      ) {
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

    // 2. Data value matches
    dataIndex.forEach((entry, i) => {
      if (entry.value.toLowerCase().includes(q)) {
        const key = `data-${entry.page}-${i}`;
        if (!seen.has(entry.value.toLowerCase() + entry.page)) {
          seen.add(entry.value.toLowerCase() + entry.page);
          results.push({
            label: entry.label,
            page: entry.page,
            context: entry.context,
            key,
          });
        }
      }
    });

    // Cap at 15 results to keep the dropdown manageable
    return results.slice(0, 15);
  }, [inputValue, dataIndex]);

  return (
    <Autocomplete
      freeSolo
      options={searchResults}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => {
        if (value && typeof value !== 'string') {
          onNavigate(value.page);
          setInputValue('');
        }
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.key}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {option.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
            >
              {option.context}
            </Typography>
          </Box>
        </Box>
      )}
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
