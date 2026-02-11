import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdmin } from '@/lib/auth/admin'

const SetupLinkSchema = z.object({
  applicantId: z.string().uuid(),
  tokenTtlHours: z.number().int().min(1).max(168).optional(),
})

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function randomToken() {
  return crypto.randomBytes(32).toString('base64url')
}

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
    const body = SetupLinkSchema.parse(await request.json())
    const ttlHours = body.tokenTtlHours ?? 72

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' },
        { status: 500 }
      )
    }

    const { data: applicant, error: applicantErr } = await admin
      .from('applicants')
      .select('id, status')
      .eq('id', body.applicantId)
      .maybeSingle()

    if (applicantErr || !applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    if (applicant.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Setup link is available only for approved applicants' }, { status: 409 })
    }

    const { data: student, error: studentErr } = await admin
      .from('students')
      .select('id, matric_number, is_paid')
      .eq('applicant_id', body.applicantId)
      .maybeSingle()

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student record not found for this applicant' }, { status: 404 })
    }

    if (!student.is_paid) {
      return NextResponse.json(
        { error: 'Payment required before set-password link can be issued' },
        { status: 409 }
      )
    }

    const token = randomToken()
    const tokenHash = sha256(token)
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()

    await admin
      .from('password_setup_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('student_id', student.id)
      .is('used_at', null)

    const { error: tokenErr } = await admin.from('password_setup_tokens').insert({
      token_hash: tokenHash,
      student_id: student.id,
      expires_at: expiresAt,
    })

    if (tokenErr) {
      return NextResponse.json({ error: tokenErr.message || 'Failed to generate setup link' }, { status: 500 })
    }

    const setPasswordUrl = `/set-password?token=${encodeURIComponent(token)}`

    return NextResponse.json({
      ok: true,
      matricNumber: student.matric_number,
      setPasswordUrl,
      expiresAt,
    })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to generate setup link' }, { status: 500 })
  }
}
