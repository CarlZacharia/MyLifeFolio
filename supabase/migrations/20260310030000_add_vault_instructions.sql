-- Add vault_instructions column to folio_authorized_users
-- Allows the owner to leave a note for each family member about how to access
-- the credential vault (e.g., "Recovery key is in the safe deposit box at First National Bank")
ALTER TABLE public.folio_authorized_users
  ADD COLUMN IF NOT EXISTS vault_instructions TEXT DEFAULT '';
