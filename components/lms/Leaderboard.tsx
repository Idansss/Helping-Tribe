'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface LeaderboardEntry {
  user_id: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  badges_earned: number
  rank: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch user points and badges
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          user_id,
          profiles!inner(full_name, avatar_url)
        `)

      if (error) throw error

      // Calculate points and rank
      const userStats = new Map<string, { full_name: string | null; avatar_url: string | null; badges: number }>()
      
      data?.forEach((item: any) => {
        const userId = item.user_id
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            full_name: item.profiles?.full_name || 'Student',
            avatar_url: item.profiles?.avatar_url || null,
            badges: 0
          })
        }
        const stats = userStats.get(userId)!
        stats.badges += 1
        userStats.set(userId, stats)
      })

      // Convert to array and sort
      const entries: LeaderboardEntry[] = Array.from(userStats.entries())
        .map(([user_id, stats]) => ({
          user_id,
          full_name: stats.full_name,
          avatar_url: stats.avatar_url,
          total_points: stats.badges * 100, // 100 points per badge
          badges_earned: stats.badges,
          rank: 0
        }))
        .sort((a, b) => b.total_points - a.total_points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))

      setLeaderboard(entries.slice(0, 10)) // Top 10

      // Find current user's rank
      if (user) {
        const userEntry = entries.find(e => e.user_id === user.id)
        setCurrentUserRank(userEntry?.rank || null)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />
      default:
        return <span className="text-gray-500 font-bold">#{rank}</span>
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c1d95]"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#4c1d95]">Tribe Leaderboard</h3>
          <p className="text-sm text-gray-600">Top performers this month</p>
        </div>
      </div>

      {currentUserRank && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Your Current Rank</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <Badge className="bg-[#4c1d95] text-white">#{currentUserRank}</Badge>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No leaderboard data yet. Start earning badges to appear here!
          </p>
        ) : (
          leaderboard.map((entry) => (
            <div
              key={entry.user_id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-all",
                entry.rank <= 3 
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200" 
                  : "bg-gray-50 hover:bg-gray-100"
              )}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-purple-200 overflow-hidden flex items-center justify-center">
                {entry.avatar_url ? (
                  <img 
                    src={entry.avatar_url} 
                    alt={entry.full_name || 'Student'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-purple-700 font-bold text-lg">
                    {entry.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{entry.full_name || 'Student'}</p>
                <p className="text-xs text-gray-500">{entry.badges_earned} {entry.badges_earned === 1 ? 'badge' : 'badges'}</p>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="font-bold text-[#4c1d95] text-lg">{entry.total_points.toLocaleString()}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
