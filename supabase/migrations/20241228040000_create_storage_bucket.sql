-- Migration: Create storage bucket for Estate Planning Intakes
-- This sets up file storage for client documents and generated reports

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'estate-planning-intakes',
  'estate-planning-intakes',
  false,  -- Private bucket, requires authentication
  52428800,  -- 50MB file size limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on the storage.objects table (if not already enabled)
-- Note: This is usually enabled by default in Supabase

-- Policy: Users can upload files to their own folder
-- Folder structure: {user_id}/{client_folder}/...
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'estate-planning-intakes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'estate-planning-intakes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'estate-planning-intakes'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'estate-planning-intakes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'estate-planning-intakes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: COMMENT ON storage.buckets requires supabase_storage_admin role
-- and cannot be run from standard migrations. Skipped intentionally.
