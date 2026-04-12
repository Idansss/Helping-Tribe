'use client'

import { useEffect, useState } from 'react'
import { normalizeManualUnlockedWeeks } from '@/lib/settings/course-access'

type CourseAccessResponse = {
  manualUnlockedWeeks?: number[]
}

export function useCourseAccessSettings() {
  const [manualUnlockedWeeks, setManualUnlockedWeeks] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings/course-access')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load course access settings.')
        }

        return response.json() as Promise<CourseAccessResponse>
      })
      .then((data) => {
        if (cancelled) return
        setManualUnlockedWeeks(normalizeManualUnlockedWeeks(data.manualUnlockedWeeks ?? []))
      })
      .catch(() => {
        if (!cancelled) setManualUnlockedWeeks([])
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
    manualUnlockedWeeks,
  }
}
