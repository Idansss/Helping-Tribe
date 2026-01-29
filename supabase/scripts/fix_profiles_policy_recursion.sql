-- Fix: "infinite recursion detected in policy for relation profiles"
-- The profiles policy was reading from profiles inside the policy, causing recursion.
-- Use a SECURITY DEFINER function so the role check bypasses RLS.
-- Run in Supabase Dashboard → SQL Editor.

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

-- 2. learning_journals: users see own; admin/mentor/faculty see all (no recursion)
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.learning_journals;
CREATE POLICY "Users can view own journal entries"
  ON public.learning_journals FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty')
  );

-- 3. profiles: users see own; admin/mentor/faculty see all (no recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty')
  );
