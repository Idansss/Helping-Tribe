import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const OPENS_KEY = 'registration_opens_at'
const CLOSES_KEY = 'registration_closes_at'

export async function GET() {
  try {
    const admin = createAdminClient()
    const [opensRes, closesRes] = await Promise.all([
      admin.from('site_settings').select('value').eq('key', OPENS_KEY).maybeSingle(),
      admin.from('site_settings').select('value').eq('key', CLOSES_KEY).maybeSingle(),
    ])
    const opensAt = (opensRes.data?.value as { date?: string } | null)?.date ?? null
    const closesAt = (closesRes.data?.value as { date?: string } | null)?.date ?? null
    return NextResponse.json({ opensAt, closesAt })
  } catch (e) {
    console.error('Registration settings GET:', e)
    return NextResponse.json({ opensAt: null, closesAt: null })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = (profile?.role as string)?.toLowerCase()
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const opensAt = typeof body.opensAt === 'string' ? body.opensAt.trim() || null : null
    const closesAt = typeof body.closesAt === 'string' ? body.closesAt.trim() || null : null

    const admin = createAdminClient()
    if (opensAt !== null) {
      await admin.from('site_settings').upsert(
        { key: OPENS_KEY, value: { date: opensAt }, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
    } else {
      await admin.from('site_settings').delete().eq('key', OPENS_KEY)
    }
    if (closesAt !== null) {
      await admin.from('site_settings').upsert(
        { key: CLOSES_KEY, value: { date: closesAt }, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
    } else {
      await admin.from('site_settings').delete().eq('key', CLOSES_KEY)
    }

    return NextResponse.json({ opensAt: opensAt ?? null, closesAt: closesAt ?? null })
  } catch (e) {
    console.error('Registration settings POST:', e)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
