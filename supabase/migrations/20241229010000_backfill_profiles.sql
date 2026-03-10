-- One-time backfill: Insert existing auth.users into profiles table
-- Run this AFTER the create_profiles_table migration

INSERT INTO public.profiles (
  id,
  email,
  name,
  address,
  state_of_domicile,
  telephone,
  agreed_to_terms,
  agreed_to_terms_at,
  agreed_to_terms_signature,
  is_admin,
  created_at
)
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'name',
  u.raw_user_meta_data->>'address',
  u.raw_user_meta_data->>'state_of_domicile',
  u.raw_user_meta_data->>'telephone',
  COALESCE((u.raw_user_meta_data->>'agreed_to_terms')::boolean, FALSE),
  CASE
    WHEN u.raw_user_meta_data->>'agreed_to_terms_at' IS NOT NULL
    THEN (u.raw_user_meta_data->>'agreed_to_terms_at')::timestamptz
    ELSE NULL
  END,
  u.raw_user_meta_data->>'agreed_to_terms_signature',
  -- Auto-set is_admin for @zacbrownlaw.com emails
  CASE
    WHEN u.email LIKE '%@zacbrownlaw.com' THEN TRUE
    ELSE FALSE
  END,
  COALESCE(u.created_at, NOW())
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Report how many users were backfilled
DO $$
DECLARE
  backfilled_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO backfilled_count FROM public.profiles;
  RAISE NOTICE 'Backfilled % profiles from auth.users', backfilled_count;
END $$;
