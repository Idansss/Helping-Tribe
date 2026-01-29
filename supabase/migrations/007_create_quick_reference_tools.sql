-- Create Quick Reference Tools table
-- Based on HELP_Foundations_Quick_Reference_Tools document

CREATE TABLE IF NOT EXISTS public.quick_reference_tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_type TEXT NOT NULL, -- 'stages_of_helping', 'ethical_principles', 'crisis_intervention', etc.
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured tool content
  module_id UUID REFERENCES public.modules(id), -- NULL for general tools
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for tool_type for faster queries
CREATE INDEX IF NOT EXISTS idx_quick_reference_tools_type ON public.quick_reference_tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_quick_reference_tools_module ON public.quick_reference_tools(module_id);

-- Enable RLS
ALTER TABLE public.quick_reference_tools ENABLE ROW LEVEL SECURITY;

-- Tools are viewable by all authenticated users
CREATE POLICY "Quick reference tools are viewable by all authenticated users" 
ON public.quick_reference_tools FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE public.quick_reference_tools IS 'Quick reference tools for helpers - printable guides and checklists';
