import type { NextRequest } from 'next/server'

function isLocalhostUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url)
}

/**
 * Base URL for links shown to users (emails, admin "copy link", Paystack callbacks).
 *
 * 1. BASE_URL when set and not localhost (your canonical production domain).
 * 2. x-forwarded-host + x-forwarded-proto when present and not localhost.
 * 3. request.nextUrl.origin when it is not localhost.
 * 4. https://VERCEL_URL on Vercel (last fallback only).
 */
export function getPublicSiteBaseUrl(request: NextRequest): string {
  const envBase = (process.env.BASE_URL || '').trim().replace(/\/$/, '')
  if (envBase && !isLocalhostUrl(envBase)) {
    return envBase
  }

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  if (forwardedHost && !isLocalhostUrl(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '')
  }

  const requestOrigin = request.nextUrl.origin.replace(/\/$/, '')
  if (!isLocalhostUrl(requestOrigin)) {
    return requestOrigin
  }

  const vercel = (process.env.VERCEL_URL || '').trim()
  if (vercel && !isLocalhostUrl(vercel)) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `https://${host}`
  }

  return requestOrigin
}

export function absolutePublicUrl(request: NextRequest, pathnameAndQuery: string): string {
  const base = getPublicSiteBaseUrl(request)
  const path = pathnameAndQuery.startsWith('/') ? pathnameAndQuery : `/${pathnameAndQuery}`
  return `${base}${path}`
}
