import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAllowedAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  getCourseAccessSettings,
  normalizeManualUnlockedWeeks,
  serializeCourseAccessSettings,
} from '@/lib/settings/course-access'

const CourseAccessSettingsSchema = z.object({
  manualUnlockedWeeks: z.array(z.number().int().min(1).max(9)).max(9),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const settings = await getCourseAccessSettings(admin)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Course access settings GET:', error)
    return NextResponse.json({ manualUnlockedWeeks: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()) as { data: { role: string | null } | null; error: unknown }

    if (!isAllowedAdmin(profile?.role, user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let parsed
    try {
      const body = await request.json()
      parsed = CourseAccessSettingsSchema.parse({
        manualUnlockedWeeks: normalizeManualUnlockedWeeks(body?.manualUnlockedWeeks ?? []),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid course access payload' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const admin = createAdminClient()
    const normalizedWeeks = normalizeManualUnlockedWeeks(parsed.manualUnlockedWeeks)

    if (normalizedWeeks.length === 0) {
      await admin.from('site_settings').delete().eq('key', 'manual_unlocked_weeks')
    } else {
      await admin.from('site_settings').upsert(
        {
          key: 'manual_unlocked_weeks',
          value: serializeCourseAccessSettings({ manualUnlockedWeeks: normalizedWeeks }),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
    }

    return NextResponse.json({ manualUnlockedWeeks: normalizedWeeks })
  } catch (error) {
    console.error('Course access settings POST:', error)
    return NextResponse.json({ error: 'Failed to save course access settings' }, { status: 500 })
  }
}
