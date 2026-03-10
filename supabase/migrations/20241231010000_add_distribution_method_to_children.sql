-- Migration: Add distribution_method column to folio_children table
-- This column tracks what type of distribution the client foresees for each child/beneficiary
-- Options: 'Outright', 'Trust for Term of Years', 'Trust for Life', 'Unsure', or empty string

-- Add the distribution_method column to folio_children
ALTER TABLE folio_children
ADD COLUMN IF NOT EXISTS distribution_method TEXT DEFAULT '';

-- Add a comment explaining the column
COMMENT ON COLUMN folio_children.distribution_method IS
  'Type of distribution for this beneficiary: Outright, Trust for Term of Years, Trust for Life, Unsure, or empty';

-- Also add the same column to folio_beneficiaries for consistency
-- (other beneficiaries may also need this field in the future)
ALTER TABLE folio_beneficiaries
ADD COLUMN IF NOT EXISTS distribution_method TEXT DEFAULT '';

COMMENT ON COLUMN folio_beneficiaries.distribution_method IS
  'Type of distribution for this beneficiary: Outright, Trust for Term of Years, Trust for Life, Unsure, or empty';
