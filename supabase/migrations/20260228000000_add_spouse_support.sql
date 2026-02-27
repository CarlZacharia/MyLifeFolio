-- ============================================================
-- Add spouse/household support
-- Phase 1: Owner enters data for both spouses
-- ============================================================

-- Allow account owner to store their spouse's name
ALTER TABLE profiles ADD COLUMN spouse_name TEXT;

-- Tag each folio item as belonging to self, spouse, or joint
ALTER TABLE folio_items
  ADD COLUMN belongs_to TEXT NOT NULL DEFAULT 'self'
  CHECK (belongs_to IN ('self', 'spouse', 'joint'));

-- Index for efficient filtering by belongs_to within a category
CREATE INDEX idx_folio_items_belongs_to ON folio_items(category_id, belongs_to);
