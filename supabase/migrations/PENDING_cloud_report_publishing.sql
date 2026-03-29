-- ============================================================
-- CLOUD REPORT PUBLISHING TABLES
-- For MyLifeFolio Electron Desktop → Supabase Cloud
--
-- These tables are ONLY used for report publishing.
-- No plaintext user data ever leaves the device.
-- Only encrypted PDF blobs and access control metadata are stored.
--
-- STATUS: PENDING — Do NOT apply automatically.
-- Review and apply manually when ready to enable cloud publishing.
-- ============================================================

-- Report manifest: tracks which encrypted reports are published
CREATE TABLE IF NOT EXISTS report_manifest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    owner_email TEXT NOT NULL,
    report_type TEXT NOT NULL,
    report_label TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_report_manifest_owner ON report_manifest(owner_id);
CREATE INDEX idx_report_manifest_active ON report_manifest(owner_id, is_active);

ALTER TABLE report_manifest ENABLE ROW LEVEL SECURITY;

-- RLS: owner can manage their own reports (identified by owner_id)
CREATE POLICY "Owner can manage own reports"
    ON report_manifest FOR ALL
    USING (owner_id::text = auth.uid()::text OR
           owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Family access: who can view which report types
CREATE TABLE IF NOT EXISTS family_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    grantee_email TEXT NOT NULL,
    grantee_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_family_access_owner ON family_access(owner_id);
CREATE INDEX idx_family_access_grantee ON family_access(grantee_email);

ALTER TABLE family_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage family access"
    ON family_access FOR ALL
    USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Grantees can view their access"
    ON family_access FOR SELECT
    USING (grantee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Download log: tracks who downloaded what
CREATE TABLE IF NOT EXISTS download_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grantee_email TEXT NOT NULL,
    owner_id UUID NOT NULL,
    report_type TEXT NOT NULL,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX idx_download_log_owner ON download_log(owner_id);
CREATE INDEX idx_download_log_grantee ON download_log(grantee_email);

ALTER TABLE download_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view download log"
    ON download_log FOR SELECT
    USING (owner_id::text = auth.uid()::text);

CREATE POLICY "System can insert download log"
    ON download_log FOR INSERT
    WITH CHECK (TRUE);

-- Storage bucket for encrypted reports
-- Run manually: INSERT INTO storage.buckets (id, name, public) VALUES ('encrypted-reports', 'encrypted-reports', false);
