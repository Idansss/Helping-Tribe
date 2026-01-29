-- =============================================================================
-- DISCUSSION PROMPTS: create tables if missing, add sort_order, admin/mentor CRUD
-- Run in Supabase Dashboard → SQL Editor.
-- Requires: public.modules, public.profiles (with role). Creates tables if missing.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create discussion_prompts if missing (includes sort_order for new installs)
CREATE TABLE IF NOT EXISTS public.discussion_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 2. Add sort_order to existing table (when table was created by 009 without it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'discussion_prompts' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.discussion_prompts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 3. Create discussion_responses if missing
CREATE TABLE IF NOT EXISTS public.discussion_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_id UUID REFERENCES public.discussion_prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  parent_response_id UUID REFERENCES public.discussion_responses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_module ON public.discussion_prompts(module_id);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_posted ON public.discussion_prompts(posted_at);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_sort_order ON public.discussion_prompts(sort_order);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_prompt ON public.discussion_responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_user ON public.discussion_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_parent ON public.discussion_responses(parent_response_id);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_created ON public.discussion_responses(created_at);

-- 5. Enable RLS
ALTER TABLE public.discussion_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_responses ENABLE ROW LEVEL SECURITY;

-- 6. Prompts: everyone can read
DROP POLICY IF EXISTS "Discussion prompts are viewable by all authenticated users" ON public.discussion_prompts;
CREATE POLICY "Discussion prompts are viewable by all authenticated users"
  ON public.discussion_prompts FOR SELECT
  USING (auth.role() = 'authenticated');

-- 7. Responses: everyone can read, users manage own
DROP POLICY IF EXISTS "Discussion responses are viewable by all authenticated users" ON public.discussion_responses;
CREATE POLICY "Discussion responses are viewable by all authenticated users"
  ON public.discussion_responses FOR SELECT
  USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can create discussion responses" ON public.discussion_responses;
CREATE POLICY "Users can create discussion responses"
  ON public.discussion_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own discussion responses" ON public.discussion_responses;
CREATE POLICY "Users can update own discussion responses"
  ON public.discussion_responses FOR UPDATE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own discussion responses" ON public.discussion_responses;
CREATE POLICY "Users can delete own discussion responses"
  ON public.discussion_responses FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Role helper (idempotent)
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 9. Admin/mentor can create, update, delete prompts
DROP POLICY IF EXISTS "Admin and mentors can create discussion prompts" ON public.discussion_prompts;
CREATE POLICY "Admin and mentors can create discussion prompts"
  ON public.discussion_prompts FOR INSERT
  WITH CHECK (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can update discussion prompts" ON public.discussion_prompts;
CREATE POLICY "Admin and mentors can update discussion prompts"
  ON public.discussion_prompts FOR UPDATE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can delete discussion prompts" ON public.discussion_prompts;
CREATE POLICY "Admin and mentors can delete discussion prompts"
  ON public.discussion_prompts FOR DELETE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

COMMENT ON TABLE public.discussion_prompts IS 'Discussion prompts posted for each module';
COMMENT ON TABLE public.discussion_responses IS 'User responses to discussion prompts with threading support';
COMMENT ON COLUMN public.discussion_prompts.sort_order IS 'Display order (lower first). Managed by Admin/Mentor UI.';
