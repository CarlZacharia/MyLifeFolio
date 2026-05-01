-- ============================================================================
-- ADD enabled_categories TO profiles
-- ============================================================================
-- Lets each owner choose which of the 12 folio category modules appear on
-- their dashboard (and, by extension, which Family Access sections and
-- standard reports are available). New users start with 4 foundational
-- modules; existing users get all 12 to preserve their current view.
--
-- The single source of truth for valid IDs and defaults is
-- lib/folioCategoryConfig.ts. Keep them in sync.
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS enabled_categories TEXT[]
  DEFAULT ARRAY[
    'personal-information',
    'family-dependents',
    'people-advisors',
    'legal-documents'
  ]::TEXT[];

-- Backfill existing rows with all 12 modules so current users see no change.
-- New rows get the 4-module default from the column DEFAULT above.
UPDATE profiles
SET enabled_categories = ARRAY[
  'personal-information',
  'family-dependents',
  'financial-life',
  'people-advisors',
  'insurance-coverage',
  'emergency-care',
  'care-decisions',
  'end-of-life',
  'legacy-life-story',
  'legal-documents',
  'document-uploads',
  'digital-life'
]::TEXT[]
WHERE enabled_categories IS NULL
   OR cardinality(enabled_categories) = 0;
