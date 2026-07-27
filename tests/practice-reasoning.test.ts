import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  DEFAULT_REASONING_EFFORT,
  REASONING_OPTIONS,
  labelForReasoning,
} from '@/components/lms/practice-studio/types'

const ReasoningLevelSchema = z.enum(['low', 'medium', 'high'])

describe('practice studio reasoning', () => {
  it('exposes Quick / Balanced / Deep mapped to low / medium / high', () => {
    expect(REASONING_OPTIONS.map((o) => o.label)).toEqual(['Quick', 'Balanced', 'Deep'])
    expect(REASONING_OPTIONS.map((o) => o.effort)).toEqual(['low', 'medium', 'high'])
    expect(DEFAULT_REASONING_EFFORT).toBe('medium')
    expect(labelForReasoning('low')).toBe('Quick')
    expect(labelForReasoning('medium')).toBe('Balanced')
    expect(labelForReasoning('high')).toBe('Deep')
  })

  it('rejects unvalidated reasoning effort values', () => {
    expect(ReasoningLevelSchema.safeParse('medium').success).toBe(true)
    expect(ReasoningLevelSchema.safeParse('extreme').success).toBe(false)
    expect(ReasoningLevelSchema.safeParse('').success).toBe(false)
    expect(ReasoningLevelSchema.safeParse(undefined).success).toBe(false)
  })
})
