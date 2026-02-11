import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePortalRole } from '@/lib/auth/admin'
import { computeHelpFoundationalCoursePricing, HELP_FOUNDATIONAL_COURSE } from '@/lib/payments/helpFoundationalCourse'
import { createPaystackReference, paystackInitializeTransaction } from '@/lib/paystack/server'
import { isMissingColumnError, isMissingRelationError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'

const InitializeSchema = z.object({
  studentId: z.string().uuid().optional(),
  applicantId: z.string().uuid().optional(),
})

function safeBaseUrl(request: NextRequest) {
  return process.env.BASE_URL || request.nextUrl.origin
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

  const portalRole = resolvePortalRole((profile as any)?.role, user.email)
  const role = String((profile as any)?.role ?? '').toLowerCase()
  const isStaff = portalRole === 'admin' || portalRole === 'mentor'
  const isStudent = role === 'student'

  if (!isStaff && !isStudent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = InitializeSchema.parse(await request.json())

    let studentId = body.studentId
    let applicantId = body.applicantId

    // Students can only initialize payments for themselves.
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
        .select('id, applicant_id, matric_number, is_paid')
        .eq('id', studentId)
        .maybeSingle()

      if (sErr && isMissingColumnError(sErr, 'is_paid')) {
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
        .select('id, applicant_id, matric_number, is_paid')
        .eq('applicant_id', applicantId)
        .maybeSingle()

      if (sErr && isMissingColumnError(sErr, 'is_paid')) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }

      if (sErr || !s) {
        return NextResponse.json({ error: 'Applicant is not approved yet' }, { status: 409 })
      }
      student = s
      studentId = s.id
    }

    if (student?.is_paid) {
      return NextResponse.json({ error: 'Student is already marked as paid' }, { status: 409 })
    }

    if (applicantId) {
      const { data: a, error: aErr } = await admin
        .from('applicants')
        .select('id, email, status')
        .eq('id', applicantId)
        .maybeSingle()

      if (aErr || !a) {
        return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
      }
      applicant = a
    }

    const pricing = computeHelpFoundationalCoursePricing()
    if (pricing.phase === 'CLOSED') {
      return NextResponse.json(
        { error: 'Registration closed 28th February 2026' },
        { status: 409 }
      )
    }

    const payEmail =
      (applicant?.email && String(applicant.email).trim()) ||
      `noemail+${studentId}@helpingtribe.local`

    const reference = createPaystackReference('HELPFOUND')
    const callbackUrl = `${safeBaseUrl(request)}/apply?payment=paystack`

    const { error: insertErr } = await admin.from('payments').insert({
      applicant_id: applicantId ?? null,
      student_id: studentId ?? null,
      reference,
      amount_kobo: pricing.amountKobo,
      currency: HELP_FOUNDATIONAL_COURSE.currency,
      status: 'PENDING',
      discount_applied: pricing.discountApplied,
      discount_percent: pricing.discountApplied ? pricing.discountPercent : null,
    })

    if (insertErr) {
      if (isMissingRelationError(insertErr, 'payments') || isMissingColumnError(insertErr, 'amount_kobo')) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }
      return NextResponse.json({ error: `Failed to create payment record: ${insertErr.message}` }, { status: 500 })
    }

    try {
      const init = await paystackInitializeTransaction({
        email: payEmail,
        amountKobo: pricing.amountKobo,
        currency: HELP_FOUNDATIONAL_COURSE.currency,
        reference,
        callbackUrl,
        metadata: {
          purpose: 'HELP_FOUNDATIONAL_COURSE',
          studentId,
          applicantId,
          discountApplied: pricing.discountApplied,
          discountPercent: pricing.discountPercent,
          todayLagos: pricing.todayLagos,
        },
      })

      await admin
        .from('payments')
        .update({ raw_paystack_response: init.raw })
        .eq('reference', reference)

      return NextResponse.json({
        ok: true,
        courseTitle: HELP_FOUNDATIONAL_COURSE.title,
        currency: HELP_FOUNDATIONAL_COURSE.currency,
        baseFeeNgn: pricing.baseFeeNgn,
        discountApplied: pricing.discountApplied,
        discountPercent: pricing.discountPercent,
        amountNgn: pricing.amountNgn,
        amountKobo: pricing.amountKobo,
        pricingPhase: pricing.phase,
        earlyBirdClosesDate: HELP_FOUNDATIONAL_COURSE.earlyBirdClosesDate,
        earlyBirdClosesLabel: HELP_FOUNDATIONAL_COURSE.earlyBirdClosesLabel,
        registrationClosesDate: HELP_FOUNDATIONAL_COURSE.registrationClosesDate,
        registrationClosesLabel: HELP_FOUNDATIONAL_COURSE.registrationClosesLabel,
        classBeginsDate: HELP_FOUNDATIONAL_COURSE.classBeginsDate,
        classBeginsLabel: HELP_FOUNDATIONAL_COURSE.classBeginsLabel,
        reference,
        authorizationUrl: init.authorizationUrl,
        accessCode: init.accessCode,
      })
    } catch (error: any) {
      await admin
        .from('payments')
        .update({
          status: 'FAILED',
          raw_paystack_response: {
            error: error?.message || 'Paystack initialize failed',
            raw: (error as any)?.raw ?? null,
          },
        })
        .eq('reference', reference)

      return NextResponse.json({ error: error?.message || 'Failed to initialize payment' }, { status: 502 })
    }
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to initialize payment' }, { status: 500 })
  }
}
