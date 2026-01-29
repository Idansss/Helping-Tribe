-- =============================================================================
-- WEEKLY EVENTS (CALENDAR) TABLE + ADMIN/MENTOR POLICIES (all-in-one)
-- Run in Supabase Dashboard → SQL Editor.
-- Creates weekly_events table if missing; RLS so learners and mentors can view
-- and admin/mentors can create, edit, and delete events.
-- Requires: public.profiles (with role) for get_my_profile_role.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Weekly events table (module_id optional so script works without modules)
CREATE TABLE IF NOT EXISTS public.weekly_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID DEFAULT NULL,
  event_type TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ,
  title TEXT NOT NULL,
  description TEXT,
  meeting_link TEXT,
  recording_url TEXT,
  week_number INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_events_module ON public.weekly_events(module_id);
CREATE INDEX IF NOT EXISTS idx_weekly_events_week ON public.weekly_events(week_number);
CREATE INDEX IF NOT EXISTS idx_weekly_events_type ON public.weekly_events(event_type);
CREATE INDEX IF NOT EXISTS idx_weekly_events_date ON public.weekly_events(scheduled_date);

ALTER TABLE public.weekly_events ENABLE ROW LEVEL SECURITY;

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

-- 3. All authenticated can read
DROP POLICY IF EXISTS "Weekly events are viewable by all authenticated users" ON public.weekly_events;
CREATE POLICY "Weekly events are viewable by all authenticated users"
  ON public.weekly_events FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Admin and mentors can manage
DROP POLICY IF EXISTS "Admin and mentors can create weekly events" ON public.weekly_events;
CREATE POLICY "Admin and mentors can create weekly events"
  ON public.weekly_events FOR INSERT
  WITH CHECK (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can update weekly events" ON public.weekly_events;
CREATE POLICY "Admin and mentors can update weekly events"
  ON public.weekly_events FOR UPDATE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

DROP POLICY IF EXISTS "Admin and mentors can delete weekly events" ON public.weekly_events;
CREATE POLICY "Admin and mentors can delete weekly events"
  ON public.weekly_events FOR DELETE
  USING (public.get_my_profile_role() IN ('admin', 'mentor', 'faculty'));

COMMENT ON TABLE public.weekly_events IS 'Weekly calendar events for the training program';
