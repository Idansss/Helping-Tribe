import type { SupabaseClient } from '@supabase/supabase-js'

const OPENS_KEY = 'registration_opens_at'
const CLOSES_KEY = 'registration_closes_at'

export type RegistrationWindow = {
  opensAt: string | null
  closesAt: string | null
}

export async function getRegistrationWindow(
  admin: SupabaseClient
): Promise<RegistrationWindow> {
  const [opensRes, closesRes] = await Promise.all([
    admin.from('site_settings').select('value').eq('key', OPENS_KEY).maybeSingle(),
    admin.from('site_settings').select('value').eq('key', CLOSES_KEY).maybeSingle(),
  ])
  const opensAt = (opensRes.data?.value as { date?: string } | null)?.date ?? null
  const closesAt = (closesRes.data?.value as { date?: string } | null)?.date ?? null
  return { opensAt, closesAt }
}

export function isRegistrationOpen(
  window: RegistrationWindow,
  today: string = new Date().toISOString().slice(0, 10)
): { allowed: boolean; message?: string } {
  const { opensAt, closesAt } = window
  if (opensAt && today < opensAt) {
    return { allowed: false, message: 'Registration has not opened yet.' }
  }
  if (closesAt && today > closesAt) {
    return { allowed: false, message: 'Registration is closed.' }
  }
  return { allowed: true }
}
