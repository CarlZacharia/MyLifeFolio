-- ============================================================================
-- ADD LIVING WILL STORAGE + DRAFTING ATTORNEY (consistency follow-up)
-- ============================================================================
-- The prior migration (20260501010000) added storage location and drafting
-- attorney fields for Will, Trust, Irrevocable Trust, Financial POA, and
-- Health Care POA. Living Will was data-only at that point — no UI section.
-- Now that the Living Will / Advance Directive has been added to the form
-- editor, it needs the same storage + attorney columns as the others.
-- ============================================================================

ALTER TABLE folio_current_estate_plan
  ADD COLUMN IF NOT EXISTS living_will_storage_location TEXT,
  ADD COLUMN IF NOT EXISTS living_will_storage_location_other TEXT,
  ADD COLUMN IF NOT EXISTS living_will_storage_notes TEXT,
  ADD COLUMN IF NOT EXISTS living_will_attorney_name TEXT,
  ADD COLUMN IF NOT EXISTS living_will_attorney_firm TEXT,
  ADD COLUMN IF NOT EXISTS living_will_attorney_email TEXT,
  ADD COLUMN IF NOT EXISTS living_will_attorney_phone TEXT,
  ADD COLUMN IF NOT EXISTS living_will_attorney_address TEXT;
