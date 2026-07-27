/**
 * Portal routes that own the full viewport beneath the portal header.
 * Document scroll is disabled; only internal panels scroll.
 *
 * Intentionally excludes public routes such as `/messages` (redirect-only).
 */
export const FULL_VIEWPORT_ROUTES = new Set([
  '/learner/practice/chat',
  '/learner/messages',
  '/mentor/messages',
  '/admin/messages',
])

export function isFullViewportRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return FULL_VIEWPORT_ROUTES.has(pathname)
}
