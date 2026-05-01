-- ============================================================================
-- ADD STORAGE LOCATION + DRAFTING ATTORNEY FIELDS FOR ALL ESTATE DOCUMENTS
-- ============================================================================
-- People need to know not just *that* the documents exist, but *where they
-- are* and *who drafted them*. This adds those fields per document on the
-- existing per-document estate plan table.
--
-- Covers: will, trust, irrevocable trust, financial POA, health care POA.
-- (Living will is captured in form state but not currently rendered, so it's
-- omitted here — add when the Living Will UI ships.)
-- ============================================================================

ALTER TABLE folio_current_estate_plan
  -- Will
  ADD COLUMN IF NOT EXISTS will_storage_location TEXT,
  ADD COLUMN IF NOT EXISTS will_storage_location_other TEXT,
  ADD COLUMN IF NOT EXISTS will_storage_notes TEXT,
  ADD COLUMN IF NOT EXISTS will_attorney_name TEXT,
  ADD COLUMN IF NOT EXISTS will_attorney_firm TEXT,
  ADD COLUMN IF NOT EXISTS will_attorney_email TEXT,
  ADD COLUMN IF NOT EXISTS will_attorney_phone TEXT,
  ADD COLUMN IF NOT EXISTS will_attorney_address TEXT,
  -- Revocable Living Trust
  ADD COLUMN IF NOT EXISTS trust_storage_location TEXT,
  ADD COLUMN IF NOT EXISTS trust_storage_location_other TEXT,
  ADD COLUMN IF NOT EXISTS trust_storage_notes TEXT,
  ADD COLUMN IF NOT EXISTS trust_attorney_name TEXT,
  ADD COLUMN IF NOT EXISTS trust_attorney_firm TEXT,
  ADD COLUMN IF NOT EXISTS trust_attorney_email TEXT,
  ADD COLUMN IF NOT EXISTS trust_attorney_phone TEXT,
  ADD COLUMN IF NOT EXISTS trust_attorney_address TEXT,
  -- Irrevocable Trust
  ADD COLUMN IF NOT EXISTS irrevocable_trust_storage_location TEXT,
  ADD COLUMN IF NOT EXISTS irrevocable_trust_storage_location_other TEXT,
  ADD COLUMN IF NOT EXISTS irrevocable_trust_storage_notes TEXT,
  ADD COLUMN IF NOT EXISTS irrevocable_trust_attorney_name TEXT,
  ADD COLUMN IF NOT EXISTS irrevocable_trust_attorney_firm TEXT,
  ADD COLUMN IF NOT EXISTS irrevocable_trust_attorney_email TEXT,
  ADD COLUMN IF NOT EXISTS irrevocable_trust_attorney_phone TEXT,
  ADD COLUMN IF NOT EXISTS irrevocable_trust_attorney_address TEXT,
  -- Financial Power of Attorney
  ADD COLUMN IF NOT EXISTS financial_poa_storage_location TEXT,
  ADD COLUMN IF NOT EXISTS financial_poa_storage_location_other TEXT,
  ADD COLUMN IF NOT EXISTS financial_poa_storage_notes TEXT,
  ADD COLUMN IF NOT EXISTS financial_poa_attorney_name TEXT,
  ADD COLUMN IF NOT EXISTS financial_poa_attorney_firm TEXT,
  ADD COLUMN IF NOT EXISTS financial_poa_attorney_email TEXT,
  ADD COLUMN IF NOT EXISTS financial_poa_attorney_phone TEXT,
  ADD COLUMN IF NOT EXISTS financial_poa_attorney_address TEXT,
  -- Health Care Power of Attorney
  ADD COLUMN IF NOT EXISTS health_care_poa_storage_location TEXT,
  ADD COLUMN IF NOT EXISTS health_care_poa_storage_location_other TEXT,
  ADD COLUMN IF NOT EXISTS health_care_poa_storage_notes TEXT,
  ADD COLUMN IF NOT EXISTS health_care_poa_attorney_name TEXT,
  ADD COLUMN IF NOT EXISTS health_care_poa_attorney_firm TEXT,
  ADD COLUMN IF NOT EXISTS health_care_poa_attorney_email TEXT,
  ADD COLUMN IF NOT EXISTS health_care_poa_attorney_phone TEXT,
  ADD COLUMN IF NOT EXISTS health_care_poa_attorney_address TEXT;
