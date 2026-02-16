import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

const ResumeSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers)
    const limit = checkRateLimit({
      key: `apply-resume:${ip}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again shortly.' },
        { status: 429 }
      )
    }

    const payload = ResumeSchema.parse(await request.json())
    const email = payload.email.trim().toLowerCase()
    const admin = createAdminClient()

    const { data: latestDraft } = await admin
      .from('application_drafts')
      .select('id, status, updated_at')
      .eq('email', email)
      .eq('status', 'DRAFT')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: latestApplication } = await admin
      .from('applicants')
      .select('id, status, created_at')
      .eq('email', email)
      .in('status', ['PENDING', 'APPROVED', 'REJECTED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      draft: latestDraft
        ? {
            id: latestDraft.id,
            status: latestDraft.status,
            updatedAt: latestDraft.updated_at,
          }
        : null,
      application: latestApplication
        ? {
            id: latestApplication.id,
            status: latestApplication.status,
            createdAt: latestApplication.created_at,
          }
        : null,
    })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    return NextResponse.json({ error: error?.message || 'Unable to resume application' }, { status: 500 })
  }
}
