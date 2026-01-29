-- =============================================================================
-- BACKPACK ITEMS (My Backpack): user bookmarks synced across devices
-- Run in Supabase Dashboard → SQL Editor.
-- Requires: public.profiles.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.backpack_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_backpack_items_user ON public.backpack_items(user_id);
CREATE INDEX IF NOT EXISTS idx_backpack_items_created ON public.backpack_items(created_at DESC);

ALTER TABLE public.backpack_items ENABLE ROW LEVEL SECURITY;

-- Users see only their own items
DROP POLICY IF EXISTS "Users see own backpack items" ON public.backpack_items;
CREATE POLICY "Users see own backpack items"
  ON public.backpack_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own items
DROP POLICY IF EXISTS "Users can insert own backpack items" ON public.backpack_items;
CREATE POLICY "Users can insert own backpack items"
  ON public.backpack_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
DROP POLICY IF EXISTS "Users can update own backpack items" ON public.backpack_items;
CREATE POLICY "Users can update own backpack items"
  ON public.backpack_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own items
DROP POLICY IF EXISTS "Users can delete own backpack items" ON public.backpack_items;
CREATE POLICY "Users can delete own backpack items"
  ON public.backpack_items FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.backpack_items IS 'My Backpack: saved resources/bookmarks per user, synced across devices';
