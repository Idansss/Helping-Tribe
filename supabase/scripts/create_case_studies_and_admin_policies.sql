-- =============================================================================
-- CASE STUDIES TABLES + ADMIN/MENTOR POLICIES (all-in-one)
-- Run in Supabase Dashboard → SQL Editor.
-- Creates case_studies and case_study_responses if missing; RLS so learners
-- can view/respond and admin/mentors can create, edit, delete case studies
-- and view all learner responses.
-- Requires: public.profiles (with role column).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Case Studies table (module_id optional, no FK so script works without modules)
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID DEFAULT NULL,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  questions JSONB NOT NULL,
  learning_objectives TEXT[] DEFAULT NULL,
  difficulty_level TEXT DEFAULT 'intermediate',
  tags TEXT[] DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Case Study Responses table
CREATE TABLE IF NOT EXISTS public.case_study_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_study_id UUID REFERENCES public.case_studies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  reflection TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_study_id, user_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_module ON public.case_studies(module_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_difficulty ON public.case_studies(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_case_studies_tags ON public.case_studies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_case_study_responses_case ON public.case_study_responses(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_responses_user ON public.case_study_responses(user_id);

-- 4. Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_responses ENABLE ROW LEVEL SECURITY;

-- 5. Helper for role check (idempotent)
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 6. case_studies policies
DROP POLICY IF EXISTS "Case studies are viewable by all authenticated users" ON public.case_studies;
CREATE POLICY "Case studies are viewable by all authenticated users"
  ON public.case_studies FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin and mentors can create case studies" ON public.case_studies;
CREATE POLICY "Admin and mentors can create case studies"
  ON public.case_studies FOR INSERT
  WITH CHECK (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can update case studies" ON public.case_studies;
CREATE POLICY "Admin and mentors can update case studies"
  ON public.case_studies FOR UPDATE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can delete case studies" ON public.case_studies;
CREATE POLICY "Admin and mentors can delete case studies"
  ON public.case_studies FOR DELETE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

-- 7. case_study_responses policies
DROP POLICY IF EXISTS "Users can view own case study responses" ON public.case_study_responses;
CREATE POLICY "Users can view own case study responses"
  ON public.case_study_responses FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty')
  );

DROP POLICY IF EXISTS "Users can create own case study responses" ON public.case_study_responses;
CREATE POLICY "Users can create own case study responses"
  ON public.case_study_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own case study responses" ON public.case_study_responses;
CREATE POLICY "Users can update own case study responses"
  ON public.case_study_responses FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.case_studies IS 'Case studies for practice and analysis';
COMMENT ON TABLE public.case_study_responses IS 'Student responses to case studies';
