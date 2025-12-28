-- Migration: Create offices and attorneys tables
-- These store firm office locations and attorney information

-- ============================================================================
-- OFFICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  telephone TEXT,
  fax TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offices_name ON offices(name);
CREATE INDEX idx_offices_is_active ON offices(is_active);

CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON offices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ATTORNEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attorneys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  primary_office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
  clio_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attorneys_name ON attorneys(name);
CREATE INDEX idx_attorneys_email ON attorneys(email);
CREATE INDEX idx_attorneys_primary_office ON attorneys(primary_office_id);
CREATE INDEX idx_attorneys_is_active ON attorneys(is_active);

CREATE TRIGGER update_attorneys_updated_at
  BEFORE UPDATE ON attorneys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADD OFFICE AND ATTORNEY REFERENCES TO INTAKES_RAW
-- ============================================================================
ALTER TABLE intakes_raw
ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS attorney_id UUID REFERENCES attorneys(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_intakes_raw_office ON intakes_raw(office_id);
CREATE INDEX IF NOT EXISTS idx_intakes_raw_attorney ON intakes_raw(attorney_id);

-- ============================================================================
-- RLS POLICIES FOR OFFICES (read-only for authenticated users)
-- ============================================================================
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active offices
CREATE POLICY "Authenticated users can view active offices"
  ON offices FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- ============================================================================
-- RLS POLICIES FOR ATTORNEYS (read-only for authenticated users)
-- ============================================================================
ALTER TABLE attorneys ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active attorneys
CREATE POLICY "Authenticated users can view active attorneys"
  ON attorneys FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE offices IS 'Law firm office locations';
COMMENT ON TABLE attorneys IS 'Attorneys at the firm';
COMMENT ON COLUMN attorneys.clio_id IS 'Integration ID for Clio practice management software';
COMMENT ON COLUMN intakes_raw.office_id IS 'The office handling this intake';
COMMENT ON COLUMN intakes_raw.attorney_id IS 'The attorney assigned to this intake';
