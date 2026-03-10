-- Add state column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- Update the handle_new_user function to include state
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    address,
    city,
    state,
    state_of_domicile,
    zip,
    telephone,
    agreed_to_terms,
    agreed_to_terms_at,
    agreed_to_terms_signature,
    is_admin,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'state_of_domicile',
    NEW.raw_user_meta_data->>'zip',
    NEW.raw_user_meta_data->>'telephone',
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_terms')::boolean, FALSE),
    CASE
      WHEN NEW.raw_user_meta_data->>'agreed_to_terms_at' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'agreed_to_terms_at')::timestamptz
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'agreed_to_terms_signature',
    CASE
      WHEN NEW.email LIKE '%@mylifefolio.com' THEN TRUE
      ELSE FALSE
    END,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
