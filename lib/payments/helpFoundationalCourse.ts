export const HELP_FOUNDATIONAL_COURSE = {
  title: 'THE HELP FOUNDATIONAL COURSE',
  currency: 'NGN',
  baseFeeNgn: 195_000,
  earlyBirdDiscountPercent: 15,
  earlyBirdClosesDate: '2026-02-15',
  earlyBirdClosesLabel: '15th February 2026',
  registrationClosesDate: '2026-02-28',
  registrationClosesLabel: '28th February 2026',
  classBeginsDate: '2026-03-15',
  classBeginsLabel: '15th March 2026',
} as const

export type HelpCoursePricingPhase = 'EARLY_BIRD' | 'REGULAR' | 'CLOSED'

export type HelpCoursePricing = {
  phase: HelpCoursePricingPhase
  todayLagos: string
  baseFeeNgn: number
  discountApplied: boolean
  discountPercent: number
  amountNgn: number
  amountKobo: number
  message?: string
}

function lagosDateString(date: Date) {
  // YYYY-MM-DD in Africa/Lagos to make "today" comparisons stable for Nigeria.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function computeHelpFoundationalCoursePricing(now: Date = new Date()): HelpCoursePricing {
  const todayLagos = lagosDateString(now)
  const baseFeeNgn = HELP_FOUNDATIONAL_COURSE.baseFeeNgn
  const discountPercent = HELP_FOUNDATIONAL_COURSE.earlyBirdDiscountPercent

  if (todayLagos <= HELP_FOUNDATIONAL_COURSE.earlyBirdClosesDate) {
    const amountNgn = Math.round(baseFeeNgn * (1 - discountPercent / 100))
    return {
      phase: 'EARLY_BIRD',
      todayLagos,
      baseFeeNgn,
      discountApplied: true,
      discountPercent,
      amountNgn,
      amountKobo: amountNgn * 100,
    }
  }

  if (todayLagos <= HELP_FOUNDATIONAL_COURSE.registrationClosesDate) {
    const amountNgn = baseFeeNgn
    return {
      phase: 'REGULAR',
      todayLagos,
      baseFeeNgn,
      discountApplied: false,
      discountPercent,
      amountNgn,
      amountKobo: amountNgn * 100,
    }
  }

  return {
    phase: 'CLOSED',
    todayLagos,
    baseFeeNgn,
    discountApplied: false,
    discountPercent,
    amountNgn: baseFeeNgn,
    amountKobo: baseFeeNgn * 100,
    message: `Registration closed ${HELP_FOUNDATIONAL_COURSE.registrationClosesDate.replaceAll('-', ' ')}.`,
  }
}
