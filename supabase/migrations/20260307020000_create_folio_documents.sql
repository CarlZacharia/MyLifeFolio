-- Folio Documents: allows owners to upload documents and control per-user access
-- Supported types: PDF, images, spreadsheets, CSV, Word documents

-- 0. Allow 'document' as an access_type in the log table
ALTER TABLE folio_access_log DROP CONSTRAINT IF EXISTS folio_access_log_access_type_check;
ALTER TABLE folio_access_log ADD CONSTRAINT folio_access_log_access_type_check
  CHECK (access_type IN ('chat', 'report', 'document'));

-- 1. Documents metadata table
CREATE TABLE IF NOT EXISTS folio_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  description TEXT NOT NULL DEFAULT '',
  visible_to UUID[] NOT NULL DEFAULT '{}',  -- array of folio_authorized_users IDs
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for folio_documents
ALTER TABLE folio_documents ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their own documents
DROP POLICY IF EXISTS "Owner can manage their documents" ON folio_documents;
CREATE POLICY "Owner can manage their documents"
  ON folio_documents
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Authorized users can read documents they are granted access to
DROP POLICY IF EXISTS "Authorized users can read visible documents" ON folio_documents;
CREATE POLICY "Authorized users can read visible documents"
  ON folio_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM folio_authorized_users fau
      WHERE fau.id = ANY(folio_documents.visible_to)
        AND fau.is_active = true
        AND lower(fau.authorized_email) = lower(
          (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_folio_documents_owner ON folio_documents(owner_id);

-- 2. Storage bucket for document files
INSERT INTO storage.buckets (id, name, public)
VALUES ('folio-documents', 'folio-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Owner can upload/manage files in their folder
DROP POLICY IF EXISTS "Owner can upload documents" ON storage.objects;
CREATE POLICY "Owner can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'folio-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owner can update their documents" ON storage.objects;
CREATE POLICY "Owner can update their documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'folio-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owner can delete their documents" ON storage.objects;
CREATE POLICY "Owner can delete their documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'folio-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owner can read their documents" ON storage.objects;
CREATE POLICY "Owner can read their documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'folio-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authorized users can download documents they have access to
DROP POLICY IF EXISTS "Authorized users can download documents" ON storage.objects;
CREATE POLICY "Authorized users can download documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'folio-documents'
    AND EXISTS (
      SELECT 1 FROM folio_documents fd
      JOIN folio_authorized_users fau ON fau.id = ANY(fd.visible_to)
      WHERE fd.storage_path = name
        AND fau.is_active = true
        AND lower(fau.authorized_email) = lower(
          (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
  );
