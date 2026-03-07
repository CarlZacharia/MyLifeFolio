import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchEntry {
  label: string;
  page: string;
  keywords: string[];
}

const SEARCH_INDEX: SearchEntry[] = [
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
    label: 'Reports',
    page: 'category-reports',
    keywords: ['report', 'reports', 'summary', 'print', 'export', 'pdf', 'document'],
  },
  {
    label: 'Family Access',
    page: 'family-access-settings',
    keywords: ['family access', 'share', 'sharing', 'authorize', 'authorized', 'portal', 'family member'],
  },
];

function searchEntries(query: string): SearchEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return SEARCH_INDEX.filter(
    (entry) =>
      entry.label.toLowerCase().includes(q) ||
      entry.keywords.some((kw) => kw.includes(q))
  );
}

interface FolioSearchBarProps {
  onNavigate: (page: string) => void;
}

const FolioSearchBar: React.FC<FolioSearchBarProps> = ({ onNavigate }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      freeSolo
      options={searchEntries(inputValue)}
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
        <Box component="li" {...props} key={option.page}>
          <Typography variant="body2">{option.label}</Typography>
        </Box>
      )}
      filterOptions={(x) => x}
      size="small"
      sx={{
        width: { xs: 160, md: 220 },
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
          placeholder="Search sections..."
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
