-- Applicants + student matric auth flow (students login via matric, not email).
-- Staff continues to use Supabase Auth email/password.

-- 1) Profiles: add matric number for convenience (optional, but useful for admin views)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS matric_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_matric_number_unique
  ON public.profiles (matric_number)
  WHERE matric_number IS NOT NULL;

-- 2) Applicants
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicant_status') THEN
    CREATE TYPE applicant_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.applicants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name_certificate TEXT NOT NULL,
  gender TEXT NOT NULL,
  dob DATE NOT NULL,
  phone_whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  city_state TEXT NOT NULL,
  nationality TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status applicant_status NOT NULL DEFAULT 'PENDING',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applicants_status_created_at ON public.applicants (status, created_at DESC);

-- 3) Students mapping table (password is stored in Supabase Auth; this table links matric/applicant)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES public.applicants(id) ON DELETE SET NULL,
  matric_number TEXT UNIQUE NOT NULL,
  must_set_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_applicant_id ON public.students (applicant_id);

-- 4) Password setup tokens (hashed)
CREATE TABLE IF NOT EXISTS public.password_setup_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_setup_tokens_student_id ON public.password_setup_tokens (student_id);
CREATE INDEX IF NOT EXISTS idx_password_setup_tokens_expires_at ON public.password_setup_tokens (expires_at);

-- 5) Matric number sequence per year (atomic)
CREATE TABLE IF NOT EXISTS public.matric_sequences (
  year INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.next_matric_number(p_year INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_number INTEGER;
BEGIN
  INSERT INTO public.matric_sequences(year, last_number)
  VALUES (p_year, 0)
  ON CONFLICT (year) DO NOTHING;

  UPDATE public.matric_sequences
  SET last_number = last_number + 1, updated_at = NOW()
  WHERE year = p_year
  RETURNING last_number INTO new_number;

  RETURN 'HF-CT-' || p_year::TEXT || '-' || LPAD(new_number::TEXT, 4, '0');
END;
$$;

-- 6) RLS
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_setup_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matric_sequences ENABLE ROW LEVEL SECURITY;

-- Applicants: anyone can insert (public application form)
DROP POLICY IF EXISTS "Public can apply" ON public.applicants;
CREATE POLICY "Public can apply"
  ON public.applicants FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Applicants: staff can read/update
DROP POLICY IF EXISTS "Staff can manage applicants" ON public.applicants;
CREATE POLICY "Staff can manage applicants"
  ON public.applicants FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text IN ('admin', 'faculty', 'mentor')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text IN ('admin', 'faculty', 'mentor')
  ));

-- Students: student can read own row; staff can read all
DROP POLICY IF EXISTS "Student can read own record" ON public.students;
CREATE POLICY "Student can read own record"
  ON public.students FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage students" ON public.students;
CREATE POLICY "Staff can manage students"
  ON public.students FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text IN ('admin', 'faculty', 'mentor')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text IN ('admin', 'faculty', 'mentor')
  ));

-- Tokens/sequences: no direct access via anon/authenticated (server uses service role)
REVOKE ALL ON TABLE public.password_setup_tokens FROM anon, authenticated;
REVOKE ALL ON TABLE public.matric_sequences FROM anon, authenticated;
