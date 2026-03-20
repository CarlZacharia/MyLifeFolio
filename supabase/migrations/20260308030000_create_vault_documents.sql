-- ============================================================
-- DOCUMENTS VAULT — metadata for uploaded vault documents
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Classification
  category TEXT NOT NULL,
  -- Document info
  document_name TEXT NOT NULL,
  description TEXT,
  document_date TEXT,
  expiration_date TEXT,
  sensitivity TEXT NOT NULL DEFAULT 'normal'
    CHECK (sensitivity IN ('normal', 'restricted', 'highly_sensitive')),
  -- File info
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT '',
  -- Flags
  system_generated BOOLEAN NOT NULL DEFAULT FALSE,
  -- Timestamps
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by user + category
CREATE INDEX IF NOT EXISTS idx_vault_documents_user_category
  ON vault_documents (user_id, category);

ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own vault documents" ON vault_documents;
CREATE POLICY "Users can view own vault documents"
  ON vault_documents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vault documents" ON vault_documents;
CREATE POLICY "Users can insert own vault documents"
  ON vault_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vault documents" ON vault_documents;
CREATE POLICY "Users can update own vault documents"
  ON vault_documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own vault documents" ON vault_documents;
CREATE POLICY "Users can delete own vault documents"
  ON vault_documents FOR DELETE
  USING (auth.uid() = user_id);
