-- Fix vault-documents bucket storage policies
-- Match the pattern from estate-planning-intakes which works correctly
-- Key changes: add TO authenticated, add UPDATE policy, add mime types

-- Update bucket with file size limit and allowed mime types
UPDATE storage.buckets
SET
  file_size_limit = 52428800,  -- 50MB
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ]
WHERE id = 'vault-documents';

-- Recreate INSERT policy with TO authenticated
DROP POLICY IF EXISTS "Users can upload vault documents" ON storage.objects;
CREATE POLICY "Users can upload vault documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Recreate SELECT policy with TO authenticated
DROP POLICY IF EXISTS "Users can view own vault documents" ON storage.objects;
CREATE POLICY "Users can view own vault documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add UPDATE policy (missing previously)
DROP POLICY IF EXISTS "Users can update own vault documents" ON storage.objects;
CREATE POLICY "Users can update own vault documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Recreate DELETE policy with TO authenticated
DROP POLICY IF EXISTS "Users can delete own vault documents" ON storage.objects;
CREATE POLICY "Users can delete own vault documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
