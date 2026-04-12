import { describe, expect, it } from 'vitest'
import {
  isWeekManuallyUnlocked,
  normalizeManualUnlockedWeeks,
  serializeCourseAccessSettings,
} from '../lib/settings/course-access'

describe('course access settings helpers', () => {
  it('normalizes manual unlocked weeks to a sorted unique list', () => {
    expect(normalizeManualUnlockedWeeks([3, '2', 3, 10, 0, 'abc', 1])).toEqual([1, 2, 3])
  })

  it('serializes settings with normalized weeks', () => {
    expect(
      serializeCourseAccessSettings({
        manualUnlockedWeeks: [5, 2, 5, 4],
      })
    ).toEqual({
      weeks: [2, 4, 5],
    })
  })

  it('checks whether a week is manually unlocked', () => {
    expect(isWeekManuallyUnlocked(4, [2, 4, 6])).toBe(true)
    expect(isWeekManuallyUnlocked(3, [2, 4, 6])).toBe(false)
  })
})
