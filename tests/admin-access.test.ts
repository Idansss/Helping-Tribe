import { describe, expect, it } from 'vitest'
import { isAllowedAdmin, resolvePortalRole } from '../lib/auth/admin'

describe('admin access policy', () => {
  it('allows any profile with role admin for admin API access', () => {
    expect(isAllowedAdmin('admin', 'jesselingard990@gmail.com')).toBe(true)
    expect(isAllowedAdmin('admin', 'someone@example.com')).toBe(true)
    expect(isAllowedAdmin('mentor', 'jesselingard990@gmail.com')).toBe(false)
  })

  it('maps role to portal', () => {
    expect(resolvePortalRole('admin', 'someone@example.com')).toBe('admin')
    expect(resolvePortalRole('faculty', 'mentor@example.com')).toBe('mentor')
    expect(resolvePortalRole('student', 'learner@example.com')).toBe('learner')
  })
})
