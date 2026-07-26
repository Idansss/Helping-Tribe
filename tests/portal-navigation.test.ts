import { describe, expect, it } from 'vitest'
import {
  flattenNavGroups,
  isPortalNavItemActive,
  LEARNER_NAV_GROUPS,
  LEARNER_PRIMARY_MOBILE_HREFS,
} from '@/lib/navigation/portal'

describe('learner portal navigation', () => {
  it('keeps primary mobile destinations unique and valid', () => {
    const allHrefs = flattenNavGroups(LEARNER_NAV_GROUPS).map((item) => item.href)
    expect(new Set(LEARNER_PRIMARY_MOBILE_HREFS).size).toBe(LEARNER_PRIMARY_MOBILE_HREFS.length)
    for (const href of LEARNER_PRIMARY_MOBILE_HREFS) expect(allHrefs).toContain(href)
  })

  it('matches nested feature routes without overmatching the dashboard', () => {
    expect(isPortalNavItemActive('/learner/course/modules/one', '/learner/course/modules')).toBe(true)
    expect(isPortalNavItemActive('/learner/dashboard/report', '/learner/dashboard')).toBe(false)
    expect(isPortalNavItemActive('/learner/dashboard', '/learner/dashboard')).toBe(true)
  })
})
