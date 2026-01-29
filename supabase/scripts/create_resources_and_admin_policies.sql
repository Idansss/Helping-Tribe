-- =============================================================================
-- RESOURCES TABLE + ADMIN/MENTOR POLICIES (all-in-one)
-- Run in Supabase Dashboard → SQL Editor.
-- Creates resources table if missing; RLS so learners can view and
-- admin/mentors can create, edit, and delete resources.
-- Requires: public.profiles (with role column) for get_my_profile_role.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Resources table (Resource Directory)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  contact_info JSONB DEFAULT '{}',
  website_url TEXT,
  location TEXT,
  tags TEXT[] DEFAULT NULL,
  display_order INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resources_display_order ON public.resources(display_order);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 2. Helper for role check (idempotent)
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 3. Base policy: all authenticated can read
DROP POLICY IF EXISTS "Resources are viewable by all authenticated users" ON public.resources;
CREATE POLICY "Resources are viewable by all authenticated users"
  ON public.resources FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Admin and mentors can manage
DROP POLICY IF EXISTS "Admin and mentors can create resources" ON public.resources;
CREATE POLICY "Admin and mentors can create resources"
  ON public.resources FOR INSERT
  WITH CHECK (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can update resources" ON public.resources;
CREATE POLICY "Admin and mentors can update resources"
  ON public.resources FOR UPDATE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can delete resources" ON public.resources;
CREATE POLICY "Admin and mentors can delete resources"
  ON public.resources FOR DELETE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

COMMENT ON TABLE public.resources IS 'Resource directory for helpers in Nigeria and low-resource contexts';
