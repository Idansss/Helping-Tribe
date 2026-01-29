'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  BookOpen,
  Target,
  Clock,
  Activity,
  TrendingUp,
  MessageCircle,
  CalendarDays,
  CheckCircle2,
  Brain,
  HeartHandshake,
  ArrowRight,
  Plus,
  Layers3,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function MentorDashboardPage() {
  const supabase = createClient()
  const [mentorName, setMentorName] = useState<string>('Mentor')
  const [coursesCount, setCoursesCount] = useState(0)
  const [assignedLearnersCount, setAssignedLearnersCount] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)
  const [ethicsCompliancePct, setEthicsCompliancePct] = useState(0)
  const [peerCircleParticipationPct, setPeerCircleParticipationPct] = useState(0)
  const [supervisionHours, setSupervisionHours] = useState(0)
  const [recentCourses, setRecentCourses] = useState<{ id: string; title: string; completionRate: number }[]>([])

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    loadStats()
  }, [])

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (profile?.full_name) {
        setMentorName(profile.full_name)
      } else {
        setMentorName(user.email?.split('@')[0] || 'Mentor')
      }
    } catch (error) {
      console.error('Error loading mentor profile', error)
    }
  }

  async function loadStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count: modulesCount } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
      setCoursesCount(modulesCount ?? 0)

      const { data: myCircles } = await supabase
        .from('peer_circles')
        .select('id')
        .eq('created_by', user.id)
      const circleIds = (myCircles ?? []).map((c: { id: string }) => c.id)

      let assignedCount = 0
      if (circleIds.length > 0) {
        const { data: members } = await supabase
          .from('peer_circle_members')
          .select('user_id')
          .in('circle_id', circleIds)
        const uniqueUserIds = new Set((members ?? []).map((m: { user_id: string }) => m.user_id))
        assignedCount = uniqueUserIds.size
      }
      setAssignedLearnersCount(assignedCount)

      const { data: modulesData } = await supabase.from('modules').select('id, week_number').order('week_number', { ascending: true })
      const totalModules = modulesData?.length ?? 0
      const ethicsWeekNumbers = [3, 4, 5]
      const ethicsModuleIds = (modulesData ?? []).filter((m: { week_number: number }) => ethicsWeekNumbers.includes(m.week_number)).map((m: { id: string }) => m.id)

      const { data: allProgress } = await supabase.from('module_progress').select('user_id, module_id, completed')
      const progressList = (allProgress ?? []) as { user_id: string; module_id: string; completed: boolean }[]

      const { data: studentProfiles } = await supabase.from('profiles').select('id').eq('role', 'student')
      const studentIds = new Set((studentProfiles ?? []).map((p: { id: string }) => p.id))
      const totalExpected = studentIds.size * totalModules
      let completedTotal = 0
      let ethicsCompleted = 0
      let ethicsExpected = studentIds.size * ethicsModuleIds.length
      const completedByUser = new Set<string>()
      progressList.forEach((p) => {
        if (!studentIds.has(p.user_id)) return
        if (p.completed) {
          completedTotal += 1
          if (ethicsModuleIds.includes(p.module_id)) ethicsCompleted += 1
          completedByUser.add(p.user_id)
        }
      })
      const overallPct = totalExpected > 0 ? Math.round((completedTotal / totalExpected) * 10000) / 100 : 0
      setCompletionRate(overallPct)
      const ethicsPct = ethicsExpected > 0 ? Math.round((ethicsCompleted / ethicsExpected) * 100) : 0
      setEthicsCompliancePct(ethicsPct)

      const { data: distinctMembers } = await supabase
        .from('peer_circle_members')
        .select('user_id')
      const uniqueInCircle = new Set((distinctMembers ?? []).map((m: { user_id: string }) => m.user_id))
      const studentsInCircle = [...uniqueInCircle].filter((id) => studentIds.has(id)).length
      const participationPct = studentIds.size > 0 ? Math.round((studentsInCircle / studentIds.size) * 100) : 0
      setPeerCircleParticipationPct(participationPct)

      let sessionsCount = 0
      if (circleIds.length > 0) {
        const { count } = await supabase
          .from('peer_circle_sessions')
          .select('*', { count: 'exact', head: true })
          .in('circle_id', circleIds)
        sessionsCount = count ?? 0
      }
      setSupervisionHours(sessionsCount)

      const { data: modRows } = await supabase.from('modules').select('id, title').order('week_number', { ascending: true }).limit(5)
      const completionByModule: Record<string, number> = {}
      if (progressList.length > 0 && modRows?.length) {
        const byMod: Record<string, { done: number; total: number }> = {}
        progressList.forEach((p) => {
          if (!byMod[p.module_id]) byMod[p.module_id] = { done: 0, total: 0 }
          byMod[p.module_id].total += 1
          if (p.is_completed) byMod[p.module_id].done += 1
        })
        modRows.forEach((m: { id: string }) => {
          const g = byMod[m.id]
          completionByModule[m.id] = g && g.total > 0 ? Math.round((g.done / g.total) * 100) : 0
        })
      }
      setRecentCourses(
        (modRows ?? []).map((m: { id: string; title: string }) => ({
          id: m.id,
          title: m.title,
          completionRate: completionByModule[m.id] ?? 0,
        }))
      )
    } catch (e) {
      console.error('Error loading mentor stats', e)
    }
  }

  return (
    <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-purple-800">
            Welcome, {mentorName}!
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm">
            Monitor your learners, track course engagement, and quickly see
            where support is needed.
          </p>
        </div>

        {/* Counseling-centered stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col gap-1 border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ethics compliance
              </span>
              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-800">{ethicsCompliancePct}%</span>
          </Card>
          <Card className="p-4 flex flex-col gap-1 border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Peer circle participation
              </span>
              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                <HeartHandshake className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-800">{peerCircleParticipationPct}%</span>
          </Card>
          <Card className="p-4 flex flex-col gap-1 border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supervision hours
              </span>
              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-800">{supervisionHours}h</span>
          </Card>
        </div>

        {/* Overview Statistics */}
        <Card className="p-5 border-[#e2e8f0]">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{coursesCount}</p>
                <p className="text-xs text-slate-500">Courses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{assignedLearnersCount}</p>
                <p className="text-xs text-slate-500">Assigned learners</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completionRate.toFixed(2)}%</p>
                <p className="text-xs text-slate-500">Completion rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{supervisionHours}h 0m</p>
                <p className="text-xs text-slate-500">Training time</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main grid: recent courses + quick actions + don't miss + today */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent course activity */}
          <Card className="p-5 lg:col-span-2 space-y-4 border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <Link href="/mentor/courses" className="flex items-center gap-2 group">
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Recent course activity
                </h2>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>
              <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-50 border border-purple-200 flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Teaching
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentCourses.length === 0 ? (
                <Card className="p-4 border-slate-200 flex flex-col gap-2">
                  <p className="text-sm text-slate-500">No courses yet. Create or import courses to see activity.</p>
                </Card>
              ) : (
                recentCourses.slice(0, 4).map((course) => (
                  <Card key={course.id} className="p-4 border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 truncate" title={course.title}>
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-500">Module</p>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Completion rate</span>
                        <span>{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <div className="space-y-4">
            <Card className="p-5 bg-purple-50 border-purple-200">
              <h2 className="text-sm font-semibold text-purple-800 mb-3">
                Quick actions
              </h2>
              <div className="flex flex-col gap-2">
                <Link href="/mentor/courses">
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2 bg-white text-purple-800 hover:bg-purple-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add course
                  </Button>
                </Link>
                <Link href="/mentor/groups">
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2 bg-white text-purple-800 hover:bg-purple-100"
                  >
                    <Users className="h-4 w-4" />
                    Add group
                  </Button>
                </Link>
                <Link href="/mentor/conferences">
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2 bg-white text-purple-800 hover:bg-purple-100"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Add conference
                  </Button>
                </Link>
                <Link href="/mentor/learning-paths">
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2 bg-white text-purple-800 hover:bg-purple-100"
                  >
                    <Layers3 className="h-4 w-4" />
                    Training matrix
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Don't miss */}
            <Card className="p-4 border-[#e2e8f0]">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Don&apos;t miss
              </h2>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  You have no items pending grading.{' '}
                  <Link href="/mentor/grading" className="text-purple-700 font-medium cursor-pointer hover:underline">
                    Go to Grading Hub
                  </Link>
                </li>
                <li>You have no courses that are expiring soon.</li>
                <li>
                  You are not registered to attend any online sessions today.
                </li>
                <li>
                  You are not registered to attend any online sessions this
                  month.
                </li>
                <li>None of your recent discussion posts have replies.</li>
              </ul>
            </Card>

            {/* Today schedule */}
            <Card className="p-4 border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Today
                  </h2>
                  <Link 
                    href="/mentor/calendar" 
                    className="text-[11px] text-slate-500 hover:text-purple-600 cursor-pointer transition-colors"
                  >
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </Link>
                </div>
                <CalendarDays className="h-4 w-4 text-purple-600" />
              </div>
              <div className="border border-dashed border-[#e2e8f0] rounded-md py-4 text-center text-xs text-slate-500">
                Nothing happening today
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border-[#e2e8f0]">
            <Link
              href="/mentor/courses"
              className="flex items-center justify-between group"
            >
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                Courses&apos; progress status
              </h2>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </Link>
            <div className="mt-4 text-center py-6">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">No stats to show</p>
              <p className="text-xs text-slate-500 mb-3">
                Create your first course now
              </p>
              <Link href="/mentor/courses">
                <Button size="sm" variant="outline" className="text-xs">
                  Go to courses
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-5 border-[#e2e8f0]">
            <Link
              href="/mentor/reports"
              className="flex items-center justify-between group"
            >
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                Courses&apos; completion rate
              </h2>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </Link>
            <div className="mt-4 text-center py-6">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">No stats to show</p>
              <p className="text-xs text-slate-500 mb-3">
                Create your first course now
              </p>
              <Link href="/mentor/courses">
                <Button size="sm" variant="outline" className="text-xs">
                  Go to courses
                </Button>
              </Link>
            </div>
          </Card>
        </div>
    </div>
  )
}

