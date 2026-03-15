-- Daily Activity Prerequisite Gate
-- Implements the weekly learning sequence:
--   Monday    → Faculty discussion       (no prerequisite)
--   Tuesday   → Self-learning lesson     (requires: discussion response this module)
--   Wednesday → Peer learning circle     (requires: lesson completed this module)
--   Thursday  → Quiz                     (requires: member of peer circle this module)
--   Friday    → Assignment               (requires: quiz attempt completed this module)
--   Saturday  → Live session             (no prerequisite)
--
-- Single RPC call replaces multiple client-side queries.

CREATE OR REPLACE FUNCTION public.get_activity_gate_status(
  p_user_id    UUID,
  p_activity   TEXT,               -- 'self_learning' | 'peer_learning' | 'quiz' | 'assignment'
  p_module_id  UUID DEFAULT NULL   -- Optional: specific module (e.g. from the course page URL)
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_active_module UUID;
  v_module_id     UUID;
  v_count         INTEGER;
  v_locked        BOOLEAN := FALSE;
BEGIN
  -- ── 1. Find the user's current active module (first non-completed) ────────
  SELECT m.id INTO v_active_module
  FROM   modules m
  LEFT JOIN module_progress mp
         ON mp.module_id = m.id
        AND mp.user_id   = p_user_id
  WHERE  COALESCE(mp.completed, FALSE) = FALSE
  ORDER  BY m.week_number ASC
  LIMIT  1;

  -- Fallback: all modules complete → use the last module (fully unlocked state)
  IF v_active_module IS NULL THEN
    SELECT id INTO v_active_module
    FROM   modules
    ORDER  BY week_number DESC
    LIMIT  1;
  END IF;

  IF v_active_module IS NULL THEN
    -- No modules exist yet in the database
    RETURN jsonb_build_object('locked', FALSE, 'module_id', NULL);
  END IF;

  -- ── 2. Determine which module to gate against ─────────────────────────────
  IF p_module_id IS NOT NULL THEN
    -- A specific module was passed (e.g. the course player URL).
    -- Only gate if it IS the active module; past/completed modules are freely accessible.
    IF p_module_id <> v_active_module THEN
      RETURN jsonb_build_object('locked', FALSE, 'module_id', p_module_id);
    END IF;
    v_module_id := p_module_id;
  ELSE
    v_module_id := v_active_module;
  END IF;

  -- ── 3. Evaluate the prerequisite for the requested activity ───────────────

  IF p_activity = 'self_learning' THEN
    -- Must have at least one discussion response for this module
    IF NOT EXISTS (
      SELECT 1 FROM discussion_prompts WHERE module_id = v_module_id
    ) THEN
      v_locked := FALSE; -- No prompts published → don't block
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM   discussion_responses dr
      JOIN   discussion_prompts   dp ON dp.id = dr.prompt_id
      WHERE  dr.user_id   = p_user_id
        AND  dp.module_id = v_module_id;
      v_locked := (v_count = 0);
    END IF;

  ELSIF p_activity = 'peer_learning' THEN
    -- Must have completed at least one lesson in this module
    IF NOT EXISTS (
      SELECT 1 FROM lessons WHERE module_id = v_module_id
    ) THEN
      v_locked := FALSE; -- No lessons published → don't block
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM   user_progress up
      JOIN   lessons        l  ON l.id = up.lesson_id
      WHERE  up.user_id    = p_user_id
        AND  l.module_id   = v_module_id
        AND  up.is_completed = TRUE;
      v_locked := (v_count = 0);
    END IF;

  ELSIF p_activity = 'quiz' THEN
    -- Must be a member of a peer circle tied to this module
    IF NOT EXISTS (
      SELECT 1 FROM peer_circles WHERE module_id = v_module_id
    ) THEN
      v_locked := FALSE; -- No circles set up yet → don't block
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM   peer_circle_members pcm
      JOIN   peer_circles         pc  ON pc.id = pcm.circle_id
      WHERE  pcm.user_id  = p_user_id
        AND  pc.module_id = v_module_id;
      v_locked := (v_count = 0);
    END IF;

  ELSIF p_activity = 'assignment' THEN
    -- Must have a completed quiz attempt for a quiz in this module
    IF NOT EXISTS (
      SELECT 1 FROM quizzes WHERE module_id = v_module_id AND published = TRUE
    ) THEN
      v_locked := FALSE; -- No quiz published yet → don't block
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM   quiz_attempts qa
      JOIN   quizzes        q  ON q.id = qa.quiz_id
      WHERE  qa.user_id     = p_user_id
        AND  q.module_id    = v_module_id
        AND  qa.completed_at IS NOT NULL;
      v_locked := (v_count = 0);
    END IF;

  END IF;
  -- discussion / live_session / unknown → v_locked stays FALSE (always accessible)

  RETURN jsonb_build_object('locked', v_locked, 'module_id', v_module_id);
END;
$$;

-- Allow authenticated learners to call this function
GRANT EXECUTE ON FUNCTION public.get_activity_gate_status(UUID, TEXT, UUID) TO authenticated;

COMMENT ON FUNCTION public.get_activity_gate_status IS
  'Returns {locked: bool, module_id: uuid} for the daily activity prerequisite gate.
   Activity order: discussion (Mon, free) → self_learning (Tue) → peer_learning (Wed) → quiz (Thu) → assignment (Fri) → live_session (Sat, free).
   Pass p_module_id when checking a specific module URL — past completed modules are auto-unlocked.';
