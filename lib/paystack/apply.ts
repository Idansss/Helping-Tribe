import type { PaystackVerifyResult } from './server'
import { shouldMarkPaymentSuccess } from './verification'
import type { PaymentSummary } from '@/lib/payments/student-status'

export async function applyPaystackVerification(input: {
  payment: {
    id: string
    expectedAmountKobo: number
    expectedCurrency: string
    studentId: string | null
  }
  verify: PaystackVerifyResult
  updatePayment: (patch: { status: 'FAILED' | 'SUCCESS'; paidAt?: string | null; raw: unknown }) => Promise<void>
  syncStudentPaymentState: () => Promise<PaymentSummary | null>
}) {
  const decision = shouldMarkPaymentSuccess({
    verify: input.verify,
    expectedAmountKobo: input.payment.expectedAmountKobo,
    expectedCurrency: input.payment.expectedCurrency,
  })

  if (!decision.ok) {
    await input.updatePayment({ status: 'FAILED', paidAt: null, raw: input.verify.raw })
    return { ok: false as const, reason: decision.reason, paystackStatus: input.verify.status }
  }

  const paidAt = input.verify.paidAt || new Date().toISOString()

  await input.updatePayment({ status: 'SUCCESS', paidAt, raw: input.verify.raw })
  const paymentSummary = input.payment.studentId ? await input.syncStudentPaymentState() : null

  return { ok: true as const, paidAt, paymentSummary }
}
