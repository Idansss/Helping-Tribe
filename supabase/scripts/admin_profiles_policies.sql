-- =============================================================================
-- ADMIN PROFILES: let admins list all users and edit role, full_name, is_active
-- Run in Supabase Dashboard → SQL Editor after profiles table exists.
-- Requires: public.profiles (with role column).
-- =============================================================================

-- 1. Optional: add is_active column if missing (ignore if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 2. Role helper (idempotent)
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 3. SELECT: users see own profile; admin/mentor/faculty see all (for admin user list)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.get_my_profile_role() IN ('admin', 'mentor', 'faculty')
  );

-- 4. UPDATE: users can update own profile; admins can update any profile (role, full_name, is_active)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to update any profile (role, display name, active flag)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_profile_role() = 'admin')
  WITH CHECK (true);

COMMENT ON COLUMN public.profiles.is_active IS 'When false, user can be excluded from access (admin-managed).';
