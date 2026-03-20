-- Migration: Create intakes_raw table for storing complete form data as JSON
-- This table stores the full form data as JSONB for flexibility and backup purposes

-- Create intake_type enum for different practice areas
DO $$ BEGIN
  CREATE TYPE intake_type AS ENUM (
    'EstatePlanning',
    'Probate',
    'Trust',
    'ElderLaw',
    'Medicaid',
    'RealEstate',
    'BusinessFormation',
    'Other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create the intakes_raw table
CREATE TABLE IF NOT EXISTS intakes_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_type intake_type NOT NULL DEFAULT 'EstatePlanning',
  form_data JSONB NOT NULL,
  client_name TEXT GENERATED ALWAYS AS (form_data->>'name') STORED,
  spouse_name TEXT GENERATED ALWAYS AS (form_data->>'spouseName') STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_intakes_raw_user_id ON intakes_raw(user_id);
CREATE INDEX IF NOT EXISTS idx_intakes_raw_intake_type ON intakes_raw(intake_type);
CREATE INDEX IF NOT EXISTS idx_intakes_raw_created_at ON intakes_raw(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intakes_raw_client_name ON intakes_raw(client_name);

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_intakes_raw_form_data ON intakes_raw USING GIN (form_data);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_intakes_raw_updated_at ON intakes_raw;
CREATE TRIGGER update_intakes_raw_updated_at
  BEFORE UPDATE ON intakes_raw
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intakes_raw ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own intakes
DROP POLICY IF EXISTS "Users can view own intakes_raw" ON intakes_raw;
CREATE POLICY "Users can view own intakes_raw"
  ON intakes_raw
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own intakes
DROP POLICY IF EXISTS "Users can insert own intakes_raw" ON intakes_raw;
CREATE POLICY "Users can insert own intakes_raw"
  ON intakes_raw
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own intakes
DROP POLICY IF EXISTS "Users can update own intakes_raw" ON intakes_raw;
CREATE POLICY "Users can update own intakes_raw"
  ON intakes_raw
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own intakes
DROP POLICY IF EXISTS "Users can delete own intakes_raw" ON intakes_raw;
CREATE POLICY "Users can delete own intakes_raw"
  ON intakes_raw
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE intakes_raw IS 'Stores complete intake form data as JSONB for all practice areas';
COMMENT ON COLUMN intakes_raw.user_id IS 'References the authenticated user who created the intake';
COMMENT ON COLUMN intakes_raw.intake_type IS 'Type of intake (EstatePlanning, Probate, etc.)';
COMMENT ON COLUMN intakes_raw.form_data IS 'Complete form data stored as JSONB';
COMMENT ON COLUMN intakes_raw.client_name IS 'Generated column for easy querying by client name';
COMMENT ON COLUMN intakes_raw.spouse_name IS 'Generated column for easy querying by spouse name';
