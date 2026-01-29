'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  Users, 
  FileSearch,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface Recommendation {
  id: string
  type: 'module' | 'case_study' | 'peer_circle' | 'resource'
  title: string
  reason: string
  urgency: 'high' | 'medium' | 'low'
  icon: any
  href: string
}

export function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    generateRecommendations()
  }, [])

  async function generateRecommendations() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const recs: Recommendation[] = []

      // Get user's progress
      const { data: progress } = await supabase
        .from('module_progress')
        .select('*, modules(*)')
        .eq('user_id', user.id)
        .order('completion_percentage', { ascending: false })

      // Recommend next module
      if (progress && progress.length > 0) {
        const inProgressModule = progress.find(p => 
          p.completion_percentage > 0 && p.completion_percentage < 100
        )

        if (inProgressModule) {
          recs.push({
            id: 'continue-module',
            type: 'module',
            title: `Continue Module ${inProgressModule.modules.week_number}: ${inProgressModule.modules.title}`,
            reason: `You're ${inProgressModule.completion_percentage}% through! Finish strong.`,
            urgency: 'high',
            icon: BookOpen,
            href: '/course/module/1'
          })
        }
      }

      // Check for incomplete assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*, submissions!left(id)')
        .eq('submissions.user_id', user.id)
        .is('submissions.id', null)
        .limit(1)

      if (assignments && assignments.length > 0) {
        recs.push({
          id: 'pending-assignment',
          type: 'module',
          title: 'Complete Pending Assignment',
          reason: 'You have an assignment due soon. Stay on track!',
          urgency: 'high',
          icon: FileText,
          href: '/assignments'
        })
      }

      // Recommend joining a peer circle if not in one
      const { data: peerMembership } = await supabase
        .from('peer_circle_members')
        .select('circle_id')
        .eq('user_id', user.id)
        .limit(1)

      if (!peerMembership || peerMembership.length === 0) {
        recs.push({
          id: 'join-peer-circle',
          type: 'peer_circle',
          title: 'Join a Peer Learning Circle',
          reason: 'Connect with fellow learners for support and shared growth.',
          urgency: 'medium',
          icon: Users,
          href: '/peer-circles'
        })
      }

      // Recommend case studies based on current module
      if (progress && progress.length > 0) {
        const currentModule = progress[0]
        if (currentModule.completion_percentage >= 50) {
          recs.push({
            id: 'practice-case',
            type: 'case_study',
            title: 'Practice with a Related Case Study',
            reason: 'Apply what you\'ve learned with a real-world scenario.',
            urgency: 'medium',
            icon: FileSearch,
            href: '/case-studies'
          })
        }
      }

      // Recommend using AI practice client
      const { data: aiSessions } = await supabase
        .from('ai_client_sessions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!aiSessions || aiSessions.length === 0) {
        recs.push({
          id: 'try-ai-client',
          type: 'resource',
          title: 'Try the AI Practice Client',
          reason: 'Build confidence by practicing counseling conversations with AI.',
          urgency: 'low',
          icon: Sparkles,
          href: '/practice-client'
        })
      }

      setRecommendations(recs)
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
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

  if (recommendations.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-[#4c1d95]" />
          <h3 className="text-xl font-bold text-[#4c1d95]">Personalized for You</h3>
        </div>
        <p className="text-gray-600">You're all caught up! Check back later for new recommendations.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#4c1d95]">Recommended for You</h3>
          <p className="text-sm text-gray-600">Based on your progress and learning style</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          const Icon = rec.icon
          return (
            <Link key={rec.id} href={rec.href}>
              <div className="p-4 rounded-xl border-2 border-purple-100 hover:border-[#4c1d95] hover:bg-purple-50/50 transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#4c1d95] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-[#4c1d95] transition-colors">
                        {rec.title}
                      </h4>
                      <Badge className={cn("capitalize", getUrgencyColor(rec.urgency))}>
                        {rec.urgency}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                    <div className="flex items-center gap-2 text-[#4c1d95] font-medium text-sm group-hover:gap-3 transition-all">
                      <span>Start now</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
