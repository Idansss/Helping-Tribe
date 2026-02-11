import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { paystackVerifyTransaction, verifyPaystackWebhookSignature } from '@/lib/paystack/server'
import { applyPaystackVerification } from '@/lib/paystack/apply'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-paystack-signature')
  const rawBody = await request.text()

  try {
    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Webhook verification is not configured' }, { status: 500 })
  }

  let payload: any = null
  try {
    payload = rawBody ? JSON.parse(rawBody) : null
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const event = String(payload?.event ?? '')
  const reference = payload?.data?.reference ? String(payload.data.reference) : ''

  // Only act on successful charge events and only if a reference is present.
  if (event !== 'charge.success' || !reference) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const { data: payment } = await admin
    .from('payments')
    .select('id, amount_kobo, currency, status, student_id')
    .eq('reference', reference)
    .maybeSingle()

  // If we don't have a matching local payment record, ignore silently.
  if (!payment) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  if (payment.status === 'SUCCESS') {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const verify = await paystackVerifyTransaction(reference)

  await applyPaystackVerification({
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
    markStudentPaid: async (paidAt) => {
      await admin
        .from('students')
        .update({ is_paid: true, paid_at: paidAt, updated_at: new Date().toISOString() })
        .eq('id', payment.student_id)
    },
  })

  return NextResponse.json({ ok: true }, { status: 200 })
}
