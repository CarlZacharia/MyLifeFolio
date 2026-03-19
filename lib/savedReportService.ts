/**
 * CRUD service for saved_report_configs table.
 */

import { supabase } from './supabase';

export interface SavedReportConfig {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  config: { sections: Record<string, string[]> };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function loadSavedReports(): Promise<SavedReportConfig[]> {
  const { data, error } = await supabase
    .from('saved_report_configs')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to load saved reports:', error);
    return [];
  }
  return data ?? [];
}

export async function saveReportConfig(
  name: string,
  description: string,
  sections: Record<string, string[]>,
  existingId?: string,
): Promise<SavedReportConfig | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const payload = {
    user_id: user.id,
    name,
    description: description || null,
    config: { sections },
  };

  if (existingId) {
    const { data, error } = await supabase
      .from('saved_report_configs')
      .update(payload)
      .eq('id', existingId)
      .select()
      .single();
    if (error) {
      console.error('Failed to update report config:', error);
      return null;
    }
    return data;
  }

  const { data, error } = await supabase
    .from('saved_report_configs')
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.error('Failed to save report config:', error);
    return null;
  }
  return data;
}

export async function deleteReportConfig(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_report_configs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete report config:', error);
    return false;
  }
  return true;
}
