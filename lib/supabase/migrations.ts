export const REQUIRED_MIGRATIONS = {
  paymentsPaystack: 'supabase/migrations/032_payments_paystack.sql',
  partialPayments: 'supabase/migrations/044_partial_payments_and_certificate_gate.sql',
} as const

export function missingPaymentsSchemaMessage() {
  return `Database schema is missing payment columns/tables. Run ${REQUIRED_MIGRATIONS.paymentsPaystack} and ${REQUIRED_MIGRATIONS.partialPayments} in Supabase SQL Editor.`
}

export function isMissingColumnError(error: unknown, columnName: string) {
  const message = String((error as any)?.message ?? error ?? '')
  return message.toLowerCase().includes(`column`) && message.toLowerCase().includes(columnName.toLowerCase())
}

export function isMissingRelationError(error: unknown, relationName: string) {
  const message = String((error as any)?.message ?? error ?? '')
  return message.toLowerCase().includes(`relation`) && message.toLowerCase().includes(relationName.toLowerCase())
}
