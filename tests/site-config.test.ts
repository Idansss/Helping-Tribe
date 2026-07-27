import { describe, expect, it } from 'vitest'
import { CURRICULUM_MODULES, SITE_CONFIG } from '@/lib/brand/site-config'

describe('public content safeguards', () => {
  it('does not publish unresolved fee or faculty claims', () => {
    expect(SITE_CONFIG.programme.fee.value).toBeNull()
    expect(SITE_CONFIG.programme.fee.confidence).toBe('client-confirmation-required')
    expect(SITE_CONFIG.programme.faculty.value).toEqual([])
  })

  it('keeps curriculum weeks unique and sequential', () => {
    expect(CURRICULUM_MODULES).toHaveLength(9)
    expect(CURRICULUM_MODULES.map((module) => module.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('keeps the FAQ destination in public navigation', () => {
    expect(SITE_CONFIG.publicNavigation).toContainEqual({ label: 'FAQ', href: '#faq' })
  })
})
