import { createClient } from '@supabase/supabase-js'
import { getServerAuthMissingVars, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabase/env'

export function createAdminClient() {
  const url = getSupabaseUrl()
  const serviceRoleKey = getSupabaseServiceRoleKey()

  if (!url || !serviceRoleKey) {
    const missing = getServerAuthMissingVars()
    throw new Error(`Server auth is not configured. Missing: ${missing.join(', ')}`)
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
