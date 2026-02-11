import { describe, expect, it } from 'vitest'
import { isAllowedAdmin, resolvePortalRole } from '../lib/auth/admin'

describe('admin access policy', () => {
  it('allows only the primary admin email for admin access', () => {
    expect(isAllowedAdmin('admin', 'jesselingard990@gmail.com')).toBe(true)
    expect(isAllowedAdmin('admin', 'someone@example.com')).toBe(false)
    expect(isAllowedAdmin('mentor', 'jesselingard990@gmail.com')).toBe(false)
  })

  it('maps non-primary admin role to mentor portal', () => {
    expect(resolvePortalRole('admin', 'someone@example.com')).toBe('mentor')
    expect(resolvePortalRole('faculty', 'mentor@example.com')).toBe('mentor')
    expect(resolvePortalRole('student', 'learner@example.com')).toBe('learner')
  })
})
