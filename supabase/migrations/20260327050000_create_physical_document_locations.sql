-- ============================================================
-- PHYSICAL DOCUMENT LOCATIONS — tracks where physical copies
-- of important documents are stored (e.g. "in the safe",
-- "at attorney's office", etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS physical_document_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES folio_intakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Classification
  category TEXT NOT NULL,          -- e.g. 'estate-planning', 'insurance'
  sub_item TEXT NOT NULL,          -- e.g. 'Will', 'Life Insurance'
  -- Optional FK to a dynamic source row (real estate or vehicle)
  sub_item_ref_table TEXT,         -- 'folio_real_estate' or 'folio_vehicles'
  sub_item_ref_id UUID,           -- FK to the source row
  -- User data
  location TEXT NOT NULL DEFAULT '',
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_physical_doc_locations_user
  ON physical_document_locations (user_id, intake_id, category);

ALTER TABLE physical_document_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own physical doc locations" ON physical_document_locations;
CREATE POLICY "Users can view own physical doc locations"
  ON physical_document_locations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own physical doc locations" ON physical_document_locations;
CREATE POLICY "Users can insert own physical doc locations"
  ON physical_document_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own physical doc locations" ON physical_document_locations;
CREATE POLICY "Users can update own physical doc locations"
  ON physical_document_locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own physical doc locations" ON physical_document_locations;
CREATE POLICY "Users can delete own physical doc locations"
  ON physical_document_locations FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON physical_document_locations TO authenticated;
