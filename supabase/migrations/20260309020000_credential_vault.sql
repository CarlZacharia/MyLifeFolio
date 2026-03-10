-- ============================================================
-- Digital Credentials Vault — Supabase Schema
-- Tables: credential_vault_settings, credential_accounts
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- credential_vault_settings
-- One row per user. Stores PBKDF2 salt and recovery key ciphertext.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credential_vault_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salt TEXT NOT NULL,                        -- PBKDF2 salt (hex), per user
  recovery_key_ciphertext TEXT NOT NULL,     -- encrypted master key (for recovery flow)
  vault_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE credential_vault_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own vault settings" ON credential_vault_settings;
CREATE POLICY "Users can manage own vault settings"
  ON credential_vault_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- credential_accounts
-- Stores individual online account credentials.
-- Sensitive fields are encrypted client-side (AES-GCM).
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credential_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Non-sensitive / plaintext fields
  account_nickname TEXT,
  account_type TEXT,               -- financial, email, social_media, subscription, utility, government, healthcare, crypto, other
  platform_name TEXT NOT NULL,
  account_url TEXT,
  login_email TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT,          -- sms, authenticator_app, hardware_key, email
  phone_on_account TEXT,

  -- Post-death / incapacity instructions (plaintext)
  on_death_action TEXT,            -- memorialize, delete, transfer, download_data_first, other
  on_incapacity_action TEXT,
  special_notes TEXT,

  -- Access controls
  poa_can_access BOOLEAN DEFAULT FALSE,
  executor_can_access BOOLEAN DEFAULT FALSE,

  -- Importance / metadata
  importance_tier TEXT DEFAULT 'moderate',   -- critical, moderate, low
  linked_payment_method TEXT,
  last_verified_at TIMESTAMPTZ,

  -- Encrypted fields (AES-GCM ciphertext stored as base64 JSON: { iv, ciphertext })
  enc_password TEXT,
  enc_pin TEXT,
  enc_security_qa TEXT,            -- JSON array of { question, answer } pairs, encrypted
  enc_backup_codes TEXT,
  enc_authenticator_note TEXT,
  enc_recovery_email TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credential_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own credentials" ON credential_accounts;
CREATE POLICY "Users can manage own credentials"
  ON credential_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_credential_accounts_user_id ON credential_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_credential_accounts_type ON credential_accounts(user_id, account_type);
CREATE INDEX IF NOT EXISTS idx_credential_vault_settings_user_id ON credential_vault_settings(user_id);
