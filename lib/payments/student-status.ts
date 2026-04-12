import type { SupabaseClient } from '@supabase/supabase-js'
import { computeHelpFoundationalCoursePricing, HELP_FOUNDATIONAL_COURSE } from './helpFoundationalCourse'

export type StudentPaymentStatus = 'UNPAID' | 'PARTIAL' | 'FULL'
export type PaymentPlan = 'FULL' | 'HALF' | 'BALANCE'

export type StudentPaymentRow = {
  amount_paid_kobo?: number | null
  balance_due_kobo?: number | null
  expected_total_fee_kobo?: number | null
  full_paid_at?: string | null
  id: string
  is_fully_paid?: boolean | null
  is_paid?: boolean | null
  paid_at?: string | null
  payment_status?: string | null
}

type PaymentRow = {
  amount_kobo: number | null
  expected_total_fee_kobo?: number | null
  paid_at: string | null
  status: string | null
}

export type PaymentSummary = {
  accessGrantedAt: string | null
  amountPaidKobo: number
  balanceDueKobo: number
  expectedTotalFeeKobo: number | null
  fullPaidAt: string | null
  isFullyPaid: boolean
  isPaid: boolean
  paymentStatus: StudentPaymentStatus
}

export type PaymentRequest = {
  amountKobo: number
  expectedTotalFeeKobo: number
  paymentPlan: PaymentPlan
}

function sumAmounts(rows: PaymentRow[]) {
  return rows.reduce((total, row) => total + Math.max(0, Number(row.amount_kobo ?? 0)), 0)
}

function latestTimestamp(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null
}

function earliestTimestamp(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(0) ?? null
}

export function getExpectedCourseTotalKobo(now: Date = new Date()) {
  return computeHelpFoundationalCoursePricing(now).amountKobo
}

export function getHalfPaymentAmountKobo(expectedTotalFeeKobo: number) {
  return Math.ceil(expectedTotalFeeKobo / 2)
}

export function getPaymentDiscountInfo(expectedTotalFeeKobo: number) {
  const baseFeeKobo = HELP_FOUNDATIONAL_COURSE.baseFeeNgn * 100
  const discounted = expectedTotalFeeKobo < baseFeeKobo
  return {
    discountApplied: discounted,
    discountPercent: discounted ? HELP_FOUNDATIONAL_COURSE.earlyBirdDiscountPercent : null,
  }
}

export function deriveStudentPaymentSummary(input: {
  payments: PaymentRow[]
  student: StudentPaymentRow
}): PaymentSummary {
  const successfulPayments = input.payments.filter((payment) => String(payment.status ?? '').toUpperCase() === 'SUCCESS')
  const amountPaidKobo = sumAmounts(successfulPayments)
  const expectedTotalFromPayments = successfulPayments
    .map((payment) => Number(payment.expected_total_fee_kobo ?? 0))
    .filter((amount) => amount > 0)
    .sort((left, right) => right - left)[0] ?? null

  const expectedTotalFeeKobo =
    Number(input.student.expected_total_fee_kobo ?? 0) > 0
      ? Number(input.student.expected_total_fee_kobo)
      : expectedTotalFromPayments

  const legacyFull = Boolean(input.student.is_fully_paid) || (
    Boolean(input.student.is_paid) &&
    expectedTotalFeeKobo === null &&
    amountPaidKobo === 0
  )

  const isPaid = amountPaidKobo > 0 || Boolean(input.student.is_paid)
  const isFullyPaid = legacyFull || (
    expectedTotalFeeKobo !== null &&
    amountPaidKobo >= expectedTotalFeeKobo
  )

  const paymentStatus: StudentPaymentStatus = isFullyPaid
    ? 'FULL'
    : isPaid
      ? 'PARTIAL'
      : 'UNPAID'

  const balanceDueKobo = isFullyPaid
    ? 0
    : expectedTotalFeeKobo !== null
      ? Math.max(0, expectedTotalFeeKobo - amountPaidKobo)
      : Math.max(0, Number(input.student.balance_due_kobo ?? 0))

  const accessGrantedAt = earliestTimestamp([
    ...successfulPayments.map((payment) => payment.paid_at),
    input.student.paid_at ?? null,
  ])

  const fullPaidAt = isFullyPaid
    ? latestTimestamp([
        ...successfulPayments.map((payment) => payment.paid_at),
        input.student.full_paid_at ?? null,
        input.student.paid_at ?? null,
      ])
    : null

  return {
    accessGrantedAt,
    amountPaidKobo,
    balanceDueKobo,
    expectedTotalFeeKobo,
    fullPaidAt,
    isFullyPaid,
    isPaid,
    paymentStatus,
  }
}

export function resolvePaymentRequest(input: {
  amountPaidKobo: number
  expectedTotalFeeKobo: number
  paymentOption: PaymentPlan
}) {
  const amountPaidKobo = Math.max(0, input.amountPaidKobo)
  const expectedTotalFeeKobo = Math.max(0, input.expectedTotalFeeKobo)

  if (amountPaidKobo >= expectedTotalFeeKobo) {
    throw new Error('Student is already fully paid.')
  }

  if (amountPaidKobo > 0) {
    if (input.paymentOption !== 'BALANCE') {
      throw new Error('Student already has a partial payment. Generate a balance payment instead.')
    }

    return {
      amountKobo: expectedTotalFeeKobo - amountPaidKobo,
      expectedTotalFeeKobo,
      paymentPlan: 'BALANCE' as const,
    }
  }

  if (input.paymentOption === 'BALANCE') {
    throw new Error('Balance payment is available only after an initial partial payment.')
  }

  if (input.paymentOption === 'HALF') {
    return {
      amountKobo: getHalfPaymentAmountKobo(expectedTotalFeeKobo),
      expectedTotalFeeKobo,
      paymentPlan: 'HALF' as const,
    }
  }

  return {
    amountKobo: expectedTotalFeeKobo,
    expectedTotalFeeKobo,
    paymentPlan: 'FULL' as const,
  }
}

export async function syncStudentPaymentState(
  admin: SupabaseClient,
  studentId: string
) {
  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id, is_paid, paid_at, is_fully_paid, full_paid_at, payment_status, amount_paid_kobo, balance_due_kobo, expected_total_fee_kobo')
    .eq('id', studentId)
    .maybeSingle()

  if (studentError || !student) {
    throw new Error(studentError?.message || 'Failed to load student payment state.')
  }

  const { data: payments, error: paymentsError } = await admin
    .from('payments')
    .select('amount_kobo, expected_total_fee_kobo, paid_at, status')
    .eq('student_id', studentId)

  if (paymentsError) {
    throw new Error(paymentsError.message || 'Failed to load student payments.')
  }

  const summary = deriveStudentPaymentSummary({
    payments: (payments ?? []) as PaymentRow[],
    student: student as StudentPaymentRow,
  })

  const { error: updateError } = await admin
    .from('students')
    .update({
      amount_paid_kobo: summary.amountPaidKobo,
      balance_due_kobo: summary.balanceDueKobo,
      expected_total_fee_kobo: summary.expectedTotalFeeKobo,
      full_paid_at: summary.fullPaidAt,
      is_fully_paid: summary.isFullyPaid,
      is_paid: summary.isPaid,
      paid_at: summary.accessGrantedAt,
      payment_status: summary.paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId)

  if (updateError) {
    throw new Error(updateError.message || 'Failed to update student payment summary.')
  }

  return summary
}
