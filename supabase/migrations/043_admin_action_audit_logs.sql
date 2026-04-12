CREATE TABLE IF NOT EXISTS public.admin_action_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_action_audit_logs_created_at
  ON public.admin_action_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_action_audit_logs_actor_created_at
  ON public.admin_action_audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_action_audit_logs_target_created_at
  ON public.admin_action_audit_logs (target_user_id, created_at DESC);

ALTER TABLE public.admin_action_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_action_audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON public.admin_action_audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role::text = 'admin'
  ));

REVOKE INSERT, UPDATE, DELETE ON TABLE public.admin_action_audit_logs FROM anon, authenticated;
