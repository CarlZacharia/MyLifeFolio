'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import {
  ALL_CATEGORY_IDS,
  DEFAULT_ENABLED_CATEGORIES,
  FolioCategoryId,
  ACCESS_SECTION_REQUIRES,
  REPORT_REQUIRES,
} from './folioCategoryConfig';

interface EnabledCategoriesContextType {
  enabled: FolioCategoryId[];
  loading: boolean;
  setEnabled: (next: FolioCategoryId[]) => Promise<{ error: string | null }>;
  toggle: (id: FolioCategoryId, on: boolean) => Promise<{ error: string | null }>;
}

const EnabledCategoriesContext = createContext<EnabledCategoriesContextType | undefined>(undefined);

export const useEnabledCategories = () => {
  const ctx = useContext(EnabledCategoriesContext);
  if (!ctx) throw new Error('useEnabledCategories must be used within EnabledCategoriesProvider');
  return ctx;
};

const sanitize = (raw: unknown): FolioCategoryId[] => {
  if (!Array.isArray(raw)) return DEFAULT_ENABLED_CATEGORIES;
  const valid = new Set(ALL_CATEGORY_IDS);
  const filtered = raw.filter((v): v is FolioCategoryId => typeof v === 'string' && valid.has(v as FolioCategoryId));
  return filtered.length > 0 ? filtered : DEFAULT_ENABLED_CATEGORIES;
};

export const EnabledCategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [enabled, setEnabledState] = useState<FolioCategoryId[]>(DEFAULT_ENABLED_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setEnabledState(DEFAULT_ENABLED_CATEGORIES);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('profiles')
      .select('enabled_categories')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn('Failed to load enabled_categories — falling back to default:', error.message);
          setEnabledState(DEFAULT_ENABLED_CATEGORIES);
        } else {
          setEnabledState(sanitize(data?.enabled_categories));
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  const setEnabled = useCallback(async (next: FolioCategoryId[]): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };
    const cleaned = sanitize(next);
    const previous = enabled;
    setEnabledState(cleaned); // optimistic
    const { error } = await supabase
      .from('profiles')
      .update({ enabled_categories: cleaned })
      .eq('id', user.id);
    if (error) {
      setEnabledState(previous); // rollback on failure
      return { error: error.message };
    }

    // Cascade: when a module is turned OFF, retract any access sections /
    // reports tied to it from this owner's existing family-access grants.
    // The family-access portal already filters by the saved allowed_reports
    // list, so this is enough to make the change visible to family members.
    const turnedOff = previous.filter((c) => !cleaned.includes(c));
    if (turnedOff.length > 0) {
      const removedSections = Object.entries(ACCESS_SECTION_REQUIRES)
        .filter(([, modId]) => turnedOff.includes(modId))
        .map(([sectionKey]) => sectionKey);
      const removedReports = Object.entries(REPORT_REQUIRES)
        .filter(([, modIds]) => modIds.some((m) => turnedOff.includes(m)))
        .map(([reportId]) => reportId);

      if (removedSections.length > 0 || removedReports.length > 0) {
        // Pull existing grants, strip in-memory, write back. We avoid a SQL
        // array-difference because Supabase JS doesn't expose it cleanly.
        const { data: grants } = await supabase
          .from('folio_authorized_users')
          .select('id, access_sections, allowed_reports')
          .eq('owner_id', user.id)
          .eq('is_active', true);

        if (grants) {
          for (const g of grants as { id: string; access_sections: string[] | null; allowed_reports: string[] | null }[]) {
            const newSections = (g.access_sections || []).filter((s) => !removedSections.includes(s));
            const newReports = (g.allowed_reports || []).filter((r) => !removedReports.includes(r));
            const sectionsChanged = newSections.length !== (g.access_sections || []).length;
            const reportsChanged = newReports.length !== (g.allowed_reports || []).length;
            if (sectionsChanged || reportsChanged) {
              await supabase
                .from('folio_authorized_users')
                .update({
                  ...(sectionsChanged ? { access_sections: newSections } : {}),
                  ...(reportsChanged ? { allowed_reports: newReports } : {}),
                })
                .eq('id', g.id);
            }
          }
        }
      }
    }

    return { error: null };
  }, [user, enabled]);

  const toggle = useCallback(async (id: FolioCategoryId, on: boolean) => {
    const next = on
      ? Array.from(new Set([...enabled, id]))
      : enabled.filter((x) => x !== id);
    return setEnabled(next as FolioCategoryId[]);
  }, [enabled, setEnabled]);

  return (
    <EnabledCategoriesContext.Provider value={{ enabled, loading, setEnabled, toggle }}>
      {children}
    </EnabledCategoriesContext.Provider>
  );
};
