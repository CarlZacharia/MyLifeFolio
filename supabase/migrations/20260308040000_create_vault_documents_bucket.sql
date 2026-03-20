-- ============================================================
-- Storage bucket for Documents Vault files (private)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-documents', 'vault-documents', FALSE)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the vault-documents bucket
DROP POLICY IF EXISTS "Users can upload vault documents" ON storage.objects;
CREATE POLICY "Users can upload vault documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vault-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view own vault documents" ON storage.objects;
CREATE POLICY "Users can view own vault documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vault-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own vault documents" ON storage.objects;
CREATE POLICY "Users can delete own vault documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vault-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
