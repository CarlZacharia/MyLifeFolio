-- Grant authenticated role access to saved_report_configs
-- (was missing from the original table creation migration)
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_report_configs TO authenticated;
