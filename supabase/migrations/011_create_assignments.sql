-- Create Assignments and Submissions tables
-- Based on HELP Foundations Training structure

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT NOT NULL, -- 'worksheet', 'reflection', 'case_study', 'project'
  due_date TIMESTAMPTZ,
  max_points INTEGER,
  instructions TEXT,
  rubric JSONB, -- Structured rubric for grading
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT, -- URL to uploaded file in storage
  file_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded BOOLEAN DEFAULT false,
  grade INTEGER, -- 0-100 or points earned
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, user_id) -- One submission per user per assignment
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_module ON public.assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_type ON public.assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user ON public.assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_submitted ON public.assignment_submissions(submitted_at);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Assignments are viewable by all authenticated users
CREATE POLICY "Assignments are viewable by all authenticated users" 
ON public.assignments FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can view their own submissions
CREATE POLICY "Users can view own assignment submissions" 
ON public.assignment_submissions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create own assignment submissions" 
ON public.assignment_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions (before grading)
CREATE POLICY "Users can update own assignment submissions" 
ON public.assignment_submissions FOR UPDATE 
USING (auth.uid() = user_id AND graded = false);

-- Add comments
COMMENT ON TABLE public.assignments IS 'Assignments for each module with due dates and rubrics';
COMMENT ON TABLE public.assignment_submissions IS 'Student submissions for assignments with grading support';
