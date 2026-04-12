import { describe, expect, it } from 'vitest'
import {
  deriveStudentPaymentSummary,
  getHalfPaymentAmountKobo,
  resolvePaymentRequest,
} from '../lib/payments/student-status'

describe('student payment status helpers', () => {
  it('derives partial payment state from successful installment payments', () => {
    const summary = deriveStudentPaymentSummary({
      student: {
        id: 'student-1',
        is_paid: false,
        paid_at: null,
        is_fully_paid: false,
        full_paid_at: null,
        payment_status: 'UNPAID',
        amount_paid_kobo: 0,
        balance_due_kobo: 0,
        expected_total_fee_kobo: 16575000,
      },
      payments: [
        {
          amount_kobo: 8287500,
          expected_total_fee_kobo: 16575000,
          paid_at: '2026-02-11T10:00:00.000Z',
          status: 'SUCCESS',
        },
      ],
    })

    expect(summary.paymentStatus).toBe('PARTIAL')
    expect(summary.isPaid).toBe(true)
    expect(summary.isFullyPaid).toBe(false)
    expect(summary.amountPaidKobo).toBe(8287500)
    expect(summary.balanceDueKobo).toBe(8287500)
    expect(summary.accessGrantedAt).toBe('2026-02-11T10:00:00.000Z')
  })

  it('derives full payment state once the total fee has been covered', () => {
    const summary = deriveStudentPaymentSummary({
      student: {
        id: 'student-2',
        is_paid: true,
        paid_at: '2026-02-11T10:00:00.000Z',
        is_fully_paid: false,
        full_paid_at: null,
        payment_status: 'PARTIAL',
        amount_paid_kobo: 8287500,
        balance_due_kobo: 8287500,
        expected_total_fee_kobo: 16575000,
      },
      payments: [
        {
          amount_kobo: 8287500,
          expected_total_fee_kobo: 16575000,
          paid_at: '2026-02-11T10:00:00.000Z',
          status: 'SUCCESS',
        },
        {
          amount_kobo: 8287500,
          expected_total_fee_kobo: 16575000,
          paid_at: '2026-02-20T10:00:00.000Z',
          status: 'SUCCESS',
        },
      ],
    })

    expect(summary.paymentStatus).toBe('FULL')
    expect(summary.isPaid).toBe(true)
    expect(summary.isFullyPaid).toBe(true)
    expect(summary.amountPaidKobo).toBe(16575000)
    expect(summary.balanceDueKobo).toBe(0)
    expect(summary.fullPaidAt).toBe('2026-02-20T10:00:00.000Z')
  })

  it('resolves valid payment requests for half, full, and balance payments', () => {
    const expectedTotalFeeKobo = 16575000

    expect(
      resolvePaymentRequest({
        amountPaidKobo: 0,
        expectedTotalFeeKobo,
        paymentOption: 'HALF',
      })
    ).toEqual({
      amountKobo: getHalfPaymentAmountKobo(expectedTotalFeeKobo),
      expectedTotalFeeKobo,
      paymentPlan: 'HALF',
    })

    expect(
      resolvePaymentRequest({
        amountPaidKobo: 0,
        expectedTotalFeeKobo,
        paymentOption: 'FULL',
      })
    ).toEqual({
      amountKobo: expectedTotalFeeKobo,
      expectedTotalFeeKobo,
      paymentPlan: 'FULL',
    })

    expect(
      resolvePaymentRequest({
        amountPaidKobo: getHalfPaymentAmountKobo(expectedTotalFeeKobo),
        expectedTotalFeeKobo,
        paymentOption: 'BALANCE',
      })
    ).toEqual({
      amountKobo: expectedTotalFeeKobo - getHalfPaymentAmountKobo(expectedTotalFeeKobo),
      expectedTotalFeeKobo,
      paymentPlan: 'BALANCE',
    })
  })

  it('rejects invalid payment option transitions', () => {
    expect(() =>
      resolvePaymentRequest({
        amountPaidKobo: 0,
        expectedTotalFeeKobo: 16575000,
        paymentOption: 'BALANCE',
      })
    ).toThrow('Balance payment is available only after an initial partial payment.')

    expect(() =>
      resolvePaymentRequest({
        amountPaidKobo: 5000000,
        expectedTotalFeeKobo: 16575000,
        paymentOption: 'FULL',
      })
    ).toThrow('Student already has a partial payment. Generate a balance payment instead.')
  })
})
