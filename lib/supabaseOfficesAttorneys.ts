/**
 * Supabase utilities for offices and attorneys
 */

import { supabase } from './supabase';
import { OfficeInfo, AttorneyInfo } from './FormContext';

// ============================================================================
// OFFICES
// ============================================================================

export interface Office {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  telephone: string | null;
  fax: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active offices
 */
export async function getActiveOffices(): Promise<{ success: boolean; offices: OfficeInfo[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching offices:', error);
      return { success: false, offices: [], error: error.message };
    }

    const offices: OfficeInfo[] = (data || []).map((office: Office) => ({
      id: office.id,
      name: office.name,
      address: office.address || undefined,
      city: office.city || undefined,
      state: office.state || undefined,
      zip: office.zip || undefined,
      telephone: office.telephone || undefined,
      fax: office.fax || undefined,
    }));

    return { success: true, offices };
  } catch (err) {
    console.error('Error in getActiveOffices:', err);
    return {
      success: false,
      offices: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get a single office by ID
 */
export async function getOfficeById(id: string): Promise<{ success: boolean; office?: OfficeInfo; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching office:', error);
      return { success: false, error: error.message };
    }

    const office: OfficeInfo = {
      id: data.id,
      name: data.name,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zip: data.zip || undefined,
      telephone: data.telephone || undefined,
      fax: data.fax || undefined,
    };

    return { success: true, office };
  } catch (err) {
    console.error('Error in getOfficeById:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ============================================================================
// ATTORNEYS
// ============================================================================

export interface Attorney {
  id: string;
  name: string;
  email: string;
  primary_office_id: string | null;
  clio_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active attorneys
 */
export async function getActiveAttorneys(): Promise<{ success: boolean; attorneys: AttorneyInfo[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('attorneys')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching attorneys:', error);
      return { success: false, attorneys: [], error: error.message };
    }

    const attorneys: AttorneyInfo[] = (data || []).map((attorney: Attorney) => ({
      id: attorney.id,
      name: attorney.name,
      email: attorney.email,
      primaryOfficeId: attorney.primary_office_id || undefined,
      clioId: attorney.clio_id || undefined,
    }));

    return { success: true, attorneys };
  } catch (err) {
    console.error('Error in getActiveAttorneys:', err);
    return {
      success: false,
      attorneys: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Fetch active attorneys filtered by office
 */
export async function getAttorneysByOffice(officeId: string): Promise<{ success: boolean; attorneys: AttorneyInfo[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('attorneys')
      .select('*')
      .eq('is_active', true)
      .eq('primary_office_id', officeId)
      .order('name');

    if (error) {
      console.error('Error fetching attorneys by office:', error);
      return { success: false, attorneys: [], error: error.message };
    }

    const attorneys: AttorneyInfo[] = (data || []).map((attorney: Attorney) => ({
      id: attorney.id,
      name: attorney.name,
      email: attorney.email,
      primaryOfficeId: attorney.primary_office_id || undefined,
      clioId: attorney.clio_id || undefined,
    }));

    return { success: true, attorneys };
  } catch (err) {
    console.error('Error in getAttorneysByOffice:', err);
    return {
      success: false,
      attorneys: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get a single attorney by ID
 */
export async function getAttorneyById(id: string): Promise<{ success: boolean; attorney?: AttorneyInfo; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('attorneys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching attorney:', error);
      return { success: false, error: error.message };
    }

    const attorney: AttorneyInfo = {
      id: data.id,
      name: data.name,
      email: data.email,
      primaryOfficeId: data.primary_office_id || undefined,
      clioId: data.clio_id || undefined,
    };

    return { success: true, attorney };
  } catch (err) {
    console.error('Error in getAttorneyById:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
