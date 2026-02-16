export const PUBLIC_PAGES = new Set([
  '/',
  '/landing',
  '/apply',
  '/apply/success',
  '/apply/resume',
  '/privacy',
  '/terms',
  '/contact',
  '/student/login',
  '/staff/login',
  '/set-password',
  '/student/set-password',
])

export function isPublicApiPath(pathname: string) {
  return (
    pathname === '/api/apply' ||
    pathname.startsWith('/api/apply/') ||
    pathname === '/api/student/login' ||
    pathname === '/api/staff/login' ||
    pathname === '/api/set-password' ||
    pathname.startsWith('/api/set-password/') ||
    pathname === '/api/paystack/webhook'
  )
}

export function isPublicPath(pathname: string) {
  return PUBLIC_PAGES.has(pathname) || isPublicApiPath(pathname)
}

export function unauthenticatedRedirectTarget() {
  return '/'
}
