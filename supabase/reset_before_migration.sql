-- ============================================================
-- RESET SCRIPT: Run this BEFORE the migration to clean up
-- any partial previous migration attempt.
-- Run in Supabase SQL Editor.
-- ============================================================

-- Drop the trigger on auth.users first (if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS seed_user_defaults(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_person_access(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS file_attachments CASCADE;
DROP TABLE IF EXISTS item_role_access CASCADE;
DROP TABLE IF EXISTS category_role_access CASCADE;
DROP TABLE IF EXISTS folio_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS person_roles CASCADE;
DROP TABLE IF EXISTS persons CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
