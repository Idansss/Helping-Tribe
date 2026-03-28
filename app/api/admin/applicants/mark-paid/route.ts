import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdmin } from '@/lib/auth/admin'
import { isMissingColumnError, isMissingRelationError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'
import { sendEmail } from '@/lib/email/send'

const MarkPaidSchema = z.object({
  applicantId: z.string().uuid(),
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
    .maybeSingle() as { data: { role: string | null } | null; error: unknown }

  // Only full admins can manually override payment status
  if (!isAllowedAdmin(profile?.role, user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = MarkPaidSchema.parse(await request.json())

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' },
        { status: 500 }
      )
    }

    // Load applicant for email
    const { data: applicant } = await admin
      .from('applicants')
      .select('id, email')
      .eq('id', body.applicantId)
      .maybeSingle()

    // Load student by applicant_id
    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id, matric_number, is_paid')
      .eq('applicant_id', body.applicantId)
      .maybeSingle()

    if (sErr || !student) {
      return NextResponse.json({ error: 'Student record not found for this applicant' }, { status: 404 })
    }

    if (student.is_paid) {
      return NextResponse.json({ ok: true, alreadyPaid: true })
    }

    const paidAt = new Date().toISOString()

    // Mark student as paid
    const { error: stuErr } = await admin
      .from('students')
      .update({ is_paid: true, paid_at: paidAt, updated_at: paidAt })
      .eq('id', student.id)

    if (stuErr) {
      if (isMissingColumnError(stuErr, 'is_paid') || isMissingColumnError(stuErr, 'paid_at')) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }
      throw new Error(stuErr.message)
    }

    // Also update the latest PENDING/FAILED payment to SUCCESS if one exists
    const { data: latestPayment, error: pErr } = await admin
      .from('payments')
      .select('id, status')
      .eq('student_id', student.id)
      .in('status', ['PENDING', 'FAILED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pErr && (isMissingRelationError(pErr, 'payments') || isMissingColumnError(pErr, 'status'))) {
      return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
    }

    if (latestPayment) {
      await admin
        .from('payments')
        .update({
          status: 'SUCCESS',
          paid_at: paidAt,
          raw_paystack_response: { manual_override: true, override_by: user.id, override_at: paidAt },
        })
        .eq('id', latestPayment.id)
    }

    // Auto-generate and send set-password link
    let setPasswordUrl: string | null = null
    let expiresAt: string | null = null
    try {
      const ttlHours = 72
      const token = randomToken()
      const tokenHash = sha256(token)
      expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()

      // Expire any existing unused tokens
      await admin
        .from('password_setup_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('student_id', student.id)
        .is('used_at', null)

      await admin.from('password_setup_tokens').insert({
        token_hash: tokenHash,
        student_id: student.id,
        expires_at: expiresAt,
      })

      const relativeUrl = `/student/set-password?token=${encodeURIComponent(token)}`
      const baseUrl = (process.env.BASE_URL || '').replace(/\/$/, '')
      setPasswordUrl = baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl

      const recipientEmail = applicant?.email || `student+${student.id}@helpingtribe.local`
      const subject = `${PROGRAM_FULL_NAME}: set your password`
      const emailBody = [
        'Your payment has been verified.',
        `Use this one-time set-password link: ${setPasswordUrl}`,
        `Matric Number: ${student.matric_number}`,
        `This link expires on ${new Date(expiresAt).toLocaleString()}.`,
      ].join('\n')

      const { data: outboxRow } = await admin.from('email_outbox').insert({
        recipient_email: recipientEmail,
        applicant_id: applicant?.id ?? null,
        student_id: student.id,
        kind: 'SET_PASSWORD',
        subject,
        body: emailBody,
      }).select('id').maybeSingle()

      const sendResult = await sendEmail({ to: recipientEmail, subject, body: emailBody, outboxId: outboxRow?.id })
      if (!sendResult.ok) {
        console.warn('[mark-paid] Set-password email not sent:', sendResult.error)
      }
    } catch (emailErr) {
      // Don't fail the whole request if email sending fails — payment is already marked
      console.warn('[mark-paid] Failed to auto-send set-password link:', emailErr)
    }

    return NextResponse.json({ ok: true, paidAt, setPasswordUrl, expiresAt })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to mark payment as paid' }, { status: 500 })
  }
}
