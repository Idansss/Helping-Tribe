import type { PaystackVerifyResult } from './server'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export function shouldMarkPaymentSuccess(input: {
  verify: PaystackVerifyResult
  expectedAmountKobo: number
  expectedCurrency: string
}) {
  if (!input.verify.ok) return { ok: false as const, reason: 'verify_not_ok' }
  if (input.verify.status !== 'success') return { ok: false as const, reason: 'not_success' }
  if (input.verify.amountKobo !== input.expectedAmountKobo) return { ok: false as const, reason: 'amount_mismatch' }
  if (String(input.verify.currency || '').toUpperCase() !== String(input.expectedCurrency || '').toUpperCase()) {
    return { ok: false as const, reason: 'currency_mismatch' }
  }
  return { ok: true as const }
}
