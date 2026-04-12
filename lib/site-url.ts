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

  return envUrl || 'http://localhost:3000'
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl())
}
