-- Paystack payments for THE HELP FOUNDATIONAL COURSE.
-- Students pay after approval; payment is verified server-side before granting access.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
  END IF;
END $$;

-- Extend students with payment state.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Payments table.
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID REFERENCES public.applicants(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  reference TEXT UNIQUE NOT NULL,
  amount_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status payment_status NOT NULL DEFAULT 'PENDING',
  discount_applied BOOLEAN NOT NULL DEFAULT FALSE,
  discount_percent INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  raw_paystack_response JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at ON public.payments(status, created_at DESC);

-- RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Enum type usage (required to read/insert rows that use this enum)
GRANT USAGE ON TYPE public.payment_status TO authenticated;

-- Staff can read/manage payments (payments are created/updated by server using service role,
-- but this policy allows admin UI to view payment state if needed).
DROP POLICY IF EXISTS "Staff can manage payments" ON public.payments;
CREATE POLICY "Staff can manage payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text IN ('admin', 'faculty', 'mentor')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text IN ('admin', 'faculty', 'mentor')
  ));

-- Student can read own payments (optional, for future learner payment UI).
DROP POLICY IF EXISTS "Student can read own payments" ON public.payments;
CREATE POLICY "Student can read own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Privileges: keep writes server-side.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.payments FROM anon, authenticated;
GRANT SELECT ON TABLE public.payments TO authenticated;
