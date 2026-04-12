import { describe, expect, it, vi } from 'vitest'
import { applyPaystackVerification } from '../lib/paystack/apply'

function verifyResult(overrides: Partial<any> = {}) {
  return {
    ok: true,
    status: 'success',
    reference: 'REF-123',
    amountKobo: 16575000,
    currency: 'NGN',
    paidAt: '2026-02-11T10:00:00.000Z',
    gatewayResponse: 'Approved',
    raw: { status: true },
    ...overrides,
  }
}

describe('paystack verification gate', () => {
  it('does not sync student payment state when verify is not success', async () => {
    const updatePayment = vi.fn(async () => {})
    const syncStudentPaymentState = vi.fn(async () => null)

    const res = await applyPaystackVerification({
      payment: {
        id: 'p1',
        expectedAmountKobo: 16575000,
        expectedCurrency: 'NGN',
        studentId: 's1',
      },
      verify: verifyResult({ status: 'failed' }),
      updatePayment,
      syncStudentPaymentState,
    })

    expect(res.ok).toBe(false)
    expect(updatePayment).toHaveBeenCalled()
    expect(syncStudentPaymentState).not.toHaveBeenCalled()
  })

  it('does not sync student payment state when amount mismatches', async () => {
    const updatePayment = vi.fn(async () => {})
    const syncStudentPaymentState = vi.fn(async () => null)

    const res = await applyPaystackVerification({
      payment: {
        id: 'p2',
        expectedAmountKobo: 16575000,
        expectedCurrency: 'NGN',
        studentId: 's2',
      },
      verify: verifyResult({ amountKobo: 19500000 }),
      updatePayment,
      syncStudentPaymentState,
    })

    expect(res.ok).toBe(false)
    expect(updatePayment).toHaveBeenCalled()
    expect(syncStudentPaymentState).not.toHaveBeenCalled()
  })

  it('syncs student payment state only after verified success', async () => {
    const updatePayment = vi.fn(async () => {})
    const syncStudentPaymentState = vi.fn(async () => ({
      accessGrantedAt: '2026-02-11T10:00:00.000Z',
      amountPaidKobo: 16575000,
      balanceDueKobo: 0,
      expectedTotalFeeKobo: 16575000,
      fullPaidAt: '2026-02-11T10:00:00.000Z',
      isFullyPaid: true,
      isPaid: true,
      paymentStatus: 'FULL' as const,
    }))

    const res = await applyPaystackVerification({
      payment: {
        id: 'p3',
        expectedAmountKobo: 16575000,
        expectedCurrency: 'NGN',
        studentId: 's3',
      },
      verify: verifyResult(),
      updatePayment,
      syncStudentPaymentState,
    })

    expect(res.ok).toBe(true)
    expect(updatePayment).toHaveBeenCalled()
    expect(syncStudentPaymentState).toHaveBeenCalledTimes(1)
    expect(res.paymentSummary?.paymentStatus).toBe('FULL')
  })
})
