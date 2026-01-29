-- Enhance Learning Journals table with additional fields
-- This migration adds support for structured prompts and reflection types

ALTER TABLE public.learning_journals 
ADD COLUMN IF NOT EXISTS reflection_type TEXT DEFAULT 'module_reflection',
ADD COLUMN IF NOT EXISTS prompts_answered JSONB,
ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Add comment to explain new fields
COMMENT ON COLUMN public.learning_journals.reflection_type IS 'Type of reflection: module_reflection, case_study, peer_feedback, etc.';
COMMENT ON COLUMN public.learning_journals.prompts_answered IS 'JSON object tracking which prompts have been answered: {promptId: answer}';
COMMENT ON COLUMN public.learning_journals.attachments IS 'JSON array of attachment URLs or file references';

-- Create index for reflection_type for faster queries
CREATE INDEX IF NOT EXISTS idx_learning_journals_reflection_type 
ON public.learning_journals(reflection_type);
