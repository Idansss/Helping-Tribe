'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ActivityType = 'self_learning' | 'peer_learning' | 'quiz' | 'assignment'

export interface GateResult {
  locked: boolean
  loading: boolean
  degraded: boolean
  degradedMessage?: string
  prerequisiteName: string
  prerequisiteHref: string
}

const PREREQUISITE_INFO: Record<ActivityType, { name: string; href: string }> = {
  self_learning: { name: "Monday's faculty discussion", href: '/learner/discussions' },
  peer_learning: { name: "Tuesday's self-learning lesson", href: '/learner/course/modules' },
  quiz: { name: "Wednesday's peer learning", href: '/learner/circles' },
  assignment: { name: "Thursday's quiz", href: '/learner/quizzes' },
}

/** Checks the daily prerequisite gate and fails open with a visible degraded state. */
export function useActivityGate(activityType: ActivityType, specificModuleId?: string): GateResult {
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [degraded, setDegraded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function check() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase.rpc('get_activity_gate_status', {
          p_user_id: user.id,
          p_activity: activityType,
          p_module_id: specificModuleId ?? null,
        })

        if (cancelled) return
        if (error) {
          // Access intentionally remains open during schema/service recovery.
          // Surfacing the state in ActivityGate avoids both a silent failure and
          // the Next.js development overlay caused by the former console.error.
          setLocked(false)
          setDegraded(true)
          return
        }

        setLocked(Boolean((data as { locked?: boolean } | null)?.locked))
        setDegraded(false)
      } catch {
        if (!cancelled) {
          setLocked(false)
          setDegraded(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [activityType, specificModuleId])

  return {
    locked,
    loading,
    degraded,
    degradedMessage: degraded
      ? 'Prerequisite checks are temporarily unavailable. Access remains open while the service reconnects.'
      : undefined,
    prerequisiteName: PREREQUISITE_INFO[activityType].name,
    prerequisiteHref: PREREQUISITE_INFO[activityType].href,
  }
}
