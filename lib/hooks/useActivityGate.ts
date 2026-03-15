'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ActivityType = 'self_learning' | 'peer_learning' | 'quiz' | 'assignment'

export interface GateResult {
  locked: boolean
  loading: boolean
  prerequisiteName: string
  prerequisiteHref: string
}

const PREREQUISITE_INFO: Record<ActivityType, { name: string; href: string }> = {
  self_learning: { name: "Monday's faculty discussion",    href: '/learner/discussions' },
  peer_learning: { name: "Tuesday's self-learning lesson", href: '/learner/course/modules' },
  quiz:          { name: "Wednesday's peer learning",      href: '/learner/circles' },
  assignment:    { name: "Thursday's quiz",                href: '/learner/quizzes' },
}

/**
 * Calls the `get_activity_gate_status` Postgres RPC (single round-trip) to
 * check whether the prerequisite for a given daily activity is satisfied.
 *
 * Weekly order:
 *   Discussion (Mon, free) → self_learning → peer_learning → quiz → assignment → live_session (Sat, free)
 *
 * @param activityType    The activity being gated.
 * @param specificModuleId  When provided (course module page), only gate if this
 *                          matches the active module — past modules are never gated.
 */
export function useActivityGate(activityType: ActivityType, specificModuleId?: string): GateResult {
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function check() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) setLoading(false)
          return
        }

        const { data, error } = await supabase.rpc('get_activity_gate_status', {
          p_user_id:   user.id,
          p_activity:  activityType,
          p_module_id: specificModuleId ?? null,
        })

        if (error) {
          // Fail open — never silently block a learner due to a query error
          console.error('useActivityGate RPC error:', error)
          if (!cancelled) { setLocked(false); setLoading(false) }
          return
        }

        if (!cancelled) setLocked(!!(data as { locked?: boolean })?.locked)
      } catch (e) {
        console.error('useActivityGate unexpected error:', e)
        if (!cancelled) setLocked(false)
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
    prerequisiteName: PREREQUISITE_INFO[activityType].name,
    prerequisiteHref: PREREQUISITE_INFO[activityType].href,
  }
}
