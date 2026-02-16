export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || ''
}

export function getServerAuthMissingVars() {
  const missing: string[] = []
  if (!getSupabaseUrl()) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)')
  }
  if (!getSupabaseServiceRoleKey()) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE)')
  }
  return missing
}

