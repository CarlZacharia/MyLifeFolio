/**
 * Document Vault Storage Utilities
 *
 * Handles file uploads, downloads, and metadata CRUD for the Documents Vault.
 *
 * Storage path: vault-documents/{user_id}/{category}/{timestamp}-{filename}
 * Metadata table: vault_documents
 */

import { supabase } from './supabase';
import { SensitivityLevel } from './documentVaultCategories';

const BUCKET = 'vault-documents';

// ── Types ──────────────────────────────────────────────────────────────────

export interface VaultDocumentRecord {
  id: string;
  intake_id: string;
  user_id: string;
  category: string;
  document_name: string;
  description: string | null;
  document_date: string | null;
  expiration_date: string | null;
  sensitivity: SensitivityLevel;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  system_generated: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UploadVaultDocumentInput {
  intakeId: string;
  category: string;
  documentName: string;
  description?: string;
  documentDate?: string;
  expirationDate?: string;
  sensitivity: SensitivityLevel;
  file: File;
}

// ── Upload ─────────────────────────────────────────────────────────────────

export async function uploadVaultDocument(
  input: UploadVaultDocumentInput
): Promise<{ success: boolean; record?: VaultDocumentRecord; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    // Build unique storage path
    const timestamp = Date.now();
    const cleanName = input.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user.id}/${input.category}/${timestamp}-${cleanName}`;

    // Upload file to storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, input.file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (storageError) {
      console.error('Vault upload error:', storageError);
      return { success: false, error: storageError.message };
    }

    // Insert metadata row
    const { data: row, error: dbError } = await supabase
      .from('vault_documents')
      .insert({
        intake_id: input.intakeId,
        user_id: user.id,
        category: input.category,
        document_name: input.documentName,
        description: input.description || null,
        document_date: input.documentDate || null,
        expiration_date: input.expirationDate || null,
        sensitivity: input.sensitivity,
        file_path: storagePath,
        file_name: input.file.name,
        file_size: input.file.size,
        file_type: input.file.type,
        system_generated: false,
      })
      .select()
      .single();

    if (dbError) {
      // Roll back the file upload on metadata failure
      await supabase.storage.from(BUCKET).remove([storagePath]);
      console.error('Vault metadata insert error:', dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, record: row as VaultDocumentRecord };
  } catch (err) {
    console.error('uploadVaultDocument error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── List ───────────────────────────────────────────────────────────────────

export async function listVaultDocuments(
  intakeId: string,
  category?: string
): Promise<{ success: boolean; documents?: VaultDocumentRecord[]; error?: string }> {
  try {
    let query = supabase
      .from('vault_documents')
      .select('*')
      .eq('intake_id', intakeId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('listVaultDocuments error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, documents: (data || []) as VaultDocumentRecord[] };
  } catch (err) {
    console.error('listVaultDocuments error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Download ───────────────────────────────────────────────────────────────

export async function getVaultDocumentUrl(
  filePath: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Use createSignedUrl which only requires SELECT policy (no INSERT/UPDATE)
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 300); // 5-minute expiry

    if (error) {
      console.error('getVaultDocumentUrl signedUrl error:', error, 'path:', filePath);
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (err) {
    console.error('getVaultDocumentUrl error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteVaultDocument(
  documentId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([filePath]);

    if (storageError) {
      console.error('deleteVaultDocument storage error:', storageError);
      return { success: false, error: storageError.message };
    }

    // Delete metadata row
    const { error: dbError } = await supabase
      .from('vault_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('deleteVaultDocument db error:', dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (err) {
    console.error('deleteVaultDocument error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Count per category ─────────────────────────────────────────────────────

export async function getVaultDocumentCounts(
  intakeId: string
): Promise<{ success: boolean; counts?: Record<string, number>; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('vault_documents')
      .select('category')
      .eq('intake_id', intakeId);

    if (error) {
      console.error('getVaultDocumentCounts error:', error);
      return { success: false, error: error.message };
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.category] = (counts[row.category] || 0) + 1;
    }

    return { success: true, counts };
  } catch (err) {
    console.error('getVaultDocumentCounts error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
