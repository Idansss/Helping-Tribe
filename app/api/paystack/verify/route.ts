import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePortalRole } from '@/lib/auth/admin'
import { syncStudentPaymentState } from '@/lib/payments/student-status'
import { paystackVerifyTransaction } from '@/lib/paystack/server'
import { applyPaystackVerification } from '@/lib/paystack/apply'
import { isMissingColumnError, isMissingRelationError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'

const VerifySchema = z.object({
  reference: z.string().min(6),
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
    .maybeSingle() as { data: { role: string | null } | null; error: unknown }

  const portalRole = resolvePortalRole(profile?.role ?? null, user.email)
  const isStaff = portalRole === 'admin' || portalRole === 'mentor'

  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = VerifySchema.parse(await request.json())
    const reference = body.reference.trim()

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' },
        { status: 500 }
      )
    }

    const { data: payment, error: pErr } = await admin
      .from('payments')
      .select('id, reference, amount_kobo, currency, status, student_id')
      .eq('reference', reference)
      .maybeSingle()

    if (pErr && (isMissingRelationError(pErr, 'payments') || isMissingColumnError(pErr, 'amount_kobo'))) {
      return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
    }

    if (pErr || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ ok: true, status: 'SUCCESS', reference })
    }

    const verify = await paystackVerifyTransaction(reference)
    const applied = await applyPaystackVerification({
      payment: {
        id: payment.id,
        expectedAmountKobo: Number(payment.amount_kobo),
        expectedCurrency: String(payment.currency || 'NGN'),
        studentId: payment.student_id ?? null,
      },
      verify,
      updatePayment: async (patch) => {
        await admin
          .from('payments')
          .update({
            status: patch.status,
            paid_at: patch.status === 'SUCCESS' ? (patch.paidAt ?? null) : null,
            raw_paystack_response: patch.raw,
          })
          .eq('id', payment.id)
      },
      syncStudentPaymentState: async () => {
        if (!payment.student_id) return null
        try {
          return await syncStudentPaymentState(admin, payment.student_id)
        } catch (error: any) {
          if (
            String(error?.message ?? '').toLowerCase().includes('payment_status') ||
            String(error?.message ?? '').toLowerCase().includes('expected_total_fee_kobo') ||
            String(error?.message ?? '').toLowerCase().includes('is_fully_paid')
          ) {
            throw new Error(missingPaymentsSchemaMessage())
          }
          throw error
        }
      },
    })

    if (!applied.ok) {
      return NextResponse.json(
        { ok: false, reference, reason: applied.reason, paystackStatus: applied.paystackStatus },
        { status: 409 }
      )
    }

    return NextResponse.json({
      ok: true,
      status: 'SUCCESS',
      reference,
      paidAt: applied.paidAt,
      paymentStatus: applied.paymentSummary?.paymentStatus ?? null,
      amountPaidKobo: applied.paymentSummary?.amountPaidKobo ?? null,
      balanceDueKobo: applied.paymentSummary?.balanceDueKobo ?? null,
      isFullyPaid: applied.paymentSummary?.isFullyPaid ?? null,
    })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to verify payment' }, { status: 500 })
  }
}
