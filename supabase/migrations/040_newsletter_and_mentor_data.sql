-- Newsletter issues and subscribers (admin-managed)
CREATE TABLE IF NOT EXISTS public.newsletter_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mentor conferences (per mentor)
CREATE TABLE IF NOT EXISTS public.mentor_conferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  host TEXT NOT NULL DEFAULT '',
  conference_date DATE,
  conference_time TIME,
  duration_mins INTEGER NOT NULL DEFAULT 60,
  location TEXT NOT NULL DEFAULT 'Zoom',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mentor skills (per mentor)
CREATE TABLE IF NOT EXISTS public.mentor_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'core-counseling',
  proficiency TEXT NOT NULL DEFAULT 'beginner',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_skills ENABLE ROW LEVEL SECURITY;

-- Newsletter: admins can do everything
CREATE POLICY "Admins manage newsletter issues"
  ON public.newsletter_issues FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin'));

CREATE POLICY "Admins manage newsletter subscribers"
  ON public.newsletter_subscribers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin'));

-- Mentor conferences: mentors manage their own
CREATE POLICY "Mentors manage own conferences"
  ON public.mentor_conferences FOR ALL TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

-- Mentor skills: mentors manage their own
CREATE POLICY "Mentors manage own skills"
  ON public.mentor_skills FOR ALL TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_issues_created_at ON public.newsletter_issues (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_conferences_mentor_id ON public.mentor_conferences (mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_skills_mentor_id ON public.mentor_skills (mentor_id);
