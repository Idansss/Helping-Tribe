-- Site-wide settings (key-value). Used for registration window and future flags.
-- Access only via backend with service role; no RLS so client cannot read/write directly.

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registration window keys: registration_opens_at, registration_closes_at (YYYY-MM-DD).
-- No RLS: API routes use service role to read/update.

COMMENT ON TABLE public.site_settings IS 'App settings (e.g. registration window). Read/write via API only.';
