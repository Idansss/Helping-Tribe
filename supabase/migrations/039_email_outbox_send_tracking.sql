-- Track whether outbox emails were actually delivered.
-- sent_at: set when Resend confirms delivery.
-- send_error: set when delivery fails (allows manual retry identification).

ALTER TABLE public.email_outbox
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS send_error TEXT;

CREATE INDEX IF NOT EXISTS idx_email_outbox_sent_at
  ON public.email_outbox (sent_at)
  WHERE sent_at IS NULL;
