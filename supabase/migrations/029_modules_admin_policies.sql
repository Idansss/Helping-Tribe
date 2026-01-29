-- Allow authenticated users to insert and update modules (for Admin Courses page).
-- Learners only need SELECT; admins/faculty use this to add or edit modules.

CREATE POLICY "Authenticated users can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update modules"
  ON public.modules FOR UPDATE
  USING (auth.role() = 'authenticated');
