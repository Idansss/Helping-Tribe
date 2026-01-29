-- =============================================================================
-- PEER CIRCLES TABLES + MENTOR POLICIES (all-in-one)
-- Run this in Supabase Dashboard → SQL Editor.
-- Creates peer_circles and peer_circle_members if missing, then adds RLS
-- so mentors can create circles and add/remove learners.
-- Requires: public.profiles table (and auth.users).
-- =============================================================================

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Peer Circles table (module_id optional, no FK to modules so script works without modules table)
CREATE TABLE IF NOT EXISTS public.peer_circles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  module_id UUID DEFAULT NULL,
  max_members INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Peer Circle Members table
CREATE TABLE IF NOT EXISTS public.peer_circle_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  circle_id UUID REFERENCES public.peer_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_peer_circles_module ON public.peer_circles(module_id);
CREATE INDEX IF NOT EXISTS idx_peer_circles_active ON public.peer_circles(is_active);
CREATE INDEX IF NOT EXISTS idx_peer_circles_created_by ON public.peer_circles(created_by);
CREATE INDEX IF NOT EXISTS idx_peer_circle_members_circle ON public.peer_circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_peer_circle_members_user ON public.peer_circle_members(user_id);

-- 4. Enable RLS
ALTER TABLE public.peer_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_circle_members ENABLE ROW LEVEL SECURITY;

-- 5. Base RLS policies (idempotent: drop if exists then create)
DROP POLICY IF EXISTS "Peer circles are viewable by all authenticated users" ON public.peer_circles;
CREATE POLICY "Peer circles are viewable by all authenticated users"
  ON public.peer_circles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create peer circles" ON public.peer_circles;
CREATE POLICY "Users can create peer circles"
  ON public.peer_circles FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update circles they created" ON public.peer_circles;
CREATE POLICY "Users can update circles they created"
  ON public.peer_circles FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete circles they created" ON public.peer_circles;
CREATE POLICY "Users can delete circles they created"
  ON public.peer_circles FOR DELETE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Circle members are viewable by authenticated users" ON public.peer_circle_members;
CREATE POLICY "Circle members are viewable by authenticated users"
  ON public.peer_circle_members FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join peer circles" ON public.peer_circle_members;
CREATE POLICY "Users can join peer circles"
  ON public.peer_circle_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave peer circles" ON public.peer_circle_members;
CREATE POLICY "Users can leave peer circles"
  ON public.peer_circle_members FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Mentor policies: circle creators can add/remove any member
DROP POLICY IF EXISTS "Circle creators can add members" ON public.peer_circle_members;
CREATE POLICY "Circle creators can add members"
  ON public.peer_circle_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.peer_circles
      WHERE id = circle_id AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Circle creators can remove members" ON public.peer_circle_members;
CREATE POLICY "Circle creators can remove members"
  ON public.peer_circle_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.peer_circles
      WHERE id = circle_id AND created_by = auth.uid()
    )
  );

COMMENT ON TABLE public.peer_circles IS 'Peer learning circles for collaborative learning';
COMMENT ON TABLE public.peer_circle_members IS 'Membership in peer learning circles';
