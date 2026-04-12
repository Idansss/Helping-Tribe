import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => {
    throw new Error('service role unavailable')
  }),
}))

describe('checkRateLimit fallback', () => {
  it('falls back to the in-memory limiter when the shared store is unavailable', async () => {
    const { checkRateLimit } = await import('../lib/server/rate-limit')
    const key = `test-key-${Date.now()}`

    const first = await checkRateLimit({ key, limit: 1, windowMs: 60_000 })
    const second = await checkRateLimit({ key, limit: 1, windowMs: 60_000 })

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(false)
    expect(second.remaining).toBe(0)
  })
})
