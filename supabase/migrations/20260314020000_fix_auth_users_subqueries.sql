-- Migration: Replace auth.users subqueries with auth.jwt() in RLS policies
--
-- The authenticated role cannot query auth.users directly, causing
-- "permission denied for table users" errors. Replace all
-- (SELECT email FROM auth.users WHERE id = auth.uid())
-- with auth.jwt() ->> 'email' which reads from the JWT token directly.

-- ═══════════════════════════════════════════════════════════════════════
-- 1. folio_authorized_users — authorized users read their own access row
-- ═══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authorized users can read their own access" ON folio_authorized_users;
CREATE POLICY "Authorized users can read their own access"
  ON folio_authorized_users
  FOR SELECT
  USING (
    lower(authorized_email) = lower(auth.jwt() ->> 'email')
    AND is_active = true
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 2. folio_documents — authorized users can read visible documents
-- ═══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authorized users can read visible documents" ON folio_documents;
CREATE POLICY "Authorized users can read visible documents"
  ON folio_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM folio_authorized_users fau
      WHERE fau.id = ANY(folio_documents.visible_to)
        AND fau.is_active = true
        AND lower(fau.authorized_email) = lower(auth.jwt() ->> 'email')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 3. storage.objects — authorized users can read folio-documents files
-- ═══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authorized users can read shared documents" ON storage.objects;
CREATE POLICY "Authorized users can read shared documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'folio-documents'
    AND EXISTS (
      SELECT 1 FROM folio_documents fd
      JOIN folio_authorized_users fau ON fau.id = ANY(fd.visible_to)
      WHERE fd.storage_path = name
        AND fau.is_active = true
        AND lower(fau.authorized_email) = lower(auth.jwt() ->> 'email')
    )
  );
