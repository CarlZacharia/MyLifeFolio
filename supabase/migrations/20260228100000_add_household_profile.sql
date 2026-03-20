-- Add household fields to profiles
ALTER TABLE profiles
  ADD COLUMN gender TEXT,
  ADD COLUMN marital_status TEXT NOT NULL DEFAULT 'single'
    CHECK (marital_status IN ('single','married','domestic_partnership','divorced','widowed','separated')),
  ADD COLUMN spouse_full_name TEXT,
  ADD COLUMN spouse_date_of_birth DATE,
  ADD COLUMN spouse_phone TEXT,
  ADD COLUMN spouse_email TEXT,
  ADD COLUMN spouse_gender TEXT;

-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  parent_relationship TEXT NOT NULL DEFAULT 'both'
    CHECK (parent_relationship IN ('both','owner_only','spouse_only')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own children"
  ON children FOR ALL
  USING (auth.uid() = owner_id);

CREATE INDEX idx_children_owner ON children(owner_id);
