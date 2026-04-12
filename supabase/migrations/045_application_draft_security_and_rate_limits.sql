ALTER TABLE public.application_drafts
  ADD COLUMN IF NOT EXISTS access_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS resume_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_token_last_used_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_application_drafts_access_token_hash
  ON public.application_drafts (access_token_hash);

CREATE TABLE IF NOT EXISTS public.request_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_rate_limits_reset_at
  ON public.request_rate_limits (reset_at);

ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.request_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket_key TEXT,
  p_limit INTEGER,
  p_window_ms BIGINT
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_window INTERVAL;
  v_count INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  IF p_limit < 1 THEN
    RAISE EXCEPTION 'p_limit must be greater than zero';
  END IF;

  IF p_window_ms < 1 THEN
    RAISE EXCEPTION 'p_window_ms must be greater than zero';
  END IF;

  v_window := make_interval(secs => p_window_ms::DOUBLE PRECISION / 1000.0);

  INSERT INTO public.request_rate_limits AS rl (bucket_key, count, reset_at, updated_at)
  VALUES (p_bucket_key, 1, v_now + v_window, v_now)
  ON CONFLICT (bucket_key) DO UPDATE
  SET
    count = CASE
      WHEN rl.reset_at <= v_now THEN 1
      ELSE rl.count + 1
    END,
    reset_at = CASE
      WHEN rl.reset_at <= v_now THEN v_now + v_window
      ELSE rl.reset_at
    END,
    updated_at = v_now
  RETURNING public.request_rate_limits.count, public.request_rate_limits.reset_at
  INTO v_count, v_reset_at;

  RETURN QUERY
  SELECT
    v_count <= p_limit,
    CASE
      WHEN v_count > p_limit THEN 0
      ELSE GREATEST(p_limit - v_count, 0)
    END,
    v_reset_at;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, BIGINT) TO service_role;
