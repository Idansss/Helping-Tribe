'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Users, User } from 'lucide-react'

interface PeerCircle {
  id: string
  name: string
  description: string | null
  module_id: string | null
  max_members: number
  is_active: boolean
  created_by: string
  member_count?: number
  module?: {
    week_number: number
    title: string
  }
  creator?: {
    full_name: string
  }
  /** Names of peers in this circle (including current user) */
  peer_names?: string[]
}

/**
 * Learner-only view: circles are created by mentors; learners see only circles
 * they are assigned to, with their peers' names. No create / join / leave.
 */
export function PeerCircleList() {
  const [circles, setCircles] = useState<PeerCircle[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMyCircles()
  }, [])

  async function loadMyCircles() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get circle IDs where current user is a member
      const { data: myMemberships, error: memError } = await supabase
        .from('peer_circle_members')
        .select('circle_id')
        .eq('user_id', user.id)

      if (memError) throw memError
      if (!myMemberships?.length) {
        setCircles([])
        setLoading(false)
        return
      }

      const circleIds = myMemberships.map((m) => m.circle_id)

      const { data: circlesData, error } = await supabase
        .from('peer_circles')
        .select(`
          *,
          module:modules(week_number, title),
          creator:profiles!peer_circles_created_by_fkey(full_name)
        `)
        .in('id', circleIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (circlesData?.length) {
        const withPeers = await Promise.all(
          circlesData.map(async (circle) => {
            const { data: members } = await supabase
              .from('peer_circle_members')
              .select('profiles(full_name)')
              .eq('circle_id', circle.id)

            const peerNames: string[] = []
            if (Array.isArray(members)) {
              for (const row of members) {
                const rawProfiles = (row as {
                  profiles?: { full_name: string | null } | { full_name: string | null }[] | null
                })?.profiles
                const p = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles
                if (p?.full_name) peerNames.push(p.full_name)
                else peerNames.push('Unknown')
              }
            }

            const { count: memberCount } = await supabase
              .from('peer_circle_members')
              .select('*', { count: 'exact', head: true })
              .eq('circle_id', circle.id)

            return {
              ...circle,
              member_count: memberCount ?? 0,
              peer_names: peerNames
            }
          })
        )
        setCircles(withPeers as PeerCircle[])
      } else {
        setCircles([])
      }
    } catch (error) {
      console.error('Error loading peer circles:', error)
      setCircles([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500 text-sm">Loading your peer circles...</p>
      </div>
    )
  }

  if (circles.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm">
          You&apos;re not in any peer circles yet. Your mentor will add you to a circle; you&apos;ll then see it here with your peers.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm">
        Circles you&apos;re in, assigned by your mentor. Your peers are listed below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {circles.map((circle) => (
          <Card key={circle.id} className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-purple-600" />
                  {circle.name}
                </CardTitle>
                {circle.module && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    Week {circle.module.week_number}
                  </Badge>
                )}
              </div>
              {circle.description && (
                <CardDescription className="mt-1 text-xs">
                  {circle.description}
                </CardDescription>
              )}
              {circle.creator && (
                <p className="text-xs text-slate-500 mt-1">
                  Led by {circle.creator.full_name}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <p className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Your peers
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {(circle.peer_names ?? []).map((name, i) => (
                    <li key={i}>{name || 'Unknown'}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
