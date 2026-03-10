-- Grant table permissions to authenticated and anon roles
-- Required because tables created via SQL Editor may not auto-grant

-- folio_authorized_users
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_authorized_users TO authenticated;
GRANT SELECT ON folio_authorized_users TO anon;

-- folio_access_log
GRANT SELECT, INSERT ON folio_access_log TO authenticated;
GRANT SELECT ON folio_access_log TO anon;

-- folio_documents
GRANT SELECT, INSERT, UPDATE, DELETE ON folio_documents TO authenticated;
GRANT SELECT ON folio_documents TO anon;
