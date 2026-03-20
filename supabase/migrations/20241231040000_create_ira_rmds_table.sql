-- Create IRA Required Minimum Distributions table
-- Based on IRS Uniform Lifetime Table for 2024

CREATE TABLE IF NOT EXISTS ira_rmds (
  id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL UNIQUE,
  distribution_period DECIMAL(4,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE ira_rmds IS 'IRS Uniform Lifetime Table for calculating Required Minimum Distributions from IRAs';
COMMENT ON COLUMN ira_rmds.age IS 'Age of the retiree (73-120)';
COMMENT ON COLUMN ira_rmds.distribution_period IS 'Distribution period in years used as divisor';

-- Enable Row Level Security
ALTER TABLE ira_rmds ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (public data)
DROP POLICY IF EXISTS "Allow public read access to ira_rmds" ON ira_rmds;
CREATE POLICY "Allow public read access to ira_rmds"
  ON ira_rmds
  FOR SELECT
  TO public
  USING (true);

-- Insert the IRS Uniform Lifetime Table data
INSERT INTO ira_rmds (age, distribution_period) VALUES
  (73, 26.5),
  (74, 25.5),
  (75, 24.6),
  (76, 23.7),
  (77, 22.9),
  (78, 22.0),
  (79, 21.1),
  (80, 20.2),
  (81, 19.4),
  (82, 18.5),
  (83, 17.7),
  (84, 16.8),
  (85, 16.0),
  (86, 15.2),
  (87, 14.4),
  (88, 13.7),
  (89, 12.9),
  (90, 12.2),
  (91, 11.5),
  (92, 10.8),
  (93, 10.1),
  (94, 9.5),
  (95, 8.9),
  (96, 8.4),
  (97, 7.8),
  (98, 7.3),
  (99, 6.8),
  (100, 6.4),
  (101, 6.0),
  (102, 5.6),
  (103, 5.2),
  (104, 4.9),
  (105, 4.6),
  (106, 4.3),
  (107, 4.1),
  (108, 3.9),
  (109, 3.7),
  (110, 3.5),
  (111, 3.4),
  (112, 3.3),
  (113, 3.1),
  (114, 3.0),
  (115, 2.9),
  (116, 2.8),
  (117, 2.7),
  (118, 2.5),
  (119, 2.3),
  (120, 2.0)
ON CONFLICT (age) DO UPDATE SET distribution_period = EXCLUDED.distribution_period;

-- Create index for faster lookups by age
CREATE INDEX IF NOT EXISTS idx_ira_rmds_age ON ira_rmds(age);
