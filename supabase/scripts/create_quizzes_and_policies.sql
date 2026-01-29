-- =============================================================================
-- QUIZZES: mentor/admin set quizzes and correct answers; learners take once,
-- answers locked after submit (no changing).
-- Run in Supabase Dashboard → SQL Editor.
-- Requires: public.profiles (with role column).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Quizzes (title, description, published; created_by = admin/mentor)
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quiz questions (options = array of choice texts; correct_answer_index = 0-based)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer_index INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT quiz_questions_correct_range CHECK (correct_answer_index >= 0)
);

-- 3. One attempt per learner per quiz
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(quiz_id, user_id)
);

-- 4. One response per question per attempt (no updates after insert)
CREATE TABLE IF NOT EXISTS public.quiz_question_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_question_responses_attempt ON public.quiz_question_responses(attempt_id);

-- 6. Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_question_responses ENABLE ROW LEVEL SECURITY;

-- 7. Role helper (idempotent)
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 8. quizzes policies
DROP POLICY IF EXISTS "Quizzes viewable by all authenticated" ON public.quizzes;
CREATE POLICY "Quizzes viewable by all authenticated"
  ON public.quizzes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin and mentors can insert quizzes" ON public.quizzes;
CREATE POLICY "Admin and mentors can insert quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can update quizzes" ON public.quizzes;
CREATE POLICY "Admin and mentors can update quizzes"
  ON public.quizzes FOR UPDATE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can delete quizzes" ON public.quizzes;
CREATE POLICY "Admin and mentors can delete quizzes"
  ON public.quizzes FOR DELETE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

-- 9. quiz_questions policies
DROP POLICY IF EXISTS "Quiz questions viewable by all authenticated" ON public.quiz_questions;
CREATE POLICY "Quiz questions viewable by all authenticated"
  ON public.quiz_questions FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin and mentors can insert quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin and mentors can insert quiz questions"
  ON public.quiz_questions FOR INSERT
  WITH CHECK (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can update quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin and mentors can update quiz questions"
  ON public.quiz_questions FOR UPDATE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can delete quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin and mentors can delete quiz questions"
  ON public.quiz_questions FOR DELETE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

-- 10. quiz_attempts policies
DROP POLICY IF EXISTS "Users see own attempts" ON public.quiz_attempts;
CREATE POLICY "Users see own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty')
  );

DROP POLICY IF EXISTS "Users can create own attempt" ON public.quiz_attempts;
CREATE POLICY "Users can create own attempt"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own attempt" ON public.quiz_attempts;
CREATE POLICY "Users can update own attempt"
  ON public.quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- 11. quiz_question_responses: INSERT only for own attempt; SELECT own; NO UPDATE
DROP POLICY IF EXISTS "Users see own responses" ON public.quiz_question_responses;
CREATE POLICY "Users see own responses"
  ON public.quiz_question_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = attempt_id AND (a.user_id = auth.uid() OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'))
    )
  );

DROP POLICY IF EXISTS "Users can insert response for own attempt" ON public.quiz_question_responses;
CREATE POLICY "Users can insert response for own attempt"
  ON public.quiz_question_responses FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );

-- No UPDATE policy: answers cannot be changed after submit.

COMMENT ON TABLE public.quizzes IS 'Quizzes created by admin/mentor; learners take once, answers locked';
COMMENT ON TABLE public.quiz_questions IS 'Questions with options and correct_answer_index (0-based)';
COMMENT ON TABLE public.quiz_question_responses IS 'Learner answers; one per question per attempt; no updates';
