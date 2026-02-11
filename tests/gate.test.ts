import { describe, expect, it } from 'vitest'
import { PUBLIC_PAGES, isPublicApiPath, isPublicPath, unauthenticatedRedirectTarget } from '../lib/auth/gate'

describe('hard gate allowlist', () => {
  it('only allows explicit public pages', () => {
    expect(isPublicPath('/apply')).toBe(true)
    expect(isPublicPath('/student/login')).toBe(true)
    expect(isPublicPath('/staff/login')).toBe(true)
    expect(isPublicPath('/set-password')).toBe(true)

    // Not public by policy.
    expect(isPublicPath('/')).toBe(false)
    expect(isPublicPath('/dashboard')).toBe(false)
    expect(isPublicPath('/catalog')).toBe(false)
    expect(isPublicPath('/learner/dashboard')).toBe(false)
    expect(isPublicPath('/admin')).toBe(false)
    expect(isPublicPath('/mentor')).toBe(false)

    expect(PUBLIC_PAGES.has('/')).toBe(false)
  })

  it('allows only required public API endpoints', () => {
    expect(isPublicApiPath('/api/apply')).toBe(true)
    expect(isPublicApiPath('/api/student/login')).toBe(true)
    expect(isPublicApiPath('/api/staff/login')).toBe(true)
    expect(isPublicApiPath('/api/set-password')).toBe(true)
    expect(isPublicApiPath('/api/set-password/validate')).toBe(true)
    expect(isPublicApiPath('/api/paystack/webhook')).toBe(true)

    expect(isPublicApiPath('/api/ai-client')).toBe(false)
    expect(isPublicApiPath('/api/admin/weekly-report')).toBe(false)
  })

  it('redirects unauthenticated users to /apply', () => {
    expect(unauthenticatedRedirectTarget()).toBe('/apply')
  })
})
