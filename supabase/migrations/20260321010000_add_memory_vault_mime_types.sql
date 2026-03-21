-- Add BMP and TIFF to allowed mime types for the estate-planning-intakes bucket
-- (needed for Memory Vault file uploads)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff'
]
WHERE id = 'estate-planning-intakes';
