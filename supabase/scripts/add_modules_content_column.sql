-- Add content column to modules so admins can type notes/content for students.
-- Run in Supabase Dashboard → SQL Editor.

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS content TEXT;

COMMENT ON COLUMN public.modules.content IS 'Rich text or plain notes for the module, shown to learners.';
