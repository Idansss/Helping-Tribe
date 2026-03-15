export const PRIMARY_ADMIN_EMAIL =
  (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()

const EXTRA_ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const ALL_ADMIN_EMAILS = Array.from(new Set([PRIMARY_ADMIN_EMAIL, ...EXTRA_ADMIN_EMAILS])).filter(Boolean)

function normalizeRole(role: unknown) {
  return String(role ?? '').trim().toLowerCase()
}

function normalizeEmail(email: string | null | undefined) {
  return String(email ?? '').trim().toLowerCase()
}

export function isPrimaryAdminEmail(email: string | null | undefined) {
  return ALL_ADMIN_EMAILS.includes(normalizeEmail(email))
}

export function isAllowedAdmin(role: unknown, _email?: string | null) {
  // Trust the database role: any profile with role 'admin' can perform admin actions.
  // ADMIN_EMAIL / ADMIN_EMAILS are still used for isPrimaryAdminEmail (e.g. display).
  return normalizeRole(role) === 'admin'
}

export function isMentorLikeRole(role: unknown) {
  const normalized = normalizeRole(role)
  return normalized === 'mentor' || normalized === 'faculty'
}

export function resolvePortalRole(role: unknown, email: string | null | undefined): 'admin' | 'mentor' | 'learner' {
  const normalized = normalizeRole(role)
  if (normalized === 'admin') return 'admin'
  if (isMentorLikeRole(normalized)) return 'mentor'
  return 'learner'
}

