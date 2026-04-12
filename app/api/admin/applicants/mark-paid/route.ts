import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdmin } from '@/lib/auth/admin'
import { missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'
import { sendEmail } from '@/lib/email/send'
import { absolutePublicUrl } from '@/lib/server/public-site-url'
import {
  getExpectedCourseTotalKobo,
  getPaymentDiscountInfo,
  resolvePaymentRequest,
  syncStudentPaymentState,
  type PaymentPlan,
} from '@/lib/payments/student-status'

const MarkPaidSchema = z.object({
  applicantId: z.string().uuid(),
  paymentOption: z.enum(['FULL', 'HALF', 'BALANCE']).optional(),
})

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function randomToken() {
  return crypto.randomBytes(32).toString('base64url')
}

function createManualPaymentReference(studentId: string) {
  return `MANUAL-${studentId.slice(0, 8).toUpperCase()}-${Date.now()}`
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

    const { data: applicant } = await admin
      .from('applicants')
      .select('id, email')
      .eq('id', body.applicantId)
      .maybeSingle()

    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id, matric_number, is_paid, is_fully_paid, amount_paid_kobo, expected_total_fee_kobo, must_set_password')
      .eq('applicant_id', body.applicantId)
      .maybeSingle()

    if (sErr || !student) {
      return NextResponse.json({ error: 'Student record not found for this applicant' }, { status: 404 })
    }

    if (student.is_fully_paid) {
      return NextResponse.json({ ok: true, alreadyPaid: true, paymentStatus: 'FULL' })
    }

    const requestedPaymentOption: PaymentPlan =
      body.paymentOption ??
      (Number(student.amount_paid_kobo ?? 0) > 0 ? 'BALANCE' : 'FULL')

    let paymentRequest
    try {
      paymentRequest = resolvePaymentRequest({
        amountPaidKobo: Math.max(0, Number(student.amount_paid_kobo ?? 0)),
        expectedTotalFeeKobo:
          Number(student.expected_total_fee_kobo ?? 0) > 0
            ? Number(student.expected_total_fee_kobo)
            : getExpectedCourseTotalKobo(),
        paymentOption: requestedPaymentOption,
      })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to record payment' },
        { status: 409 }
      )
    }

    const paidAt = new Date().toISOString()
    const discountInfo = getPaymentDiscountInfo(paymentRequest.expectedTotalFeeKobo)

    const { error: paymentErr } = await admin.from('payments').insert({
      applicant_id: body.applicantId,
      student_id: student.id,
      reference: createManualPaymentReference(student.id),
      amount_kobo: paymentRequest.amountKobo,
      currency: 'NGN',
      status: 'SUCCESS',
      paid_at: paidAt,
      discount_applied: discountInfo.discountApplied,
      discount_percent: discountInfo.discountPercent,
      expected_total_fee_kobo: paymentRequest.expectedTotalFeeKobo,
      payment_plan: paymentRequest.paymentPlan,
      raw_paystack_response: {
        manual_override: true,
        override_by: user.id,
        override_at: paidAt,
      },
    })

    if (paymentErr) {
      const message = String(paymentErr.message || '').toLowerCase()
      if (
        message.includes('payment_status') ||
        message.includes('expected_total_fee_kobo') ||
        message.includes('payment_plan') ||
        message.includes('amount_kobo')
      ) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }
      throw new Error(paymentErr.message)
    }

    const paymentSummary = await syncStudentPaymentState(admin, student.id)

    let setPasswordUrl: string | null = null
    let expiresAt: string | null = null
    if (!student.is_paid && paymentSummary.isPaid && student.must_set_password) {
      try {
        const ttlHours = 72
        const token = randomToken()
        const tokenHash = sha256(token)
        expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()

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
        setPasswordUrl = absolutePublicUrl(request, relativeUrl)

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
        console.warn('[mark-paid] Failed to auto-send set-password link:', emailErr)
      }
    }

    return NextResponse.json({
      ok: true,
      paidAt,
      paymentOption: paymentRequest.paymentPlan,
      paymentStatus: paymentSummary.paymentStatus,
      amountPaidKobo: paymentSummary.amountPaidKobo,
      balanceDueKobo: paymentSummary.balanceDueKobo,
      expectedTotalFeeKobo: paymentSummary.expectedTotalFeeKobo,
      isFullyPaid: paymentSummary.isFullyPaid,
      setPasswordUrl,
      expiresAt,
    })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to mark payment as paid' }, { status: 500 })
  }
}
