import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdmin } from '@/lib/auth/admin'

const UnlockWeekSchema = z.object({
  studentId: z.string().uuid(),
  weekNumber: z.number().int().min(1).max(9),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string | null } | null; error: unknown }

  if (!isAllowedAdmin(profile?.role, user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = UnlockWeekSchema.parse(await request.json())

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 })
    }

    // To let the student access Week N, the previous week must be 100% complete.
    if (body.weekNumber <= 1) {
      return NextResponse.json({ ok: true, weekNumber: body.weekNumber, note: 'Week 1 has no prerequisite' })
    }

    const prevWeek = body.weekNumber - 1
    const { data: mod, error: modErr } = await admin
      .from('modules')
      .select('id')
      .eq('week_number', prevWeek)
      .maybeSingle()

    if (modErr || !mod) {
      return NextResponse.json({ error: `No module found for Week ${prevWeek}` }, { status: 404 })
    }

    // Mark previous week complete so Week N unlocks
    const now = new Date().toISOString()
    const { error: upsertErr } = await admin
      .from('module_progress')
      .upsert({
        user_id: body.studentId,
        module_id: mod.id,
        is_completed: true,
        completed: true,
        progress: 100,
        completed_at: now,
        updated_at: now,
      }, { onConflict: 'user_id,module_id' })

    if (upsertErr) {
      throw new Error(upsertErr.message)
    }

    return NextResponse.json({ ok: true, weekNumber: body.weekNumber })
  } catch (e: any) {
    if (e?.name === 'ZodError') return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    return NextResponse.json({ error: e?.message || 'Failed to unlock week' }, { status: 500 })
  }
}
