-- ============================================================
-- LEGACY VIDEOS STORAGE BUCKET
-- ============================================================
-- Create a storage bucket for recorded legacy videos.
-- Run this in the Supabase SQL Editor or via CLI migration.

INSERT INTO storage.buckets (id, name, public)
VALUES ('legacy-videos', 'legacy-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'legacy-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own videos
CREATE POLICY "Users can read own videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'legacy-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own videos
CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'legacy-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
