type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Purge expired buckets every 10 minutes to prevent unbounded memory growth.
// Uses unref() so this timer does not keep the Node.js process alive.
if (typeof setInterval !== 'undefined') {
  const handle = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, 10 * 60 * 1000)
  // unref is available in Node.js but not in edge runtimes
  if (typeof handle === 'object' && 'unref' in handle) {
    (handle as { unref(): void }).unref()
  }
}

type RateLimitInput = {
  key: string
  limit: number
  windowMs: number
}

export function checkRateLimit(input: RateLimitInput) {
  const now = Date.now()
  const current = buckets.get(input.key)

  if (!current || current.resetAt <= now) {
    buckets.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    })
    return { allowed: true, remaining: input.limit - 1, resetAt: now + input.windowMs }
  }

  if (current.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  buckets.set(input.key, current)
  return { allowed: true, remaining: Math.max(0, input.limit - current.count), resetAt: current.resetAt }
}

export function getRequestIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}
