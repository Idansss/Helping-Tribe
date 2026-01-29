-- Create the learning_journals table if it doesn't exist (fix: "Could not find the table 'public.learning_journals' in the schema cache")
-- Run this in Supabase Dashboard → SQL Editor, then click Run.
-- Requires: public.profiles and public.modules must exist (run create_profiles_table.sql and create_modules_table.sql first if needed).

-- 1. Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create learning_journals table
CREATE TABLE IF NOT EXISTS public.learning_journals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  reflection_type TEXT DEFAULT 'module_reflection',
  prompts_answered JSONB,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_learning_journals_updated_at ON public.learning_journals;
CREATE TRIGGER update_learning_journals_updated_at
  BEFORE UPDATE ON public.learning_journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE public.learning_journals ENABLE ROW LEVEL SECURITY;

-- 5. Policies: users can only see and modify their own journal entries
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.learning_journals;
CREATE POLICY "Users can view own journal entries"
  ON public.learning_journals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.learning_journals;
CREATE POLICY "Users can insert own journal entries"
  ON public.learning_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journal entries" ON public.learning_journals;
CREATE POLICY "Users can update own journal entries"
  ON public.learning_journals FOR UPDATE
  USING (auth.uid() = user_id);

-- Done. Refresh the schema cache if needed (Supabase Dashboard → Settings → API → Reload schema cache).
