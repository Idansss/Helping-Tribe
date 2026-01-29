-- Create Assessment Tools tables
-- Based on HELP_Foundations_Assessment_Evaluation_Tools document

-- Assessment Tools table
CREATE TABLE IF NOT EXISTS public.assessment_tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_type TEXT NOT NULL, -- 'pre_training', 'post_training', 'session_feedback', 'final_evaluation'
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Array of question objects with type, text, options, etc.
  is_active BOOLEAN DEFAULT true,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  module_id UUID REFERENCES public.modules(id), -- NULL for course-level assessments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Responses table
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessment_tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- Answers: {questionId: answer}
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, user_id) -- One response per user per assessment
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_tools_type ON public.assessment_tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_assessment_tools_module ON public.assessment_tools(module_id);
CREATE INDEX IF NOT EXISTS idx_assessment_tools_active ON public.assessment_tools(is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment ON public.assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user ON public.assessment_responses(user_id);

-- Enable RLS
ALTER TABLE public.assessment_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- Assessment tools are viewable by all authenticated users
CREATE POLICY "Assessment tools are viewable by all authenticated users" 
ON public.assessment_tools FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can view their own responses
CREATE POLICY "Users can view own assessment responses" 
ON public.assessment_responses FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own responses
CREATE POLICY "Users can create own assessment responses" 
ON public.assessment_responses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses (if allowed)
CREATE POLICY "Users can update own assessment responses" 
ON public.assessment_responses FOR UPDATE 
USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.assessment_tools IS 'Assessment and evaluation tools (pre/post training, session feedback, final evaluation)';
COMMENT ON TABLE public.assessment_responses IS 'User responses to assessment tools';
