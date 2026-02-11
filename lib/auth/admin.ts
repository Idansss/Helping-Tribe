export const PRIMARY_ADMIN_EMAIL = 'jesselingard990@gmail.com'

function normalizeRole(role: unknown) {
  return String(role ?? '').trim().toLowerCase()
}

function normalizeEmail(email: string | null | undefined) {
  return String(email ?? '').trim().toLowerCase()
}

export function isPrimaryAdminEmail(email: string | null | undefined) {
  return normalizeEmail(email) === PRIMARY_ADMIN_EMAIL
}

export function isAllowedAdmin(role: unknown, email: string | null | undefined) {
  return normalizeRole(role) === 'admin' && isPrimaryAdminEmail(email)
}

export function isMentorLikeRole(role: unknown) {
  const normalized = normalizeRole(role)
  return normalized === 'mentor' || normalized === 'faculty'
}

export function resolvePortalRole(role: unknown, email: string | null | undefined): 'admin' | 'mentor' | 'learner' {
  if (isAllowedAdmin(role, email)) return 'admin'

  const normalized = normalizeRole(role)
  if (isMentorLikeRole(normalized) || normalized === 'admin') return 'mentor'

  return 'learner'
}

