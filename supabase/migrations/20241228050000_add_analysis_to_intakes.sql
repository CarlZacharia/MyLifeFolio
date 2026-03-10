-- Migration: Add Claude analysis result and storage paths to intakes_raw table

-- Add columns for Claude analysis
ALTER TABLE intakes_raw
ADD COLUMN IF NOT EXISTS claude_analysis TEXT,
ADD COLUMN IF NOT EXISTS claude_analysis_tokens JSONB,
ADD COLUMN IF NOT EXISTS analysis_generated_at TIMESTAMPTZ;

-- Add column for storage folder path
ALTER TABLE intakes_raw
ADD COLUMN IF NOT EXISTS storage_folder TEXT;

-- Add column for tracking uploaded files
ALTER TABLE intakes_raw
ADD COLUMN IF NOT EXISTS uploaded_files JSONB DEFAULT '[]'::jsonb;

-- Add column for generated report paths
ALTER TABLE intakes_raw
ADD COLUMN IF NOT EXISTS report_files JSONB DEFAULT '[]'::jsonb;

-- Create index on storage_folder for lookups
CREATE INDEX IF NOT EXISTS idx_intakes_raw_storage_folder ON intakes_raw(storage_folder);

-- Add comments
COMMENT ON COLUMN intakes_raw.claude_analysis IS 'The Claude-generated analysis text';
COMMENT ON COLUMN intakes_raw.claude_analysis_tokens IS 'Token usage from Claude API (input_tokens, output_tokens)';
COMMENT ON COLUMN intakes_raw.analysis_generated_at IS 'When the analysis was generated';
COMMENT ON COLUMN intakes_raw.storage_folder IS 'Path to the client folder in storage (e.g., user_id/Smith-John-2024-12-28)';
COMMENT ON COLUMN intakes_raw.uploaded_files IS 'Array of uploaded file metadata [{name, path, type, size, uploadedAt}]';
COMMENT ON COLUMN intakes_raw.report_files IS 'Array of generated report metadata [{name, path, format, generatedAt}]';
