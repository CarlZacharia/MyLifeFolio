-- Add allowed_custom_reports column to folio_authorized_users
-- Stores which custom report config IDs (from saved_report_configs) each family member can view.
ALTER TABLE folio_authorized_users
  ADD COLUMN IF NOT EXISTS allowed_custom_reports UUID[] DEFAULT '{}';

-- Allow family members to read saved_report_configs that have been shared with them.
-- The owner already has full CRUD via the existing user_id = auth.uid() policies.
-- This policy lets an authorized family member SELECT configs whose IDs appear in
-- their allowed_custom_reports array on folio_authorized_users.
DROP POLICY IF EXISTS "Family members can read shared custom reports" ON saved_report_configs;
CREATE POLICY "Family members can read shared custom reports"
  ON saved_report_configs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM folio_authorized_users fau
      WHERE fau.is_active = true
        AND lower(fau.authorized_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
        AND fau.owner_id = saved_report_configs.user_id
        AND saved_report_configs.id = ANY(fau.allowed_custom_reports)
    )
  );
