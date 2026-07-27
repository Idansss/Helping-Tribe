-- Repair legacy environments where the daily activity gate was deployed
-- without its progress tables. The previous RPC also referenced the obsolete
-- `module_progress.completed` column instead of `is_completed`.
--
-- Some production DBs were never given `public.lessons` from 001_initial_schema.
-- Create it first so user_progress FK + get_activity_gate_status can succeed.

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  content_html TEXT,
  video_url TEXT,
  audio_url TEXT,
  worksheet_template JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (module_id, lesson_number)
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lessons'
      AND policyname = 'Lessons are viewable by all authenticated users'
  ) THEN
    CREATE POLICY "Lessons are viewable by all authenticated users"
      ON public.lessons
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  worksheet_submission JSONB,
  worksheet_submission_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_lesson_key
  ON public.user_progress(user_id, lesson_id);

CREATE TABLE IF NOT EXISTS public.module_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER,
  quiz_passed BOOLEAN DEFAULT FALSE,
  quiz_completed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS quiz_score INTEGER;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMPTZ;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.module_progress
SET completed = COALESCE(is_completed, FALSE),
    progress = CASE WHEN COALESCE(is_completed, FALSE) THEN 100 ELSE COALESCE(progress, 0) END,
    completion_percentage = CASE WHEN COALESCE(is_completed, FALSE) THEN 100 ELSE COALESCE(completion_percentage, progress, 0) END;

CREATE OR REPLACE FUNCTION public.sync_module_progress_compatibility_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.completed := COALESCE(NEW.is_completed, FALSE);
  IF NEW.is_completed THEN
    NEW.progress := 100;
    NEW.completion_percentage := 100;
  ELSE
    NEW.progress := COALESCE(NEW.progress, 0);
    NEW.completion_percentage := COALESCE(NEW.completion_percentage, NEW.progress, 0);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS module_progress_compatibility_columns ON public.module_progress;
CREATE TRIGGER module_progress_compatibility_columns
BEFORE INSERT OR UPDATE OF is_completed, progress, completion_percentage
ON public.module_progress
FOR EACH ROW EXECUTE FUNCTION public.sync_module_progress_compatibility_columns();

CREATE UNIQUE INDEX IF NOT EXISTS module_progress_user_module_key
  ON public.module_progress(user_id, module_id);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Users can view own progress') THEN
    CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Users can insert own progress') THEN
    CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Users can update own progress') THEN
    CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'module_progress' AND policyname = 'Users can view own module progress') THEN
    CREATE POLICY "Users can view own module progress" ON public.module_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'module_progress' AND policyname = 'Users can insert own module progress') THEN
    CREATE POLICY "Users can insert own module progress" ON public.module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'module_progress' AND policyname = 'Users can update own module progress') THEN
    CREATE POLICY "Users can update own module progress" ON public.module_progress FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_activity_gate_status(
  p_user_id UUID,
  p_activity TEXT,
  p_module_id UUID DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_active_module UUID;
  v_module_id UUID;
  v_count INTEGER;
  v_locked BOOLEAN := FALSE;
BEGIN
  SELECT m.id INTO v_active_module
  FROM modules m
  LEFT JOIN module_progress mp ON mp.module_id = m.id AND mp.user_id = p_user_id
  WHERE COALESCE(mp.is_completed, FALSE) = FALSE
  ORDER BY m.week_number ASC
  LIMIT 1;

  IF v_active_module IS NULL THEN
    SELECT id INTO v_active_module FROM modules ORDER BY week_number DESC LIMIT 1;
  END IF;

  IF v_active_module IS NULL THEN
    RETURN jsonb_build_object('locked', FALSE, 'module_id', NULL);
  END IF;

  IF p_module_id IS NOT NULL THEN
    IF p_module_id <> v_active_module THEN
      RETURN jsonb_build_object('locked', FALSE, 'module_id', p_module_id);
    END IF;
    v_module_id := p_module_id;
  ELSE
    v_module_id := v_active_module;
  END IF;

  IF p_activity = 'self_learning' THEN
    IF NOT EXISTS (SELECT 1 FROM discussion_prompts WHERE module_id = v_module_id) THEN
      v_locked := FALSE;
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM discussion_responses dr
      JOIN discussion_prompts dp ON dp.id = dr.prompt_id
      WHERE dr.user_id = p_user_id AND dp.module_id = v_module_id;
      v_locked := (v_count = 0);
    END IF;
  ELSIF p_activity = 'peer_learning' THEN
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = v_module_id) THEN
      v_locked := FALSE;
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM user_progress up
      JOIN lessons l ON l.id = up.lesson_id
      WHERE up.user_id = p_user_id AND l.module_id = v_module_id AND up.is_completed = TRUE;
      v_locked := (v_count = 0);
    END IF;
  ELSIF p_activity = 'quiz' THEN
    IF NOT EXISTS (SELECT 1 FROM peer_circles WHERE module_id = v_module_id) THEN
      v_locked := FALSE;
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM peer_circle_members pcm
      JOIN peer_circles pc ON pc.id = pcm.circle_id
      WHERE pcm.user_id = p_user_id AND pc.module_id = v_module_id;
      v_locked := (v_count = 0);
    END IF;
  ELSIF p_activity = 'assignment' THEN
    IF NOT EXISTS (SELECT 1 FROM quizzes WHERE module_id = v_module_id AND published = TRUE) THEN
      v_locked := FALSE;
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.user_id = p_user_id AND q.module_id = v_module_id AND qa.completed_at IS NOT NULL;
      v_locked := (v_count = 0);
    END IF;
  END IF;

  RETURN jsonb_build_object('locked', v_locked, 'module_id', v_module_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_activity_gate_status(UUID, TEXT, UUID) TO authenticated;
