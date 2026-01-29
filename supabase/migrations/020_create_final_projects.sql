-- Create Final Projects tables
-- Based on HELP Foundations Training - Module 9 Final Projects

-- Final Projects table (project requirements/guidelines)
CREATE TABLE IF NOT EXISTS public.final_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id), -- Should be Module 9
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB, -- Structured requirements: {objectives: [], deliverables: [], rubric: {}}
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Final Project Submissions table
CREATE TABLE IF NOT EXISTS public.final_project_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.final_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_text TEXT,
  submission_file_url TEXT,
  submission_file_name TEXT,
  presentation_url TEXT, -- Link to presentation recording or slides
  reflection TEXT, -- Reflection on the project
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded BOOLEAN DEFAULT false,
  grade INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES public.profiles(id),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id) -- One submission per user per project
);

-- Final Project Peer Feedback table
CREATE TABLE IF NOT EXISTS public.final_project_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES public.final_project_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  strengths TEXT,
  improvements TEXT,
  rating INTEGER, -- 1-5 rating
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, reviewer_id) -- One feedback per reviewer per submission
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_final_projects_module ON public.final_projects(module_id);
CREATE INDEX IF NOT EXISTS idx_final_projects_active ON public.final_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_final_project_submissions_project ON public.final_project_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_final_project_submissions_user ON public.final_project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_final_project_feedback_submission ON public.final_project_feedback(submission_id);
CREATE INDEX IF NOT EXISTS idx_final_project_feedback_reviewer ON public.final_project_feedback(reviewer_id);

-- Enable RLS
ALTER TABLE public.final_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_project_feedback ENABLE ROW LEVEL SECURITY;

-- Final projects are viewable by all authenticated users
CREATE POLICY "Final projects are viewable by all authenticated users" 
ON public.final_projects FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can view their own submissions
CREATE POLICY "Users can view own project submissions" 
ON public.final_project_submissions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can view all submissions (for peer feedback)
CREATE POLICY "Users can view all project submissions for feedback" 
ON public.final_project_submissions FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can create their own submissions
CREATE POLICY "Users can create own project submissions" 
ON public.final_project_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions
CREATE POLICY "Users can update own project submissions" 
ON public.final_project_submissions FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can view feedback on their submissions
CREATE POLICY "Users can view feedback on own submissions" 
ON public.final_project_feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.final_project_submissions 
    WHERE id = final_project_feedback.submission_id 
    AND user_id = auth.uid()
  )
);

-- Users can view all feedback (for peer learning)
CREATE POLICY "Users can view all project feedback" 
ON public.final_project_feedback FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can create feedback on any submission
CREATE POLICY "Users can create project feedback" 
ON public.final_project_feedback FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback" 
ON public.final_project_feedback FOR UPDATE 
USING (auth.uid() = reviewer_id);

-- Add comments
COMMENT ON TABLE public.final_projects IS 'Final capstone project requirements for Module 9';
COMMENT ON TABLE public.final_project_submissions IS 'Student submissions for final projects';
COMMENT ON TABLE public.final_project_feedback IS 'Peer feedback on final project submissions';
