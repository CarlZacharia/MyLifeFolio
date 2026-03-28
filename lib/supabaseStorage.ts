/**
 * Supabase Storage Utilities
 *
 * Handles file uploads and downloads for estate planning documents.
 *
 * Folder structure:
 * estate-planning-intakes/
 * └── {user_id}/
 *     └── {LastName-FirstName-YYYY-MM-DD}/
 *         ├── existing-estate-plan/
 *         │   └── [uploaded client documents]
 *         └── new-plan-reports/
 *             └── [generated analysis reports]
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'estate-planning-intakes';

// Subfolder names
export const FOLDERS = {
  EXISTING_ESTATE_PLAN: 'existing-estate-plan',
  NEW_PLAN_REPORTS: 'new-plan-reports',
  LEGACY_OBITUARY: 'legacy/obituary',
  LEGACY_LETTERS: 'legacy/letters',
  LEGACY_MEMORIES: 'legacy/memories',
} as const;

export type FolderType = typeof FOLDERS[keyof typeof FOLDERS];

// Person types for document organization
export type PersonType = 'client' | 'spouse';

// Document types that can be uploaded
export type DocumentType = 'will' | 'trust' | 'irrevocableTrust' | 'financialPOA' | 'healthCarePOA' | 'livingWill';

export interface UploadedDocumentMetadata extends FileMetadata {
  personType: PersonType;
  documentType: DocumentType;
  originalName: string;
}

export interface FileMetadata {
  name: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface ReportMetadata {
  name: string;
  path: string;
  format: 'txt' | 'docx';
  generatedAt: string;
}

export interface StorageResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

export interface ListFilesResult {
  success: boolean;
  files?: FileMetadata[];
  error?: string;
}

// ============================================================================
// FOLDER NAME GENERATION
// ============================================================================

/**
 * Generate a folder name from client data
 * Format: LastName-FirstName-YYYY-MM-DD
 */
export function generateClientFolderName(
  clientName: string,
  createdAt?: string | Date
): string {
  // Parse the client name (expecting "First Last" or "First Middle Last")
  const nameParts = clientName.trim().split(/\s+/);

  let lastName = 'Unknown';
  let firstName = 'Client';

  if (nameParts.length >= 2) {
    lastName = nameParts[nameParts.length - 1];
    firstName = nameParts[0];
  } else if (nameParts.length === 1) {
    firstName = nameParts[0];
  }

  // Clean names - remove special characters, keep alphanumeric and hyphens
  const cleanName = (name: string) =>
    name.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 30);

  // Get date
  const date = createdAt ? new Date(createdAt) : new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  return `${cleanName(lastName)}-${cleanName(firstName)}-${dateStr}`;
}

/**
 * Get the full storage path for a client folder
 */
export async function getClientStoragePath(
  clientFolderName: string,
  subfolder?: FolderType
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let path = `${user.id}/${clientFolderName}`;
  if (subfolder) {
    path += `/${subfolder}`;
  }
  return path;
}

// ============================================================================
// FILE UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload a file to the client's folder
 */
export async function uploadFile(
  file: File,
  clientFolderName: string,
  subfolder: FolderType
): Promise<StorageResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${timestamp}-${cleanFileName}`;

    const filePath = `${user.id}/${clientFolderName}/${subfolder}/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err) {
    console.error('Error in uploadFile:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Upload multiple files to the client's existing estate plan folder
 */
export async function uploadExistingEstatePlanFiles(
  files: File[],
  clientFolderName: string
): Promise<{ success: boolean; uploaded: FileMetadata[]; errors: string[] }> {
  const uploaded: FileMetadata[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadFile(file, clientFolderName, FOLDERS.EXISTING_ESTATE_PLAN);

    if (result.success && result.path) {
      uploaded.push({
        name: file.name,
        path: result.path,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    } else {
      errors.push(`${file.name}: ${result.error || 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    uploaded,
    errors,
  };
}

/**
 * Upload a single estate plan document with person and document type organization
 * Path structure: {user_id}/{clientFolderName}/existing-estate-plan/{personType}/{documentType}/{filename}
 */
export async function uploadEstatePlanDocument(
  file: File,
  clientFolderName: string,
  personType: PersonType,
  documentType: DocumentType
): Promise<{ success: boolean; metadata?: UploadedDocumentMetadata; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${timestamp}-${cleanFileName}`;

    // Organize by person type and document type
    const filePath = `${user.id}/${clientFolderName}/${FOLDERS.EXISTING_ESTATE_PLAN}/${personType}/${documentType}/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading estate plan document:', error);
      return { success: false, error: error.message };
    }

    const metadata: UploadedDocumentMetadata = {
      name: uniqueName,
      originalName: file.name,
      path: data.path,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      personType,
      documentType,
    };

    return { success: true, metadata };
  } catch (err) {
    console.error('Error in uploadEstatePlanDocument:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Upload multiple estate plan documents for a specific person and document type
 */
export async function uploadEstatePlanDocuments(
  files: File[],
  clientFolderName: string,
  personType: PersonType,
  documentType: DocumentType
): Promise<{ success: boolean; uploaded: UploadedDocumentMetadata[]; errors: string[] }> {
  const uploaded: UploadedDocumentMetadata[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadEstatePlanDocument(file, clientFolderName, personType, documentType);

    if (result.success && result.metadata) {
      uploaded.push(result.metadata);
    } else {
      errors.push(`${file.name}: ${result.error || 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    uploaded,
    errors,
  };
}

/**
 * Delete an uploaded estate plan document.
 * Routes through edge function to bypass storage.objects RLS.
 */
export async function deleteEstatePlanDocument(filePath: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return false;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(
      `${supabaseUrl}/functions/v1/vault-delete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath, bucket: BUCKET_NAME }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      console.error('Error deleting estate plan document:', errorData);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteEstatePlanDocument:', err);
    return false;
  }
}

// ============================================================================
// REPORT GENERATION AND UPLOAD
// ============================================================================

/**
 * Upload the Claude analysis as a text file
 */
export async function uploadAnalysisAsText(
  analysis: string,
  clientFolderName: string,
  clientName: string
): Promise<StorageResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const date = new Date().toISOString().split('T')[0];
    const fileName = `Estate-Planning-Analysis-${clientName.replace(/\s+/g, '-')}-${date}.txt`;
    const filePath = `${user.id}/${clientFolderName}/${FOLDERS.NEW_PLAN_REPORTS}/${fileName}`;

    // Create a Blob from the text
    const blob = new Blob([analysis], { type: 'text/plain' });

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: true, // Allow overwriting if regenerated
      });

    if (error) {
      console.error('Error uploading text analysis:', error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err) {
    console.error('Error in uploadAnalysisAsText:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Upload the Claude analysis as a Word document (.docx)
 * Note: This requires generating a DOCX file - we'll use a simple approach
 * For production, consider using docx library for richer formatting
 */
export async function uploadAnalysisAsDocx(
  analysis: string,
  clientFolderName: string,
  clientName: string
): Promise<StorageResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // For now, we'll create a simple DOCX using XML
    // In production, use a library like 'docx' for proper Word documents
    const docxContent = createSimpleDocx(analysis, clientName);

    const date = new Date().toISOString().split('T')[0];
    const fileName = `Estate-Planning-Analysis-${clientName.replace(/\s+/g, '-')}-${date}.docx`;
    const filePath = `${user.id}/${clientFolderName}/${FOLDERS.NEW_PLAN_REPORTS}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, docxContent, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading DOCX analysis:', error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err) {
    console.error('Error in uploadAnalysisAsDocx:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Save the analysis in both text and Word format
 */
export async function saveAnalysisReports(
  analysis: string,
  clientFolderName: string,
  clientName: string
): Promise<{ success: boolean; reports: ReportMetadata[]; errors: string[] }> {
  const reports: ReportMetadata[] = [];
  const errors: string[] = [];
  const now = new Date().toISOString();

  // Upload as text
  const txtResult = await uploadAnalysisAsText(analysis, clientFolderName, clientName);
  if (txtResult.success && txtResult.path) {
    reports.push({
      name: txtResult.path.split('/').pop() || 'analysis.txt',
      path: txtResult.path,
      format: 'txt',
      generatedAt: now,
    });
  } else {
    errors.push(`Text file: ${txtResult.error || 'Unknown error'}`);
  }

  // Upload as DOCX
  const docxResult = await uploadAnalysisAsDocx(analysis, clientFolderName, clientName);
  if (docxResult.success && docxResult.path) {
    reports.push({
      name: docxResult.path.split('/').pop() || 'analysis.docx',
      path: docxResult.path,
      format: 'docx',
      generatedAt: now,
    });
  } else {
    errors.push(`Word file: ${docxResult.error || 'Unknown error'}`);
  }

  return {
    success: reports.length > 0,
    reports,
    errors,
  };
}

// ============================================================================
// OBITUARY PDF UPLOAD
// ============================================================================

/**
 * Upload a generated obituary PDF to Supabase Storage.
 * Stores under: {user_id}/{clientFolderName}/legacy/obituary/{filename}.pdf
 */
export async function uploadObituaryPdf(
  pdfBlob: Blob,
  clientFolderName: string,
  personName: string
): Promise<StorageResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const date = new Date().toISOString().split('T')[0];
    const cleanName = personName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'obituary';
    const fileName = `${cleanName}_obituary_${date}.pdf`;
    const filePath = `${user.id}/${clientFolderName}/${FOLDERS.LEGACY_OBITUARY}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading obituary PDF:', error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err) {
    console.error('Error in uploadObituaryPdf:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ============================================================================
// MEMORY VAULT FILE UPLOADS
// ============================================================================

const MEMORY_ACCEPTED_TYPES = [
  'application/pdf',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

const MEMORY_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Upload a file to the Memory Vault folder.
 * Validates file type and size before uploading.
 */
export async function uploadMemoryFile(
  file: File,
  clientFolderName: string
): Promise<{ success: boolean; metadata?: FileMetadata; error?: string }> {
  if (!MEMORY_ACCEPTED_TYPES.includes(file.type)) {
    return { success: false, error: `File type "${file.type}" is not allowed. Accepted: PDF, GIF, JPEG, PNG, WEBP, BMP, TIFF.` };
  }
  if (file.size > MEMORY_MAX_FILE_SIZE) {
    return { success: false, error: `File "${file.name}" exceeds the 10 MB limit.` };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${timestamp}-${cleanFileName}`;
    const filePath = `${user.id}/${clientFolderName}/${FOLDERS.LEGACY_MEMORIES}/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Error uploading memory file:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      metadata: {
        name: file.name,
        path: data.path,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error('Error in uploadMemoryFile:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete a Memory Vault file from storage.
 */
export async function deleteMemoryFile(filePath: string): Promise<boolean> {
  return deleteFile(filePath);
}

// ============================================================================
// FILE RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * List files in a client's folder
 */
export async function listFiles(
  clientFolderName: string,
  subfolder?: FolderType
): Promise<ListFilesResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    let path = `${user.id}/${clientFolderName}`;
    if (subfolder) {
      path += `/${subfolder}`;
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path);

    if (error) {
      console.error('Error listing files:', error);
      return { success: false, error: error.message };
    }

    const files: FileMetadata[] = (data || [])
      .filter(item => item.name !== '.emptyFolderPlaceholder')
      .map(item => ({
        name: item.name,
        path: `${path}/${item.name}`,
        type: item.metadata?.mimetype || 'unknown',
        size: item.metadata?.size || 0,
        uploadedAt: item.created_at || new Date().toISOString(),
      }));

    return { success: true, files };
  } catch (err) {
    console.error('Error in listFiles:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get a signed URL for downloading a file
 */
export async function getDownloadUrl(filePath: string): Promise<StorageResult> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (err) {
    console.error('Error in getDownloadUrl:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Download a file directly
 */
export async function downloadFile(filePath: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in downloadFile:', err);
    return null;
  }
}

/**
 * Delete a file.
 * Routes through edge function to bypass storage.objects RLS.
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return false;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(
      `${supabaseUrl}/functions/v1/vault-delete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath, bucket: BUCKET_NAME }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      console.error('Error deleting file:', errorData);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteFile:', err);
    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a simple DOCX file from text content
 * This creates a basic Word document - for production, use 'docx' library
 */
function createSimpleDocx(content: string, title: string): Blob {
  // Convert markdown-style content to simple paragraphs
  const paragraphs = content.split('\n').map(line => {
    // Escape XML special characters
    const escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    // Check if it's a heading (starts with #)
    if (line.startsWith('###')) {
      return `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr><w:r><w:t>${escaped.replace(/^###\s*/, '')}</w:t></w:r></w:p>`;
    } else if (line.startsWith('##')) {
      return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>${escaped.replace(/^##\s*/, '')}</w:t></w:r></w:p>`;
    } else if (line.startsWith('#')) {
      return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${escaped.replace(/^#\s*/, '')}</w:t></w:r></w:p>`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>${escaped.replace(/^[-*]\s*/, '')}</w:t></w:r></w:p>`;
    } else if (line.trim() === '') {
      return `<w:p/>`;
    } else {
      return `<w:p><w:r><w:t>${escaped}</w:t></w:r></w:p>`;
    }
  }).join('');

  // Minimal DOCX structure (document.xml content)
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:t>Estate Planning Analysis: ${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Generated: ${new Date().toLocaleDateString()}</w:t></w:r>
    </w:p>
    <w:p/>
    ${paragraphs}
  </w:body>
</w:document>`;

  // For a proper DOCX, we need to create a ZIP file with the correct structure
  // This simplified version just creates the XML - in production, use JSZip + docx library
  // For now, we'll store it as XML that Word can sometimes open

  // Actually, let's create a proper minimal DOCX using JSZip if available
  // For now, return the XML as a blob - this won't be a valid DOCX without proper packaging
  // TODO: Add proper DOCX generation with JSZip library

  return new Blob([documentXml], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

// ============================================================================
// UPDATE INTAKE WITH STORAGE INFO
// ============================================================================

/**
 * Update the intake record with storage folder and file metadata
 */
export async function updateIntakeStorageInfo(
  intakeId: string,
  storageFolder: string,
  uploadedFiles?: FileMetadata[],
  reportFiles?: ReportMetadata[]
): Promise<boolean> {
  try {
    const updateData: Record<string, unknown> = {
      storage_folder: storageFolder,
    };

    if (uploadedFiles !== undefined) {
      updateData.uploaded_files = uploadedFiles;
    }

    if (reportFiles !== undefined) {
      updateData.report_files = reportFiles;
    }

    const { error } = await supabase
      .from('intakes_raw')
      .update(updateData)
      .eq('id', intakeId);

    if (error) {
      console.error('Error updating intake storage info:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateIntakeStorageInfo:', err);
    return false;
  }
}

/**
 * Update the intake record with Claude analysis
 */
export async function updateIntakeAnalysis(
  intakeId: string,
  analysis: string,
  tokens?: { input_tokens: number; output_tokens: number }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('intakes_raw')
      .update({
        claude_analysis: analysis,
        claude_analysis_tokens: tokens || null,
        analysis_generated_at: new Date().toISOString(),
      })
      .eq('id', intakeId);

    if (error) {
      console.error('Error updating intake analysis:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateIntakeAnalysis:', err);
    return false;
  }
}
