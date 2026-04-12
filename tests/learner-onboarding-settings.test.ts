import { describe, expect, it } from 'vitest'
import {
  createLearnerOnboardingDraft,
  hasLearnerOnboardingVideos,
  normalizeLearnerOnboardingSettings,
} from '../lib/settings/learner-onboarding'

describe('learner onboarding settings helpers', () => {
  it('returns empty slots when settings are missing or blank', () => {
    const settings = normalizeLearnerOnboardingSettings({
      welcomeVideo: {
        title: 'Welcome',
        description: 'Course overview',
        url: '',
      },
      portalGuideVideo: null,
    })

    expect(settings.welcomeVideo).toBeNull()
    expect(settings.portalGuideVideo).toBeNull()
    expect(hasLearnerOnboardingVideos(settings)).toBe(false)
  })

  it('fills in default copy when URL exists but title or description is blank', () => {
    const settings = normalizeLearnerOnboardingSettings({
      welcomeVideo: {
        title: '   ',
        description: '',
        url: 'https://example.com/welcome.mp4',
      },
      portalGuideVideo: {
        title: 'Portal walkthrough',
        description: 'How to complete activities.',
        url: 'https://youtu.be/abc123',
      },
    })

    expect(settings.welcomeVideo?.title).toBe('Welcome to the course')
    expect(settings.welcomeVideo?.description).toBe(
      'A short welcome and overview of the HELP Foundations training.'
    )
    expect(settings.portalGuideVideo?.title).toBe('Portal walkthrough')
    expect(hasLearnerOnboardingVideos(settings)).toBe(true)
  })

  it('creates admin draft values with defaults and saved URLs', () => {
    const draft = createLearnerOnboardingDraft({
      welcomeVideo: {
        title: 'Custom welcome',
        description: 'Say hello to learners.',
        url: 'https://example.com/welcome.mp4',
      },
      portalGuideVideo: null,
    })

    expect(draft.welcomeVideo.title).toBe('Custom welcome')
    expect(draft.welcomeVideo.url).toBe('https://example.com/welcome.mp4')
    expect(draft.portalGuideVideo.title).toBe('How to use the portal')
    expect(draft.portalGuideVideo.url).toBe('')
  })
})
