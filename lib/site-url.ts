/**
 * Canonical public origin for metadata, sitemap, robots and structured data.
 *
 * For request-aware links (emails, admin "copy link", Paystack callbacks) use
 * `lib/server/public-site-url.ts` instead — it can read the incoming host.
 */

/** Production origin. Used whenever no environment override is configured. */
export const DEFAULT_SITE_URL = 'https://helpingtribeacademy.com'

function normalizeUrl(value: string | undefined): string {
  const trimmed = value?.trim().replace(/\/$/, '') ?? ''
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isLocalhostUrl(value: string): boolean {
  return /localhost|127\.0\.0\.1|\[::1\]/i.test(value)
}

export function getSiteUrl(): string {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const candidates = [
    normalizeUrl(process.env.BASE_URL),
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
    normalizeUrl(process.env.VERCEL_URL),
  ]

  for (const candidate of candidates) {
    if (!candidate) continue

    // A localhost origin is never a valid public canonical outside local
    // development, no matter which variable supplies it. A stale
    // BASE_URL=http://localhost:3000 in the deployment environment previously
    // outranked every other source and shipped that canonical to production.
    // Mirrors the guard in lib/server/public-site-url.ts.
    if (!isDevelopment && isLocalhostUrl(candidate)) continue

    return candidate
  }

  if (isDevelopment) return 'http://localhost:3000'

  return DEFAULT_SITE_URL
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl())
}

/** Convenience constant for modules that only need the resolved origin. */
export const siteUrl = getSiteUrl()

/** Build an absolute URL on the canonical origin. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, `${getSiteUrl()}/`).toString()
}
