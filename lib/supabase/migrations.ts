export const REQUIRED_MIGRATIONS = {
  paymentsPaystack: 'supabase/migrations/032_payments_paystack.sql',
  partialPayments: 'supabase/migrations/044_partial_payments_and_certificate_gate.sql',
} as const

export function missingPaymentsSchemaMessage() {
  return `Database schema is missing payment columns/tables. Run ${REQUIRED_MIGRATIONS.paymentsPaystack} and ${REQUIRED_MIGRATIONS.partialPayments} in Supabase SQL Editor.`
}

export function isMissingColumnError(error: unknown, columnName: string) {
  const message = String((error as { message?: string } | null)?.message ?? error ?? '')
  return message.toLowerCase().includes('column') && message.toLowerCase().includes(columnName.toLowerCase())
}

export function getErrorMessage(error: unknown) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error && error.message) return error.message
  const maybe = error as { message?: string; code?: string; details?: string; hint?: string }
  return [maybe.message, maybe.code, maybe.details, maybe.hint].filter(Boolean).join(' | ') || 'Unknown error'
}

/**
 * True when PostgREST/Postgres reports a missing table/view/relation.
 * Used to degrade gracefully instead of throwing Next.js console overlays.
 */
export function isMissingRelationError(error: unknown, relationName?: string) {
  const message = getErrorMessage(error).toLowerCase()
  const code = String((error as { code?: string } | null)?.code || '')
  const missing =
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    (message.includes('relation') && message.includes('does not exist'))

  if (!missing) return false
  if (!relationName) return true
  return message.includes(relationName.toLowerCase())
}
