import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAllowedAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  getLearnerOnboardingSettings,
  hasLearnerOnboardingVideos,
  normalizeLearnerOnboardingSettings,
  serializeLearnerOnboardingSettings,
  LEARNER_ONBOARDING_SETTINGS_KEY,
} from '@/lib/settings/learner-onboarding'

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const LearnerOnboardingVideoSchema = z.object({
  title: z.string().trim().max(120),
  description: z.string().trim().max(400),
  url: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => value === '' || isValidHttpUrl(value), {
      message: 'Video URL must be a valid http or https URL.',
    }),
})

const LearnerOnboardingSettingsSchema = z.object({
  welcomeVideo: LearnerOnboardingVideoSchema,
  portalGuideVideo: LearnerOnboardingVideoSchema,
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
    const settings = await getLearnerOnboardingSettings(admin)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Learner onboarding settings GET:', error)
    return NextResponse.json(
      { error: 'Failed to load learner onboarding settings' },
      { status: 500 }
    )
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
      parsed = LearnerOnboardingSettingsSchema.parse(await request.json())
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.issues[0]?.message || 'Invalid learner onboarding payload' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const normalized = normalizeLearnerOnboardingSettings(parsed)
    const admin = createAdminClient()

    if (!hasLearnerOnboardingVideos(normalized)) {
      await admin
        .from('site_settings')
        .delete()
        .eq('key', LEARNER_ONBOARDING_SETTINGS_KEY)
    } else {
      await admin.from('site_settings').upsert(
        {
          key: LEARNER_ONBOARDING_SETTINGS_KEY,
          value: serializeLearnerOnboardingSettings(normalized),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Learner onboarding settings POST:', error)
    return NextResponse.json(
      { error: 'Failed to save learner onboarding settings' },
      { status: 500 }
    )
  }
}
