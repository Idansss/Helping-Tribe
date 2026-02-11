import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdmin } from '@/lib/auth/admin'

const RejectSchema = z.object({
  applicantId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!isAllowedAdmin(profile?.role, user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = RejectSchema.parse(await request.json())
    const admin = createAdminClient()

    const { data: applicant, error: appErr } = await admin
      .from('applicants')
      .select('id, status')
      .eq('id', body.applicantId)
      .maybeSingle()

    if (appErr || !applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    if (applicant.status !== 'PENDING') {
      return NextResponse.json({ error: 'Applicant already processed' }, { status: 409 })
    }

    const { error } = await admin
      .from('applicants')
      .update({
        status: 'REJECTED',
        rejected_at: new Date().toISOString(),
        rejected_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.applicantId)

    if (error) {
      return NextResponse.json({ error: 'Failed to reject applicant' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to reject applicant' }, { status: 500 })
  }
}
