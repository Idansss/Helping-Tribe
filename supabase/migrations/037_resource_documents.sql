-- Weekly course documents uploaded by admin (1 per week, weeks 1–9)
-- Visible to all authenticated users (learners and mentors)
-- Files stored in the 'final-exams' storage bucket under resource-docs/

CREATE TABLE IF NOT EXISTS public.resource_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 9),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (week_number)
);

CREATE INDEX IF NOT EXISTS idx_resource_documents_week ON public.resource_documents(week_number);

ALTER TABLE public.resource_documents ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view documents
CREATE POLICY "Resource documents viewable by authenticated users"
  ON public.resource_documents FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admin can insert
CREATE POLICY "Admin can insert resource documents"
  ON public.resource_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text = 'admin'
    )
  );

-- Only admin can update
CREATE POLICY "Admin can update resource documents"
  ON public.resource_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text = 'admin'
    )
  );

-- Only admin can delete
CREATE POLICY "Admin can delete resource documents"
  ON public.resource_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text = 'admin'
    )
  );

COMMENT ON TABLE public.resource_documents IS 'Weekly course documents (PDFs) uploaded by admin – 1 per week, weeks 1–9. Visible to all learners and mentors.';
