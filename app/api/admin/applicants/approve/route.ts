import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { matricToAuthEmail } from '@/lib/auth/constants'
import { isAllowedAdmin } from '@/lib/auth/admin'

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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
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
    const body = ApproveSchema.parse(await request.json())
    const ttlHours = body.tokenTtlHours ?? 72

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch (error) {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' },
        { status: 500 }
      )
    }

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
      const createMessage = createRes.error?.message ?? 'Failed to create student account'
      return NextResponse.json({ error: createMessage }, { status: 500 })
    }

    const studentId = createRes.data.user.id

    try {
      const { error: baseProfileErr } = await admin.from('profiles').upsert({
        id: studentId,
        role: 'student',
        full_name: applicant.full_name_certificate,
      })

      if (baseProfileErr) {
        throw new Error(`Failed to create profile: ${baseProfileErr.message}`)
      }

      // Optional profile columns may not exist on every deployed schema.
      // Keep approval robust by ignoring non-critical column update failures.
      await admin.from('profiles').update({ email: applicant.email }).eq('id', studentId)
      await admin.from('profiles').update({ whatsapp_number: applicant.phone_whatsapp }).eq('id', studentId)
      await admin.from('profiles').update({ matric_number: String(matric) }).eq('id', studentId)

      const { error: studentErr } = await admin.from('students').insert({
        id: studentId,
        applicant_id: applicant.id,
        matric_number: String(matric),
        must_set_password: true,
      })
      if (studentErr) {
        throw new Error(`Failed to create student mapping: ${studentErr.message}`)
      }

      const { error: applicantUpdateErr } = await admin
        .from('applicants')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant.id)
      if (applicantUpdateErr) {
        throw new Error(`Failed to update applicant status: ${applicantUpdateErr.message}`)
      }

      const token = randomToken()
      const tokenHash = sha256(token)
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()

      const { error: tokenErr } = await admin.from('password_setup_tokens').insert({
        token_hash: tokenHash,
        student_id: studentId,
        expires_at: expiresAt,
      })
      if (tokenErr) {
        throw new Error(`Failed to create setup token: ${tokenErr.message}`)
      }

      const setPasswordUrl = `/set-password?token=${encodeURIComponent(token)}`

      return NextResponse.json({
        ok: true,
        matricNumber: String(matric),
        setPasswordUrl,
        expiresAt,
      })
    } catch (error) {
      await admin.auth.admin.deleteUser(studentId)
      console.error('Approve applicant failed:', error)
      return NextResponse.json(
        { error: getErrorMessage(error, 'Failed to approve applicant') },
        { status: 500 }
      )
    }
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    console.error('Approve applicant request failed:', e)
    return NextResponse.json(
      { error: getErrorMessage(e, 'Failed to approve applicant') },
      { status: 500 }
    )
  }
}
