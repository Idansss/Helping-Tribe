'use client'

import { useEffect, useState } from 'react'
import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award,
  Clock,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface AnalyticsStats {
  totalStudents: number
  activeStudents: number
  averageProgress: number
  completionRate: number
  totalBadgesEarned: number
  averageQuizScore: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalStudents: 0,
    activeStudents: 0,
    averageProgress: 0,
    completionRate: 0,
    totalBadgesEarned: 0,
    averageQuizScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      // Get total students
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      // Get active students (logged in within last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: activeStudents } = await supabase
        .from('user_activity')
        .select('user_id', { count: 'exact', head: true })
        .eq('activity_type', 'login')
        .gte('created_at', sevenDaysAgo.toISOString())

      // Get average progress
      const { data: progressData } = await supabase
        .from('module_progress')
        .select('completion_percentage')

      const averageProgress = progressData && progressData.length > 0
        ? progressData.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / progressData.length
        : 0

      // Get completion rate
      const { data: completedModules } = await supabase
        .from('module_progress')
        .select('*')
        .eq('completion_percentage', 100)

      const completionRate = progressData && progressData.length > 0
        ? (completedModules?.length || 0) / progressData.length * 100
        : 0

      // Get total badges earned
      const { count: totalBadges } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })

      // Get average quiz score
      const { data: quizScores } = await supabase
        .from('module_progress')
        .select('quiz_score')
        .not('quiz_score', 'is', null)

      const averageQuizScore = quizScores && quizScores.length > 0
        ? quizScores.reduce((sum, q) => sum + (q.quiz_score || 0), 0) / quizScores.length
        : 0

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        averageProgress: Math.round(averageProgress),
        completionRate: Math.round(completionRate),
        totalBadgesEarned: totalBadges || 0,
        averageQuizScore: Math.round(averageQuizScore),
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-purple-500',
      trend: '+12%',
    },
    {
      label: 'Active This Week',
      value: stats.activeStudents,
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      label: 'Avg. Progress',
      value: `${stats.averageProgress}%`,
      icon: Target,
      color: 'bg-purple-500',
      trend: '+15%',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: Award,
      color: 'bg-orange-500',
      trend: '+5%',
    },
    {
      label: 'Badges Earned',
      value: stats.totalBadgesEarned,
      icon: Award,
      color: 'bg-yellow-500',
      trend: '+20',
    },
    {
      label: 'Avg. Quiz Score',
      value: `${stats.averageQuizScore}%`,
      icon: BookOpen,
      color: 'bg-indigo-500',
      trend: '+3%',
    },
  ]

  if (loading) {
    return (
      <LearnerPortalPlaceholder>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c1d95]"></div>
        </div>
      </LearnerPortalPlaceholder>
    )
  }

  return (
    <LearnerPortalPlaceholder>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#4c1d95] mb-2">📊 Platform Analytics</h1>
          <p className="text-gray-600">Real-time insights into student engagement and progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={cn(stat.color, "w-12 h-12 rounded-lg flex items-center justify-center")}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{stat.trend} from last week</span>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Progress Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-[#4c1d95]" />
              <h3 className="text-xl font-bold text-[#4c1d95]">Module Progress Distribution</h3>
            </div>
            <div className="space-y-4">
              {[
                { module: 'Module 1: Ethics & Culture', progress: 85 },
                { module: 'Module 2: Exploration & Trauma', progress: 72 },
                { module: 'Module 3: Action & Conflict', progress: 58 },
                { module: 'Module 4: Self-Care', progress: 45 },
                { module: 'Module 5: Special Populations', progress: 32 },
              ].map((item) => (
                <div key={item.module}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.module}</span>
                    <span className="text-sm text-gray-600">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="h-6 w-6 text-[#4c1d95]" />
              <h3 className="text-xl font-bold text-[#4c1d95]">Engagement Metrics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Discussion Participation</span>
                <Badge className="bg-green-500 text-white">87%</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Assignment Submission</span>
                <Badge className="bg-yellow-500 text-white">75%</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Peer Circle Attendance</span>
                <Badge className="bg-purple-500 text-white">92%</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Resource Downloads</span>
                <Badge className="bg-purple-500 text-white">64%</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-[#4c1d95] mb-4">📈 Recent Activity</h3>
          <div className="space-y-3">
            {[
              { user: 'Chinedu A.', action: 'Completed Module 3 Quiz', time: '2 hours ago', score: 95 },
              { user: 'Abass Ibrahim', action: 'Submitted Reflection Essay', time: '5 hours ago' },
              { user: 'Sarah O.', action: 'Joined Peer Circle Alpha', time: '1 day ago' },
              { user: 'Michael K.', action: 'Earned "7-Day Streak" Badge', time: '1 day ago' },
              { user: 'Grace N.', action: 'Completed Voice Note Reflection', time: '2 days ago' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      <span className="text-[#4c1d95]">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                {activity.score && (
                  <Badge className="bg-green-100 text-green-700">
                    {activity.score}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </LearnerPortalPlaceholder>
  )
}
