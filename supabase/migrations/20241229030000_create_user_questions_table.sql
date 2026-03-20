-- Create user_questions table to store questions users want to ask attorneys
-- Users can add, edit, and delete questions from their Profile page

CREATE TABLE IF NOT EXISTS public.user_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the user
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Question content
  question TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Estate Planning',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_questions_user_id ON public.user_questions(user_id);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_user_questions_category ON public.user_questions(category);

-- Enable Row Level Security
ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own questions
DROP POLICY IF EXISTS "Users can read own questions" ON public.user_questions;
CREATE POLICY "Users can read own questions"
  ON public.user_questions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own questions
DROP POLICY IF EXISTS "Users can insert own questions" ON public.user_questions;
CREATE POLICY "Users can insert own questions"
  ON public.user_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own questions
DROP POLICY IF EXISTS "Users can update own questions" ON public.user_questions;
CREATE POLICY "Users can update own questions"
  ON public.user_questions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own questions
DROP POLICY IF EXISTS "Users can delete own questions" ON public.user_questions;
CREATE POLICY "Users can delete own questions"
  ON public.user_questions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admin users can read all questions (for support purposes)
DROP POLICY IF EXISTS "Admins can read all questions" ON public.user_questions;
CREATE POLICY "Admins can read all questions"
  ON public.user_questions
  FOR SELECT
  USING (
    (auth.jwt() ->> 'email') LIKE '%@zacbrownlaw.com'
  );

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS on_user_questions_updated ON public.user_questions;
CREATE TRIGGER on_user_questions_updated
  BEFORE UPDATE ON public.user_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.user_questions TO authenticated;
GRANT SELECT ON public.user_questions TO anon;
