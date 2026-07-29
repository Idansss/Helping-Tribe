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

export function getSiteUrl(): string {
  const envUrl =
    normalizeUrl(process.env.BASE_URL) ||
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrl(process.env.VERCEL_URL)

  if (envUrl) return envUrl

  // Only local development may fall back to localhost. A deployed build must
  // never emit a dev-machine canonical, which would tell search engines the
  // real homepage lives on http://localhost:3000.
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000'

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
