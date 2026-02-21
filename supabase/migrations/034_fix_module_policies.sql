-- Restrict module INSERT/UPDATE to admin and faculty/mentor roles only.
-- Migration 029 incorrectly allowed any authenticated user to create or edit modules.

DROP POLICY IF EXISTS "Authenticated users can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Authenticated users can update modules" ON public.modules;

-- Only admin/faculty/mentor may insert modules
CREATE POLICY "Staff can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

-- Only admin/faculty/mentor may update modules
CREATE POLICY "Staff can update modules"
  ON public.modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );

-- Only admin/faculty/mentor may delete modules
CREATE POLICY "Staff can delete modules"
  ON public.modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );
