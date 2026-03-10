-- Add allowed_reports column to folio_authorized_users
-- Stores which report IDs (from REPORTS array) each family member can view.
ALTER TABLE folio_authorized_users
  ADD COLUMN IF NOT EXISTS allowed_reports TEXT[] DEFAULT '{}';
