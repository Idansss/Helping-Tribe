export const PUBLIC_PAGES = new Set([
  '/apply',
  '/student/login',
  '/staff/login',
  '/set-password',
])

export function isPublicApiPath(pathname: string) {
  return (
    pathname === '/api/apply' ||
    pathname === '/api/student/login' ||
    pathname === '/api/staff/login' ||
    pathname === '/api/set-password' ||
    pathname.startsWith('/api/set-password/')
  )
}

export function isPublicPath(pathname: string) {
  return PUBLIC_PAGES.has(pathname) || isPublicApiPath(pathname)
}

export function unauthenticatedRedirectTarget() {
  return '/apply'
}
