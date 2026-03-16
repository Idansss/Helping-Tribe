-- CPD (Continuing Professional Development) Snippets
-- Short, focused learning cards that mentors and learners can reference.

CREATE TABLE IF NOT EXISTS public.cpd_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cpd_snippets_category ON public.cpd_snippets (category);
CREATE INDEX IF NOT EXISTS idx_cpd_snippets_created_at ON public.cpd_snippets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cpd_snippets_tags ON public.cpd_snippets USING GIN (tags);

ALTER TABLE public.cpd_snippets ENABLE ROW LEVEL SECURITY;

-- Admins and mentors can manage snippets
CREATE POLICY "Staff can manage CPD snippets"
  ON public.cpd_snippets FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role::text IN ('admin', 'faculty', 'mentor')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role::text IN ('admin', 'faculty', 'mentor')
  ));

-- All authenticated users can read snippets
CREATE POLICY "All users can read CPD snippets"
  ON public.cpd_snippets FOR SELECT TO authenticated
  USING (true);
