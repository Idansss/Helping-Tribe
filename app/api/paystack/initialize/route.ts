import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePortalRole } from '@/lib/auth/admin'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'
import { sendEmail } from '@/lib/email/send'
import { HELP_FOUNDATIONAL_COURSE } from '@/lib/payments/helpFoundationalCourse'
import {
  getExpectedCourseTotalKobo,
  getHalfPaymentAmountKobo,
  getPaymentDiscountInfo,
  resolvePaymentRequest,
  syncStudentPaymentState,
  type PaymentPlan,
} from '@/lib/payments/student-status'
import { createPaystackReference, paystackInitializeTransaction } from '@/lib/paystack/server'
import { isMissingColumnError, isMissingRelationError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'
import { getRegistrationWindow, isRegistrationOpen } from '@/lib/settings/registration'
import { getPublicSiteBaseUrl } from '@/lib/server/public-site-url'

const InitializeSchema = z.object({
  studentId: z.string().uuid().optional(),
  applicantId: z.string().uuid().optional(),
  paymentOption: z.enum(['FULL', 'HALF', 'BALANCE']).optional(),
})

function safeBaseUrl(request: NextRequest) {
  return getPublicSiteBaseUrl(request)
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

  const portalRole = resolvePortalRole(profile?.role ?? null, user.email)
  const role = String(profile?.role ?? '').toLowerCase()
  const isStaff = portalRole === 'admin' || portalRole === 'mentor'
  const isStudent = role === 'student'

  if (!isStaff && !isStudent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = InitializeSchema.parse(await request.json())

    let studentId = body.studentId
    let applicantId = body.applicantId

    if (isStudent) {
      studentId = user.id
      applicantId = undefined
    }

    if (!studentId && !applicantId) {
      return NextResponse.json({ error: 'Missing studentId or applicantId' }, { status: 400 })
    }

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' },
        { status: 500 }
      )
    }

    let student: any = null
    let applicant: any = null

    if (studentId) {
      const { data: s, error: sErr } = await admin
        .from('students')
        .select('id, applicant_id, matric_number, is_paid, is_fully_paid, payment_status, amount_paid_kobo, expected_total_fee_kobo, balance_due_kobo')
        .eq('id', studentId)
        .maybeSingle()

      if (
        sErr &&
        (isMissingColumnError(sErr, 'is_paid') ||
          isMissingColumnError(sErr, 'is_fully_paid') ||
          isMissingColumnError(sErr, 'payment_status'))
      ) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }

      if (sErr || !s) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
      student = s
      applicantId = s.applicant_id ?? undefined
    } else if (applicantId) {
      const { data: s, error: sErr } = await admin
        .from('students')
        .select('id, applicant_id, matric_number, is_paid, is_fully_paid, payment_status, amount_paid_kobo, expected_total_fee_kobo, balance_due_kobo')
        .eq('applicant_id', applicantId)
        .maybeSingle()

      if (
        sErr &&
        (isMissingColumnError(sErr, 'is_paid') ||
          isMissingColumnError(sErr, 'is_fully_paid') ||
          isMissingColumnError(sErr, 'payment_status'))
      ) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }

      if (sErr || !s) {
        return NextResponse.json({ error: 'Applicant is not approved yet' }, { status: 409 })
      }
      student = s
      studentId = s.id
    }

    if (student?.is_fully_paid) {
      return NextResponse.json({ error: 'Student is already fully paid' }, { status: 409 })
    }

    if (applicantId) {
      const { data: a, error: aErr } = await admin
        .from('applicants')
        .select('id, email, status, full_name_certificate')
        .eq('id', applicantId)
        .maybeSingle()

      if (aErr || !a) {
        return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
      }
      applicant = a
    }

    const registrationWindow = await getRegistrationWindow(admin)
    const { allowed: registrationOpen, message: registrationMessage } = isRegistrationOpen(registrationWindow)
    if (!registrationOpen) {
      return NextResponse.json(
        { error: registrationMessage ?? 'Registration is closed.' },
        { status: 409 }
      )
    }

    const expectedTotalFeeKobo =
      Number(student?.expected_total_fee_kobo ?? 0) > 0
        ? Number(student.expected_total_fee_kobo)
        : getExpectedCourseTotalKobo()

    const amountPaidKobo = Math.max(0, Number(student?.amount_paid_kobo ?? 0))
    const requestedPaymentOption: PaymentPlan =
      body.paymentOption ??
      (amountPaidKobo > 0 ? 'BALANCE' : 'FULL')

    let paymentRequest
    try {
      paymentRequest = resolvePaymentRequest({
        amountPaidKobo,
        expectedTotalFeeKobo,
        paymentOption: requestedPaymentOption,
      })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to initialize payment' },
        { status: 409 }
      )
    }

    const discountInfo = getPaymentDiscountInfo(paymentRequest.expectedTotalFeeKobo)

    await admin
      .from('students')
      .update({
        balance_due_kobo: Math.max(0, paymentRequest.expectedTotalFeeKobo - amountPaidKobo),
        expected_total_fee_kobo: paymentRequest.expectedTotalFeeKobo,
        payment_status: amountPaidKobo > 0 ? 'PARTIAL' : 'UNPAID',
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)

    const payEmail =
      (applicant?.email && String(applicant.email).trim()) ||
      `noemail+${studentId}@helpingtribe.local`

    const reference = createPaystackReference('HELPFOUND')
    const callbackUrl = `${safeBaseUrl(request)}/apply?payment=paystack`

    const { error: insertErr } = await admin.from('payments').insert({
      applicant_id: applicantId ?? null,
      student_id: studentId ?? null,
      reference,
      amount_kobo: paymentRequest.amountKobo,
      currency: HELP_FOUNDATIONAL_COURSE.currency,
      status: 'PENDING',
      discount_applied: discountInfo.discountApplied,
      discount_percent: discountInfo.discountPercent,
      expected_total_fee_kobo: paymentRequest.expectedTotalFeeKobo,
      payment_plan: paymentRequest.paymentPlan,
    })

    if (insertErr) {
      if (
        isMissingRelationError(insertErr, 'payments') ||
        isMissingColumnError(insertErr, 'amount_kobo') ||
        isMissingColumnError(insertErr, 'expected_total_fee_kobo') ||
        isMissingColumnError(insertErr, 'payment_plan')
      ) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }
      return NextResponse.json({ error: `Failed to create payment record: ${insertErr.message}` }, { status: 500 })
    }

    try {
      const init = await paystackInitializeTransaction({
        email: payEmail,
        amountKobo: paymentRequest.amountKobo,
        currency: HELP_FOUNDATIONAL_COURSE.currency,
        reference,
        callbackUrl,
        metadata: {
          purpose: 'HELP_FOUNDATIONAL_COURSE',
          studentId,
          applicantId,
          discountApplied: discountInfo.discountApplied,
          discountPercent: discountInfo.discountPercent ?? HELP_FOUNDATIONAL_COURSE.earlyBirdDiscountPercent,
          paymentOption: paymentRequest.paymentPlan,
          amountPaidBeforeKobo: amountPaidKobo,
          balanceAfterKobo: Math.max(0, paymentRequest.expectedTotalFeeKobo - amountPaidKobo - paymentRequest.amountKobo),
          expectedTotalFeeKobo: paymentRequest.expectedTotalFeeKobo,
        },
      })

      await admin
        .from('payments')
        .update({ raw_paystack_response: init.raw })
        .eq('reference', reference)

      const recipientEmail =
        applicant?.email &&
        String(applicant.email).trim() &&
        !String(applicant.email).startsWith('noemail+')
          ? String(applicant.email).trim()
          : null

      if (applicantId && recipientEmail && init.authorizationUrl) {
        const subject = `${PROGRAM_FULL_NAME}: your payment link`
        const paymentLabel =
          paymentRequest.paymentPlan === 'HALF'
            ? 'first installment'
            : paymentRequest.paymentPlan === 'BALANCE'
              ? 'outstanding balance'
              : 'full payment'
        const body = [
          applicant?.full_name_certificate ? `Hello ${applicant.full_name_certificate},` : 'Hello,',
          '',
          `Your matric number: ${student?.matric_number ?? '—'}.`,
          `This link is for your ${paymentLabel}: NGN ${(paymentRequest.amountKobo / 100).toLocaleString()}.`,
          `Total course fee on your record: NGN ${(paymentRequest.expectedTotalFeeKobo / 100).toLocaleString()}.`,
          amountPaidKobo > 0 ? `Amount already paid: NGN ${(amountPaidKobo / 100).toLocaleString()}.` : null,
          '',
          'Pay securely here:',
          init.authorizationUrl,
          '',
          paymentRequest.paymentPlan !== 'FULL'
            ? 'Note: your certificate will only be released after the full course fee is paid.'
            : null,
          'If you have any questions, contact admissions.',
        ].filter(Boolean).join('\n')

        const { data: outboxRow } = await admin.from('email_outbox').insert({
          recipient_email: recipientEmail,
          applicant_id: applicantId,
          student_id: studentId,
          kind: 'PAYMENT_LINK',
          subject,
          body,
        }).select('id').maybeSingle()

        const sendResult = await sendEmail({ to: recipientEmail, subject, body, outboxId: outboxRow?.id })
        if (!sendResult.ok) {
          console.warn('[paystack/initialize] Payment link email not sent:', sendResult.error)
        }
      }

      return NextResponse.json({
        ok: true,
        courseTitle: HELP_FOUNDATIONAL_COURSE.title,
        currency: HELP_FOUNDATIONAL_COURSE.currency,
        totalFeeNgn: paymentRequest.expectedTotalFeeKobo / 100,
        totalFeeKobo: paymentRequest.expectedTotalFeeKobo,
        amountNgn: paymentRequest.amountKobo / 100,
        amountKobo: paymentRequest.amountKobo,
        amountPaidNgn: amountPaidKobo / 100,
        amountPaidKobo,
        balanceDueNgn: Math.max(0, paymentRequest.expectedTotalFeeKobo - amountPaidKobo) / 100,
        balanceDueKobo: Math.max(0, paymentRequest.expectedTotalFeeKobo - amountPaidKobo),
        discountApplied: discountInfo.discountApplied,
        discountPercent: discountInfo.discountPercent,
        paymentOption: paymentRequest.paymentPlan,
        paymentStatus: amountPaidKobo > 0 ? 'PARTIAL' : 'UNPAID',
        reference,
        authorizationUrl: init.authorizationUrl,
        accessCode: init.accessCode,
        halfAmountNgn: getHalfPaymentAmountKobo(paymentRequest.expectedTotalFeeKobo) / 100,
      })
    } catch (error: any) {
      await admin
        .from('payments')
        .update({
          status: 'FAILED',
          raw_paystack_response: {
            error: error?.message || 'Paystack initialize failed',
            raw: error?.raw ?? null,
          },
        })
        .eq('reference', reference)

      if (studentId) {
        await syncStudentPaymentState(admin, studentId).catch(() => null)
      }

      return NextResponse.json({ error: error?.message || 'Failed to initialize payment' }, { status: 502 })
    }
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to initialize payment' }, { status: 500 })
  }
}
