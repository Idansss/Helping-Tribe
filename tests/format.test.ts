import { describe, expect, it } from 'vitest'
import { formatNaira, formatProgrammeDate } from '@/lib/utils/format'

describe('Nigerian presentation formatters', () => {
  it('formats naira without decimal noise', () => {
    expect(formatNaira(195000)).toBe('₦195,000')
  })

  it('formats dates in British English and fails safely', () => {
    expect(formatProgrammeDate('2026-07-26')).toBe('26 July 2026')
    expect(formatProgrammeDate('not-a-date')).toBe('Date to be confirmed')
  })
})
