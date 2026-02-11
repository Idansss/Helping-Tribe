import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { matricToAuthEmail } from '@/lib/auth/constants'

const ApproveSchema = z.object({
  applicantId: z.string().uuid(),
  tokenTtlHours: z.number().int().min(1).max(168).optional(),
})

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function randomToken() {
  return crypto.randomBytes(32).toString('base64url')
}

function randomPassword() {
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

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = ApproveSchema.parse(await request.json())
    const ttlHours = body.tokenTtlHours ?? 72

    const admin = createAdminClient()

    const { data: applicant, error: appErr } = await admin
      .from('applicants')
      .select('*')
      .eq('id', body.applicantId)
      .maybeSingle()

    if (appErr || !applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    if (applicant.status !== 'PENDING') {
      return NextResponse.json({ error: 'Applicant already processed' }, { status: 409 })
    }

    const year = new Date().getFullYear()
    const { data: matric, error: matricErr } = await admin.rpc('next_matric_number', { p_year: year })
    if (matricErr || !matric) {
      return NextResponse.json({ error: 'Failed to generate matric number' }, { status: 500 })
    }

    const email = matricToAuthEmail(String(matric))
    const tempPassword = randomPassword()

    const createRes = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        matric_number: String(matric),
        full_name: applicant.full_name_certificate,
      },
    })

    if (createRes.error || !createRes.data.user) {
      return NextResponse.json({ error: 'Failed to create student account' }, { status: 500 })
    }

    const studentId = createRes.data.user.id

    try {
      await admin.from('profiles').insert({
        id: studentId,
        role: 'student',
        full_name: applicant.full_name_certificate,
        email: applicant.email,
        whatsapp_number: applicant.phone_whatsapp,
        matric_number: String(matric),
      })

      await admin.from('students').insert({
        id: studentId,
        applicant_id: applicant.id,
        matric_number: String(matric),
        must_set_password: true,
      })

      await admin
        .from('applicants')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant.id)

      const token = randomToken()
      const tokenHash = sha256(token)
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()

      await admin.from('password_setup_tokens').insert({
        token_hash: tokenHash,
        student_id: studentId,
        expires_at: expiresAt,
      })

      const setPasswordUrl = `/set-password?token=${encodeURIComponent(token)}`

      return NextResponse.json({
        ok: true,
        matricNumber: String(matric),
        setPasswordUrl,
        expiresAt,
      })
    } catch (e) {
      await admin.auth.admin.deleteUser(studentId)
      return NextResponse.json({ error: 'Failed to approve applicant' }, { status: 500 })
    }
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to approve applicant' }, { status: 500 })
  }
}

