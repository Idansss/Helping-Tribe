'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import * as Icons from 'lucide-react'

interface BadgeData {
  id: string
  badge_key: string
  name: string
  description: string
  icon_name: string
  color: string
  earned_at?: string
}

export function BadgeDisplay({ userId }: { userId?: string }) {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    loadBadges()
  }, [userId])

  const loadBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id
      if (!targetUserId) return

      // Load all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('created_at')

      // Load user's earned badges
      const { data: earned } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', targetUserId)

      if (allBadges) {
        setBadges(allBadges as BadgeData[])
      }

      if (earned) {
        setEarnedBadges(new Set(earned.map(e => e.badge_id)))
      }
    } catch (error) {
      console.error('Error loading badges:', error)
    }
  }

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Award
    return IconComponent
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tribe Badges
        </CardTitle>
        <CardDescription>
          Earn badges by engaging with the community and completing activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const IconComponent = getIcon(badge.icon_name)
            const isEarned = earnedBadges.has(badge.id)

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  isEarned
                    ? 'border-primary bg-primary/5'
                    : 'border-muted bg-muted/30 opacity-60'
                }`}
                title={badge.description}
              >
                <IconComponent
                  className={`h-8 w-8 mx-auto mb-2 ${
                    isEarned ? `text-${badge.color}-500` : 'text-muted-foreground'
                  }`}
                />
                <p className="text-sm font-semibold">{badge.name}</p>
                {isEarned && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Earned
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
