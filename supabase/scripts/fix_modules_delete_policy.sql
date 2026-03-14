-- Fix: Allow admin/mentor/faculty to DELETE modules
-- Run in Supabase Dashboard → SQL Editor

DROP POLICY IF EXISTS "Staff can delete modules" ON public.modules;

CREATE POLICY "Staff can delete modules"
  ON public.modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('admin', 'faculty', 'mentor')
    )
  );
