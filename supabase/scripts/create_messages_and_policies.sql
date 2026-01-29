-- =============================================================================
-- MESSAGES: real messaging between learners and mentor/admin
-- Run in Supabase Dashboard → SQL Editor.
-- Requires: public.profiles (with role column).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_message CHECK (sender_id != recipient_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Role helper (idempotent)
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 5. Policies: users see messages they sent or received
DROP POLICY IF EXISTS "Users see own messages" ON public.messages;
CREATE POLICY "Users see own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Recipient can update only read_at (mark as read)
DROP POLICY IF EXISTS "Recipient can mark as read" ON public.messages;
CREATE POLICY "Recipient can mark as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

COMMENT ON TABLE public.messages IS 'Direct messages between users (learner, mentor, admin)';
