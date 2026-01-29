-- Create Discussion Forum tables
-- Based on HELP Foundations Training structure

-- Discussion Prompts table
CREATE TABLE IF NOT EXISTS public.discussion_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion Responses table (with threading support)
CREATE TABLE IF NOT EXISTS public.discussion_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_id UUID REFERENCES public.discussion_prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  parent_response_id UUID REFERENCES public.discussion_responses(id) ON DELETE CASCADE, -- For threading
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_module ON public.discussion_prompts(module_id);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_posted ON public.discussion_prompts(posted_at);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_prompt ON public.discussion_responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_user ON public.discussion_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_parent ON public.discussion_responses(parent_response_id);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_created ON public.discussion_responses(created_at);

-- Enable RLS
ALTER TABLE public.discussion_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_responses ENABLE ROW LEVEL SECURITY;

-- Prompts are viewable by all authenticated users
CREATE POLICY "Discussion prompts are viewable by all authenticated users" 
ON public.discussion_prompts FOR SELECT 
USING (auth.role() = 'authenticated');

-- Responses are viewable by all authenticated users
CREATE POLICY "Discussion responses are viewable by all authenticated users" 
ON public.discussion_responses FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can create responses
CREATE POLICY "Users can create discussion responses" 
ON public.discussion_responses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update own discussion responses" 
ON public.discussion_responses FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own responses
CREATE POLICY "Users can delete own discussion responses" 
ON public.discussion_responses FOR DELETE 
USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.discussion_prompts IS 'Discussion prompts posted for each module';
COMMENT ON TABLE public.discussion_responses IS 'User responses to discussion prompts with threading support';
