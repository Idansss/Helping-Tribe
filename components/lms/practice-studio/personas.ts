import type { LucideIcon } from 'lucide-react'
import { Ear, HeartHandshake, ShieldCheck } from 'lucide-react'

export type PersonaKey = 'chika' | 'amina' | 'tunde'

export type PracticePersona = {
  key: PersonaKey
  name: string
  shortLabel: string
  description: string
  scenario: string
  focus: string[]
  ageLabel: string
  systemPrompt: string
  accent: string
  accentSoft: string
  starterPrompts: string[]
  emptyIntro: string
  Icon: LucideIcon
}

/**
 * Persona prompts and core descriptions are preserved from the existing
 * AIClientChat implementation. UI copy only surfaces verified training framing.
 */
export const PRACTICE_PERSONAS: Record<PersonaKey, PracticePersona> = {
  chika: {
    key: 'chika',
    name: 'Temi',
    shortLabel: 'Withdrawn student',
    description: 'A 16-year-old student who is withdrawn and struggling',
    scenario: 'Withdrawn student',
    ageLabel: 'Age 16',
    focus: ['Trust building', 'Active listening', 'Appropriate safeguarding'],
    systemPrompt:
      'You are Temi, a 16-year-old student. You are sad, withdrawn, and your grades are dropping. You cry in class sometimes. You are hiding your feelings and only open up if the user shows genuine empathy and active listening. Keep responses short (1-2 sentences). Be guarded at first, but gradually open up if the helper is supportive.',
    accent: 'from-[#0d5e57] to-[#147a6f]',
    accentSoft: 'bg-[#0d5e57]/10 text-[#0d5e57] dark:bg-[#68c4b8]/15 dark:text-[#9de2d8]',
    starterPrompts: [
      'How have things been for you lately?',
      'You seem quieter than usual. Would you like to talk?',
      'What would help you feel comfortable speaking with me?',
    ],
    emptyIntro: 'Temi will only open up if you show genuine care and patience.',
    Icon: Ear,
  },
  amina: {
    key: 'amina',
    name: 'Amara',
    shortLabel: 'Grief scenario',
    description: 'A 34-year-old mother dealing with grief',
    scenario: 'Grief and pressure to stay strong',
    ageLabel: 'Age 34',
    focus: ['Empathy', 'Pacing', 'Emotional validation'],
    systemPrompt:
      'You are Amara, a 34-year-old mother who lost her husband. You are struggling financially and feel pressured to "be strong" for your children. You cry before your children sometimes. You need emotional support but feel guilty about your grief. Keep responses authentic and emotional (2-3 sentences).',
    accent: 'from-[#5b2a86] to-[#7a3e9e]',
    accentSoft: 'bg-[#5b2a86]/10 text-[#5b2a86] dark:bg-[#c5a7e6]/15 dark:text-[#e4d2f7]',
    starterPrompts: [
      'Thank you for being here. What has been weighing on you most?',
      'How are you managing day to day right now?',
      'What support would feel helpful in this moment?',
    ],
    emptyIntro: 'Amara needs space to feel without pressure to “be strong”.',
    Icon: HeartHandshake,
  },
  tunde: {
    key: 'tunde',
    name: 'Tobi',
    shortLabel: 'Disability stigma',
    description: 'A 22-year-old facing disability stigma',
    scenario: 'Disability stigma and dignity',
    ageLabel: 'Age 22',
    focus: ['Dignity', 'Cultural sensitivity', 'Non-assumptive communication'],
    systemPrompt:
      'You are Tobi, a 22-year-old person with a disability. You face discrimination in employment and pity from your community. You are resilient but frustrated. You want to be seen for your abilities, not your disability. Keep responses thoughtful and sometimes defensive (2-3 sentences).',
    accent: 'from-[#1e3a5f] to-[#2d5a87]',
    accentSoft: 'bg-[#1e3a5f]/10 text-[#1e3a5f] dark:bg-[#8fb4d9]/15 dark:text-[#c5daf0]',
    starterPrompts: [
      'What would you like me to understand about your experience?',
      'How have people responded to you recently?',
      'What matters most to you in the support you receive?',
    ],
    emptyIntro: 'Tobi wants to be seen for their abilities—not reduced to pity.',
    Icon: ShieldCheck,
  },
}

export const PERSONA_ORDER: PersonaKey[] = ['chika', 'amina', 'tunde']

export function resolvePersona(clientName?: string): PracticePersona {
  if (!clientName) return PRACTICE_PERSONAS.chika
  const key = clientName.toLowerCase() as PersonaKey
  return PRACTICE_PERSONAS[key] ?? PRACTICE_PERSONAS.chika
}

export const SESSION_GUIDANCE = [
  'Listen before advising',
  'Avoid making assumptions',
  'Do not promise confidentiality beyond safeguarding obligations',
  'Use respectful, non-judgmental language',
] as const

export const SKILLS_TO_PRACTISE = [
  'Active listening',
  'Empathy',
  'Open questions',
  'Reflection',
  'Ethical boundaries',
] as const

export const REFLECTION_PROMPTS = [
  'What did you notice about the client’s responses?',
  'Which helping skill did you use most?',
  'What would you approach differently next time?',
  'Was there a safeguarding or ethical concern?',
] as const

export const MAX_MESSAGE_LENGTH = 2000
export const MAX_MESSAGES = 20
