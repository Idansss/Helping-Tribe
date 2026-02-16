-- Draft persistence + staff-visible outbox for application onboarding flow.

DO $$
BEGIN
  ALTER TYPE public.applicant_status ADD VALUE IF NOT EXISTS 'DRAFT';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.application_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  email TEXT,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_step INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_drafts_email_updated_at
  ON public.application_drafts (email, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_application_drafts_status_updated_at
  ON public.application_drafts (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.email_outbox (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'GENERAL',
  applicant_id UUID REFERENCES public.applicants(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_created_at
  ON public.email_outbox (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_outbox_applicant_id
  ON public.email_outbox (applicant_id);

ALTER TABLE public.application_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read email outbox" ON public.email_outbox;
CREATE POLICY "Staff can read email outbox"
  ON public.email_outbox FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text IN ('admin', 'faculty', 'mentor')
  ));

REVOKE ALL ON TABLE public.application_drafts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.email_outbox FROM anon, authenticated;
GRANT SELECT ON TABLE public.email_outbox TO authenticated;
