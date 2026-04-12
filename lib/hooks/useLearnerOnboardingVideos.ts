'use client'

import { useEffect, useState } from 'react'
import {
  normalizeLearnerOnboardingSettings,
  type LearnerOnboardingSettings,
} from '@/lib/settings/learner-onboarding'

export function useLearnerOnboardingVideos() {
  const [settings, setSettings] = useState<LearnerOnboardingSettings>(
    normalizeLearnerOnboardingSettings({})
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings/learner-onboarding')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load learner onboarding videos.')
        }

        return response.json()
      })
      .then((data) => {
        if (cancelled) return
        setSettings(normalizeLearnerOnboardingSettings(data))
      })
      .catch(() => {
        if (!cancelled) {
          setSettings(normalizeLearnerOnboardingSettings({}))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return {
    loading,
    settings,
  }
}
