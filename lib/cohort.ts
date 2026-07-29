export type CohortPrice = {
  amount: number
  /** ISO 4217, e.g. "NGN". */
  currency: string
}

export type Cohort = {
  /** ISO date (YYYY-MM-DD) the next cohort begins. */
  startDate: string | null
  /** ISO date (YYYY-MM-DD) applications close. */
  applicationDeadline: string | null
  price: CohortPrice | null
}

/**
 * Next cohort details shown above the admissions steps.
 *
 * All null pending client confirmation. The fee in particular is flagged
 * `client-confirmation-required` in SITE_CONFIG because the public site and the
 * payment configuration disagree — publishing either number could take money
 * on a wrong price. While a field is null its row is hidden; if every field is
 * null the whole cohort block is hidden.
 */
export const COHORT: Cohort = {
  startDate: null,
  applicationDeadline: null,
  price: null,
}

/** True when there is at least one confirmed detail worth showing. */
export function hasCohortDetails(cohort: Cohort = COHORT): boolean {
  return Boolean(cohort.startDate || cohort.applicationDeadline || cohort.price)
}

export function formatCohortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatCohortPrice(price: CohortPrice): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount)
}
