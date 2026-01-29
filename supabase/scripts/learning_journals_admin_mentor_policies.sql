-- Allow admins and mentors to view learner journal entries and learner names.
-- Run in Supabase Dashboard → SQL Editor after create_learning_journals_table.sql.
-- Requires: profiles.role exists (admin, mentor, faculty, student).
--
-- Uses get_my_profile_role() to avoid infinite recursion in the profiles policy.

-- 1. Helper: returns current user's role without triggering RLS on profiles
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. learning_journals: users see own entries; admin/mentor/faculty see all
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.learning_journals;
CREATE POLICY "Users can view own journal entries"
  ON public.learning_journals FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty')
  );

-- 3. profiles: users see own profile; admin/mentor/faculty see all (so journal list shows learner names)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty')
  );
