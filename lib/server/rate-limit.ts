import { createAdminClient } from '@/lib/supabase/admin'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

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

function checkRateLimitInMemory(input: RateLimitInput): RateLimitResult {
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

export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('consume_rate_limit', {
      p_bucket_key: input.key,
      p_limit: input.limit,
      p_window_ms: input.windowMs,
    })

    const row = Array.isArray(data) ? data[0] : null
    if (!error && row) {
      const resetAt = typeof row.reset_at === 'string' ? new Date(row.reset_at).getTime() : Date.now() + input.windowMs
      return {
        allowed: Boolean(row.allowed),
        remaining: Number(row.remaining ?? 0),
        resetAt,
      }
    }

    if (error) {
      console.warn('[rate-limit] Falling back to in-memory limiter:', error.message)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn('[rate-limit] Falling back to in-memory limiter:', message)
  }

  return checkRateLimitInMemory(input)
}

export function getRequestIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}
