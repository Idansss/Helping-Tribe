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
  it('does not mark student paid when verify is not success', async () => {
    const updatePayment = vi.fn(async () => {})
    const markStudentPaid = vi.fn(async () => {})

    const res = await applyPaystackVerification({
      payment: {
        id: 'p1',
        expectedAmountKobo: 16575000,
        expectedCurrency: 'NGN',
        studentId: 's1',
      },
      verify: verifyResult({ status: 'failed' }),
      updatePayment,
      markStudentPaid,
    })

    expect(res.ok).toBe(false)
    expect(updatePayment).toHaveBeenCalled()
    expect(markStudentPaid).not.toHaveBeenCalled()
  })

  it('does not mark student paid when amount mismatches', async () => {
    const updatePayment = vi.fn(async () => {})
    const markStudentPaid = vi.fn(async () => {})

    const res = await applyPaystackVerification({
      payment: {
        id: 'p2',
        expectedAmountKobo: 16575000,
        expectedCurrency: 'NGN',
        studentId: 's2',
      },
      verify: verifyResult({ amountKobo: 19500000 }),
      updatePayment,
      markStudentPaid,
    })

    expect(res.ok).toBe(false)
    expect(updatePayment).toHaveBeenCalled()
    expect(markStudentPaid).not.toHaveBeenCalled()
  })

  it('marks student paid only after verified success', async () => {
    const updatePayment = vi.fn(async () => {})
    const markStudentPaid = vi.fn(async () => {})

    const res = await applyPaystackVerification({
      payment: {
        id: 'p3',
        expectedAmountKobo: 16575000,
        expectedCurrency: 'NGN',
        studentId: 's3',
      },
      verify: verifyResult(),
      updatePayment,
      markStudentPaid,
    })

    expect(res.ok).toBe(true)
    expect(updatePayment).toHaveBeenCalled()
    expect(markStudentPaid).toHaveBeenCalledTimes(1)
  })
})

