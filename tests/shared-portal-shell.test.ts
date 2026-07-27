import { describe, expect, it } from 'vitest'
import { getPortalPageMeta, isPortalItemActive, PORTAL_CONFIG } from '@/components/portal/portal-config'

describe('shared portal configuration', () => {
  it('provides unique, role-scoped destinations for every portal', () => {
    for (const [role, config] of Object.entries(PORTAL_CONFIG)) {
      const items = config.navigation.flatMap((group) => group.items)
      const hrefs = items.map((item) => item.href)

      expect(items.length).toBeGreaterThan(0)
      expect(new Set(hrefs).size).toBe(hrefs.length)
      expect(hrefs.every((href) => href.startsWith(`/${role === 'mentor' ? 'mentor' : role}`))).toBe(true)
      expect(items.every((item) => item.description.trim().length > 0)).toBe(true)
    }
  })

  it('resolves contextual titles for exact and nested routes', () => {
    expect(getPortalPageMeta('admin', '/admin/users').title).toBe('Users')
    expect(getPortalPageMeta('mentor', '/mentor/groups/peer-circle-1').title).toBe('Peer Circles')
    expect(getPortalPageMeta('learner', '/learner/course/modules/one').title).toBe('My Course')
  })

  it('does not let portal roots overmatch unrelated destinations', () => {
    expect(isPortalItemActive('/admin/users', '/admin')).toBe(false)
    expect(isPortalItemActive('/mentor/reports', '/mentor')).toBe(false)
    expect(isPortalItemActive('/learner/dashboard', '/learner/dashboard')).toBe(true)
    expect(isPortalItemActive('/learner/dashboard/report', '/learner/dashboard')).toBe(false)
  })
})
