-- Ensure quizzes can be linked to modules for admin/mentor management UI.
-- Some environments were bootstrapped from older scripts without this column.

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS module_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quizzes_module_id_fkey'
      AND conrelid = 'public.quizzes'::regclass
  ) THEN
    ALTER TABLE public.quizzes
      ADD CONSTRAINT quizzes_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.modules(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_quizzes_module_id
  ON public.quizzes(module_id);
