export type ChatRole = 'user' | 'assistant'

export type PracticeMessage = {
  role: ChatRole
  content: string
  timestamp: Date
}

export type SessionStatus = 'loading' | 'not_started' | 'in_progress' | 'ready_for_reflection'

export type SendErrorKind =
  | 'network'
  | 'unauthorized'
  | 'rate_limit'
  | 'unavailable'
  | 'validation'
  | 'unknown'

export type SendError = {
  kind: SendErrorKind
  message: string
}

/** Server-validated reasoning effort values (Responses API). */
export type ReasoningEffort = 'low' | 'medium' | 'high'

export type ReasoningOption = {
  effort: ReasoningEffort
  label: 'Quick' | 'Balanced' | 'Deep'
  description: string
}

export const REASONING_OPTIONS: readonly ReasoningOption[] = [
  {
    effort: 'low',
    label: 'Quick',
    description: 'Faster response with lower reasoning effort.',
  },
  {
    effort: 'medium',
    label: 'Balanced',
    description: 'Recommended default. Balanced speed and depth.',
  },
  {
    effort: 'high',
    label: 'Deep',
    description: 'More deliberate response. May take longer.',
  },
] as const

export const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'medium'

export function labelForReasoning(effort: ReasoningEffort): ReasoningOption['label'] {
  return REASONING_OPTIONS.find((option) => option.effort === effort)?.label ?? 'Balanced'
}
