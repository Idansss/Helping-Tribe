import type { SupabaseClient } from '@supabase/supabase-js'

export const LEARNER_ONBOARDING_SETTINGS_KEY = 'learner_onboarding_videos'

export type LearnerOnboardingVideoSlot = 'welcomeVideo' | 'portalGuideVideo'

export type LearnerOnboardingVideo = {
  title: string
  description: string
  url: string
}

export type LearnerOnboardingSettings = {
  welcomeVideo: LearnerOnboardingVideo | null
  portalGuideVideo: LearnerOnboardingVideo | null
}

export const DEFAULT_LEARNER_ONBOARDING_FORM = {
  welcomeVideo: {
    title: 'Welcome to the course',
    description: 'A short welcome and overview of the HELP Foundations training.',
    url: '',
  },
  portalGuideVideo: {
    title: 'How to use the portal',
    description: 'A quick walkthrough of how to navigate the portal and complete your activities.',
    url: '',
  },
} as const satisfies Record<LearnerOnboardingVideoSlot, LearnerOnboardingVideo>

function normalizeText(value: unknown) {
  return String(value ?? '').trim()
}

function normalizeVideoSlot(
  slot: LearnerOnboardingVideoSlot,
  input: unknown
): LearnerOnboardingVideo | null {
  if (!input || typeof input !== 'object') return null

  const raw = input as Partial<LearnerOnboardingVideo>
  const url = normalizeText(raw.url)
  if (!url) return null

  return {
    title: normalizeText(raw.title) || DEFAULT_LEARNER_ONBOARDING_FORM[slot].title,
    description:
      normalizeText(raw.description) || DEFAULT_LEARNER_ONBOARDING_FORM[slot].description,
    url,
  }
}

export function normalizeLearnerOnboardingSettings(
  input: unknown
): LearnerOnboardingSettings {
  const source = input && typeof input === 'object' ? input : {}

  return {
    welcomeVideo: normalizeVideoSlot(
      'welcomeVideo',
      (source as Record<string, unknown>).welcomeVideo
    ),
    portalGuideVideo: normalizeVideoSlot(
      'portalGuideVideo',
      (source as Record<string, unknown>).portalGuideVideo
    ),
  }
}

export function createLearnerOnboardingDraft(
  settings?: Partial<LearnerOnboardingSettings>
) {
  return {
    welcomeVideo: {
      title:
        normalizeText(settings?.welcomeVideo?.title) ||
        DEFAULT_LEARNER_ONBOARDING_FORM.welcomeVideo.title,
      description:
        normalizeText(settings?.welcomeVideo?.description) ||
        DEFAULT_LEARNER_ONBOARDING_FORM.welcomeVideo.description,
      url: normalizeText(settings?.welcomeVideo?.url),
    },
    portalGuideVideo: {
      title:
        normalizeText(settings?.portalGuideVideo?.title) ||
        DEFAULT_LEARNER_ONBOARDING_FORM.portalGuideVideo.title,
      description:
        normalizeText(settings?.portalGuideVideo?.description) ||
        DEFAULT_LEARNER_ONBOARDING_FORM.portalGuideVideo.description,
      url: normalizeText(settings?.portalGuideVideo?.url),
    },
  }
}

export function hasLearnerOnboardingVideos(
  settings: LearnerOnboardingSettings
) {
  return Boolean(settings.welcomeVideo || settings.portalGuideVideo)
}

export function serializeLearnerOnboardingSettings(
  settings: LearnerOnboardingSettings
) {
  return {
    welcomeVideo: settings.welcomeVideo,
    portalGuideVideo: settings.portalGuideVideo,
  }
}

export async function getLearnerOnboardingSettings(
  admin: SupabaseClient
): Promise<LearnerOnboardingSettings> {
  const { data } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', LEARNER_ONBOARDING_SETTINGS_KEY)
    .maybeSingle()

  return normalizeLearnerOnboardingSettings(data?.value)
}
