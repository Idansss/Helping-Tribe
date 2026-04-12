DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_plan') THEN
    CREATE TYPE payment_plan AS ENUM ('FULL', 'HALF', 'BALANCE');
  END IF;
END $$;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS is_fully_paid BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS full_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS amount_paid_kobo INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_kobo INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_total_fee_kobo INTEGER;

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_payment_status_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_payment_status_check
  CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'FULL'));

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_amount_paid_kobo_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_amount_paid_kobo_check
  CHECK (amount_paid_kobo >= 0);

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_balance_due_kobo_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_balance_due_kobo_check
  CHECK (balance_due_kobo >= 0);

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_plan payment_plan NOT NULL DEFAULT 'FULL',
  ADD COLUMN IF NOT EXISTS expected_total_fee_kobo INTEGER;

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_expected_total_fee_kobo_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_expected_total_fee_kobo_check
  CHECK (expected_total_fee_kobo IS NULL OR expected_total_fee_kobo >= amount_kobo);

UPDATE public.payments
SET expected_total_fee_kobo = amount_kobo
WHERE expected_total_fee_kobo IS NULL;

WITH payment_rollup AS (
  SELECT
    p.student_id,
    SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount_kobo ELSE 0 END) AS amount_paid_kobo,
    MAX(p.expected_total_fee_kobo) AS expected_total_fee_kobo,
    MIN(CASE WHEN p.status = 'SUCCESS' THEN p.paid_at END) AS first_paid_at,
    MAX(CASE WHEN p.status = 'SUCCESS' THEN p.paid_at END) AS latest_paid_at
  FROM public.payments p
  WHERE p.student_id IS NOT NULL
  GROUP BY p.student_id
)
UPDATE public.students s
SET
  amount_paid_kobo = COALESCE(r.amount_paid_kobo, 0),
  expected_total_fee_kobo = COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo),
  balance_due_kobo = CASE
    WHEN COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) IS NULL THEN COALESCE(s.balance_due_kobo, 0)
    ELSE GREATEST(COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) - COALESCE(r.amount_paid_kobo, 0), 0)
  END,
  payment_status = CASE
    WHEN s.is_paid = TRUE AND COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) IS NULL THEN 'FULL'
    WHEN COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) IS NOT NULL
      AND COALESCE(r.amount_paid_kobo, 0) >= COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) THEN 'FULL'
    WHEN COALESCE(r.amount_paid_kobo, 0) > 0 OR s.is_paid = TRUE THEN 'PARTIAL'
    ELSE 'UNPAID'
  END,
  is_fully_paid = CASE
    WHEN s.is_paid = TRUE AND COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) IS NULL THEN TRUE
    WHEN COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) IS NOT NULL
      AND COALESCE(r.amount_paid_kobo, 0) >= COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) THEN TRUE
    ELSE s.is_fully_paid
  END,
  paid_at = COALESCE(r.first_paid_at, s.paid_at),
  full_paid_at = CASE
    WHEN (
      s.is_paid = TRUE AND COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) IS NULL
    ) OR (
      COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo) IS NOT NULL
      AND COALESCE(r.amount_paid_kobo, 0) >= COALESCE(r.expected_total_fee_kobo, s.expected_total_fee_kobo)
    )
      THEN COALESCE(r.latest_paid_at, s.paid_at, s.full_paid_at)
    ELSE s.full_paid_at
  END
FROM payment_rollup r
WHERE s.id = r.student_id;

CREATE INDEX IF NOT EXISTS idx_payments_student_status_created_at
  ON public.payments (student_id, status, created_at DESC);
