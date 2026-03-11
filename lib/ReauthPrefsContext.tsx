'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ReauthFeature {
  key: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

export const REAUTH_FEATURES: ReauthFeature[] = [
  {
    key: 'financial-life',
    label: 'Financial Life',
    description: 'Bank accounts, investments, debts, and financial assets',
    defaultOn: true,
  },
  {
    key: 'documents-vault',
    label: 'Documents Vault',
    description: 'Uploaded documents and sensitive files',
    defaultOn: true,
  },
  {
    key: 'ssn',
    label: 'Social Security Numbers',
    description: 'Viewing or editing Social Security Number fields',
    defaultOn: true,
  },
  {
    key: 'digital-life',
    label: 'Digital Life',
    description: 'Online accounts, passwords, and digital assets',
    defaultOn: false,
  },
  {
    key: 'legal-documents',
    label: 'Legal Documents',
    description: 'Estate plan, wills, trusts, and legal records',
    defaultOn: false,
  },
  {
    key: 'insurance-coverage',
    label: 'Insurance Coverage',
    description: 'Insurance policies and coverage details',
    defaultOn: false,
  },
  {
    key: 'medical-data',
    label: 'Medical Data',
    description: 'Medical history, conditions, medications, and providers',
    defaultOn: false,
  },
  {
    key: 'care-decisions',
    label: 'Care Decisions',
    description: 'Healthcare directives and care preferences',
    defaultOn: false,
  },
  {
    key: 'end-of-life',
    label: 'End of Life Planning',
    description: 'Burial, funeral arrangements, and final wishes',
    defaultOn: false,
  },
  {
    key: 'people-advisors',
    label: 'People & Advisors',
    description: 'Attorney, financial advisor, and personal contacts',
    defaultOn: false,
  },
];

const STORAGE_KEY = 'mylifefolio_reauth_prefs';

type ReauthPrefs = Record<string, boolean>;

function getDefaultPrefs(): ReauthPrefs {
  return Object.fromEntries(REAUTH_FEATURES.map((f) => [f.key, f.defaultOn]));
}

function loadPrefs(): ReauthPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ReauthPrefs;
      // Merge with defaults so new features are included
      return { ...getDefaultPrefs(), ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return getDefaultPrefs();
}

interface ReauthPrefsContextValue {
  prefs: ReauthPrefs;
  isReauthRequired: (featureKey: string) => boolean;
  setReauthRequired: (featureKey: string, required: boolean) => void;
}

const ReauthPrefsContext = createContext<ReauthPrefsContextValue | null>(null);

export const ReauthPrefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<ReauthPrefs>(getDefaultPrefs);

  // Load from localStorage once on mount
  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const isReauthRequired = useCallback(
    (featureKey: string) => prefs[featureKey] ?? false,
    [prefs],
  );

  const setReauthRequired = useCallback((featureKey: string, required: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [featureKey]: required };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <ReauthPrefsContext.Provider value={{ prefs, isReauthRequired, setReauthRequired }}>
      {children}
    </ReauthPrefsContext.Provider>
  );
};

export function useReauthPrefs(): ReauthPrefsContextValue {
  const ctx = useContext(ReauthPrefsContext);
  if (!ctx) throw new Error('useReauthPrefs must be used within ReauthPrefsProvider');
  return ctx;
}
