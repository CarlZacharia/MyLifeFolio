-- Add vault-sharing support to folio_documents
-- Allows owners to share existing vault documents with family members
-- without re-uploading them.

-- storage_bucket: which bucket the file lives in (folio-documents or vault-documents)
ALTER TABLE folio_documents ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'folio-documents';

-- source_vault_document_id: when set, this row is a "shared from vault" reference
-- ON DELETE CASCADE removes the share if the vault doc is deleted
ALTER TABLE folio_documents ADD COLUMN IF NOT EXISTS source_vault_document_id UUID REFERENCES vault_documents(id) ON DELETE CASCADE;

-- Prevent sharing the same vault doc twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_folio_documents_vault_source
  ON folio_documents (source_vault_document_id) WHERE source_vault_document_id IS NOT NULL;
