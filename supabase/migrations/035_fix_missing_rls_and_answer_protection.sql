-- Fix missing RLS policies and restrict quiz correct-answer exposure.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1.  cohorts  (RLS was enabled in 001 but no policies were ever created)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can view cohorts" ON public.cohorts;
DROP POLICY IF EXISTS "Staff can manage cohorts" ON public.cohorts;

-- All authenticated users may read cohorts (they need it for their profile info)
CREATE POLICY "Authenticated users can view cohorts"
  ON public.cohorts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admin/faculty/mentor may insert/update/delete cohorts
CREATE POLICY "Staff can insert cohorts"
  ON public.cohorts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

CREATE POLICY "Staff can update cohorts"
  ON public.cohorts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

CREATE POLICY "Staff can delete cohorts"
  ON public.cohorts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.  certificates  (RLS was enabled in 001 but no policies were ever created)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own certificate" ON public.certificates;
DROP POLICY IF EXISTS "Staff can view all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Staff can manage certificates" ON public.certificates;

-- Learners see only their own certificate
CREATE POLICY "Users can view own certificate"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Staff can view all certificates
CREATE POLICY "Staff can view all certificates"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

-- Only admin/faculty may issue or revoke certificates
CREATE POLICY "Staff can insert certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty')
    )
  );

CREATE POLICY "Staff can delete certificates"
  ON public.certificates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3.  final_exam_submissions  (RLS was enabled in 001 but no policies)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own submissions" ON public.final_exam_submissions;
DROP POLICY IF EXISTS "Users can submit final exam" ON public.final_exam_submissions;
DROP POLICY IF EXISTS "Staff can view all submissions" ON public.final_exam_submissions;
DROP POLICY IF EXISTS "Staff can grade submissions" ON public.final_exam_submissions;

-- Learners can view and submit their own final exam
CREATE POLICY "Users can view own final exam submission"
  ON public.final_exam_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit final exam"
  ON public.final_exam_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff can view all submissions
CREATE POLICY "Staff can view all final exam submissions"
  ON public.final_exam_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

-- Staff can update (grade) submissions
CREATE POLICY "Staff can grade final exam submissions"
  ON public.final_exam_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.  quiz_questions  — tighten SELECT to hide correct_answer_index from clients
--     The correct answer is checked server-side in /api/quiz/submit-answer.
--     Learners only need question_text + options; we use a security-definer view.
-- ─────────────────────────────────────────────────────────────────────────────

-- Create a learner-safe view that strips the answer column
CREATE OR REPLACE VIEW public.quiz_questions_safe AS
  SELECT id, quiz_id, question_text, options, sort_order, created_at, updated_at
  FROM public.quiz_questions;

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.quiz_questions_safe TO authenticated;

-- Restrict the base table: only staff may select correct_answer_index
DROP POLICY IF EXISTS "Authenticated users can view quiz questions" ON public.quiz_questions;

-- Learners see questions without correct_answer_index (they use the view above)
-- Staff/admin need full column access for the management UI
CREATE POLICY "Staff can view all quiz question columns"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

-- Server-side route (/api/quiz/submit-answer) uses the service-role key,
-- which bypasses RLS. Learners query via quiz_questions_safe view.

-- ─────────────────────────────────────────────────────────────────────────────
-- 5.  profiles — add WITH CHECK to the initial UPDATE policy (prevents id swap)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
