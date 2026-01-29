-- Create Case Studies tables
-- Based on HELP_Foundations_Case_Study_Bank document

-- Case Studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id), -- NULL for general case studies
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array of question objects
  learning_objectives TEXT[],
  difficulty_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Study Responses table
CREATE TABLE IF NOT EXISTS public.case_study_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_study_id UUID REFERENCES public.case_studies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- Answers to questions: {questionId: answer}
  reflection TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_study_id, user_id) -- One response per user per case study
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_studies_module ON public.case_studies(module_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_difficulty ON public.case_studies(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_case_studies_tags ON public.case_studies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_case_study_responses_case ON public.case_study_responses(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_responses_user ON public.case_study_responses(user_id);

-- Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_responses ENABLE ROW LEVEL SECURITY;

-- Case studies are viewable by all authenticated users
CREATE POLICY "Case studies are viewable by all authenticated users" 
ON public.case_studies FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can view their own responses
CREATE POLICY "Users can view own case study responses" 
ON public.case_study_responses FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own responses
CREATE POLICY "Users can create own case study responses" 
ON public.case_study_responses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update own case study responses" 
ON public.case_study_responses FOR UPDATE 
USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.case_studies IS 'Case studies for practice and analysis';
COMMENT ON TABLE public.case_study_responses IS 'Student responses to case studies';
