-- Fix RLS policies for profiles table
-- The admin policy was causing issues because it required reading profiles to check is_admin

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Admin users (by email domain) can read all profiles
-- This checks the email from the JWT token directly, avoiding recursive RLS check
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
  );

-- Also need to allow admins to read intakes_raw for the admin dashboard
-- First check if the policy exists before creating
DO $$
BEGIN
  -- Check if policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'intakes_raw'
    AND policyname = 'Admins can read all intakes'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can read all intakes"
      ON public.intakes_raw
      FOR SELECT
      USING (
        (auth.jwt() ->> ''email'') LIKE ''%@zacbrownlaw.com''
      )';
  END IF;
END $$;
