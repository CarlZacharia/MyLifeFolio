-- Fix vault-documents bucket storage policies
-- Match the pattern from estate-planning-intakes which works correctly
-- Key changes: add UPDATE policy, add mime types, NO "TO authenticated" clause
-- (Supabase storage internally uses roles other than "authenticated" for
-- some operations during file downloads, so TO authenticated blocks them)

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

-- Clean up any previous policies
DROP POLICY IF EXISTS "Users can upload vault documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own vault documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own vault documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own vault documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own vault documents" ON storage.objects;
DROP POLICY IF EXISTS "Vault documents owner access" ON storage.objects;
DROP POLICY IF EXISTS "temp_debug_allow_all" ON storage.objects;

-- INSERT policy
CREATE POLICY "Users can upload vault documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT policy
CREATE POLICY "Users can view own vault documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE policy (required — Supabase storage updates metadata during downloads)
CREATE POLICY "Users can update own vault documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE policy
CREATE POLICY "Users can delete own vault documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vault-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
