import type { NextRequest } from 'next/server'

function isLocalhostUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url)
}

/**
 * Base URL for links shown to users (emails, admin "copy link", Paystack callbacks).
 *
 * 1. BASE_URL when set and not localhost (your canonical production domain).
 * 2. https://VERCEL_URL on Vercel (so deploys work without BASE_URL).
 * 3. x-forwarded-host + x-forwarded-proto when present and not localhost.
 * 4. request.nextUrl.origin (local dev, or last resort).
 */
export function getPublicSiteBaseUrl(request: NextRequest): string {
  const envBase = (process.env.BASE_URL || '').trim().replace(/\/$/, '')
  if (envBase && !isLocalhostUrl(envBase)) {
    return envBase
  }

  const vercel = (process.env.VERCEL_URL || '').trim()
  if (vercel && !isLocalhostUrl(vercel)) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `https://${host}`
  }

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  if (forwardedHost && !isLocalhostUrl(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '')
  }

  return request.nextUrl.origin.replace(/\/$/, '')
}

export function absolutePublicUrl(request: NextRequest, pathnameAndQuery: string): string {
  const base = getPublicSiteBaseUrl(request)
  const path = pathnameAndQuery.startsWith('/') ? pathnameAndQuery : `/${pathnameAndQuery}`
  return `${base}${path}`
}
