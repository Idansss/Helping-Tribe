'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/admin/EmptyState'
import { DashboardSkeleton } from '@/components/lms/LoadingSkeletons'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen,
  CalendarDays,
  ArrowRight,
  Award,
  Target,
  FileText,
  Users,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

const MODULE_TITLES: Record<number, string> = {
  1: 'Helping Profession, Ethics, Cultural Competence',
  2: 'Exploration & Insight Stages, Trauma-Informed Practice',
  3: 'Action Stage, Conflict Resolution',
  4: 'Self-Care & Supervision',
  5: 'Working with Special Populations',
  6: 'Crisis Intervention & Trauma Counselling',
  7: 'Group Counselling & Peer Support',
  8: 'Case Analysis & Feedback',
  9: 'Final Projects & Wrap-Up',
}

export function DashboardContent() {
  const router = useRouter()
  const supabase = createClient()
  const [learnerName, setLearnerName] = useState<string>('Learner')
  const [currentWeek, setCurrentWeek] = useState<number>(1)
  const [moduleProgress, setModuleProgress] = useState<number>(0)
  const [journalCount, setJournalCount] = useState(0)
  const [hasStats, setHasStats] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPeerCircleMember, setIsPeerCircleMember] = useState(false)
  const [completedModulesCount, setCompletedModulesCount] = useState(0)

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    loadProgress()
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
        setLearnerName(profile.full_name)
      } else {
        setLearnerName(user.email?.split('@')[0] || 'Learner')
      }
    } catch (error) {
      console.error('Error loading learner profile', error)
    }
  }

  async function loadProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: modData } = await supabase
        .from('modules')
        .select('id, week_number')
        .order('week_number', { ascending: true })

      if (modData?.length) {
        const { data: progressData } = await supabase
          .from('module_progress')
          .select('module_id, progress, completed')
          .eq('user_id', user.id)

        if (progressData?.length) {
          const completed = progressData.filter((p: { completed: boolean }) => p.completed).length
          const inProgress = progressData.find((p: { completed: boolean }) => !p.completed) as { progress?: number } | undefined
          setCompletedModulesCount(completed)
          setCurrentWeek(Math.min(completed + 1, 9))
          setModuleProgress(completed >= (modData?.length ?? 9) ? 100 : (inProgress?.progress ?? 0))
          setHasStats(completed > 0 || (inProgress?.progress ?? 0) > 0)
        }
      }

      const { count } = await supabase
        .from('learning_journals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setJournalCount(count ?? 0)

      const { count: circleCount } = await supabase
        .from('peer_circle_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setIsPeerCircleMember((circleCount ?? 0) > 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  const totalModules = 9
  const overallPercent =
    completedModulesCount >= totalModules
      ? 100
      : Math.min(100, Math.round(((currentWeek - 1) * 100 + moduleProgress) / totalModules))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Welcome, {learnerName}!
        </h1>
        <p className="text-slate-600 mt-1">
          Your counseling training journey continues here. Track your progress, join Peer Circles, and build the skills to support your community.
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Program progress</p>
              <p className="text-lg font-bold text-slate-900">{overallPercent}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Current week</p>
              <p className="text-lg font-bold text-slate-900">Week {currentWeek} of 9</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Journals</p>
              <p className="text-lg font-bold text-slate-900">{journalCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Graduation</p>
              <p className="text-sm font-bold text-slate-900">80% + journal + project</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent course activity */}
          <Card className="p-5 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent course activity
                </h2>
                <Link href="/learner/course/modules" className="text-teal-600 hover:text-teal-700 inline-flex items-center gap-0.5 text-sm">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Badge className="bg-teal-50 text-teal-700 border border-teal-200">
                <BookOpen className="h-3 w-3 mr-1" />
                {currentWeek > 1 || moduleProgress > 0 ? 'In progress' : 'Get started'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Your progress through the 9-week HELP Foundations Training.
            </p>
            <div className="mt-4 p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center">
              <p className="font-medium text-slate-800">
                {hasStats
                  ? `You're on ${MODULE_TITLES[currentWeek] ?? `Week ${currentWeek}`}`
                  : "Looks like you haven't started yet"}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {hasStats
                  ? 'Keep going—attend Peer Circles and submit your weekly journal.'
                  : 'Go to My Course to begin the 9-week program.'}
              </p>
              <Link href="/learner/course/modules" className="inline-block mt-4">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  {hasStats ? 'Continue course' : 'Get your first course'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* 9-week tracker */}
          <Card className="p-5 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  9-week program progress
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  You are on Week {currentWeek} of 9
                </p>
              </div>
              <Badge className="bg-green-50 text-green-700 border border-green-200">
                {overallPercent}% complete
              </Badge>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">
                  {MODULE_TITLES[currentWeek] ?? `Module ${currentWeek}`}
                </span>
                <span className="font-semibold text-slate-900">{moduleProgress}%</span>
              </div>
              <Progress value={moduleProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-9 gap-1 mt-4">
              {Array.from({ length: 9 }).map((_, i) => {
                const weekNum = i + 1
                const status =
                  weekNum < currentWeek ? 'completed' : weekNum === currentWeek ? 'in-progress' : 'upcoming'
                return (
                  <Link
                    key={weekNum}
                    href="/learner/course/modules"
                    className={`h-9 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                      status === 'completed'
                        ? 'bg-green-500 text-white'
                        : status === 'in-progress'
                          ? 'bg-teal-500 text-white ring-2 ring-teal-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {weekNum}
                  </Link>
                )
              })}
            </div>
          </Card>

          {/* My courses */}
          <Card className="p-5 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <Link href="/learner/course/modules" className="flex items-center gap-2 group">
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                  My course
                </h2>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </Link>
              <Link href="/learner/catalog">
                <Button size="sm" variant="outline" className="text-xs">
                  Browse catalog
                </Button>
              </Link>
            </div>
            <EmptyState
              title={hasStats ? 'Keep going' : 'No courses yet'}
              description={
                hasStats
                  ? 'Complete modules, journals, and the Final Project to graduate.'
                  : 'Enroll in HELP Foundations Training from the catalog.'
              }
              actionLabel="Go to My Course"
              onActionClick={() => router.push('/learner/course/modules')}
              icon={<BookOpen className="h-4 w-4" />}
            />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Today's schedule */}
          <Card className="p-4 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Today&apos;s schedule
                </h2>
                <Link
                  href="/learner/calendar"
                  className="text-xs text-slate-500 hover:text-teal-600 transition-colors"
                >
                  {new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                  , {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </Link>
              </div>
              <CalendarDays className="h-4 w-4 text-teal-600" />
            </div>
            <div className="border border-dashed border-slate-200 rounded-lg py-6 text-center text-sm text-slate-500">
              Nothing scheduled today
            </div>
            <Link href="/learner/calendar" className="block mt-2 text-center">
              <Button variant="ghost" size="sm" className="text-teal-600">
                View calendar
              </Button>
            </Link>
          </Card>

          {/* Don't miss */}
          <Card className="p-4 border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Don&apos;t miss
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                You have no courses expiring soon.{' '}
                <Link href="/learner/course/modules" className="text-teal-700 font-medium hover:underline">
                  Go to courses
                </Link>
              </li>
              <li>You are not registered for any online sessions today.</li>
              <li>You are not registered for any sessions this month.</li>
              <li>None of your discussion posts have replies yet.</li>
              <li>
                No new threads this week.{' '}
                <Link href="/learner/discussions" className="text-teal-700 font-medium hover:underline">
                  Go to discussions
                </Link>
              </li>
            </ul>
          </Card>

          {/* Quick links */}
          <Card className="p-4 border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Quick links
            </h2>
            <div className="space-y-2">
              <Link
                href="/learner/journal/entries"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700"
              >
                <FileText className="h-4 w-4 text-teal-600" />
                Learning Journal
              </Link>
              <Link
                href="/learner/circles"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700"
              >
                <Users className="h-4 w-4 text-teal-600" />
                Peer Circles
              </Link>
              <Link
                href="/learner/discussions"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700"
              >
                <MessageSquare className="h-4 w-4 text-teal-600" />
                Discussions
              </Link>
              <Link
                href="/learner/resources"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700"
              >
                <BookOpen className="h-4 w-4 text-teal-600" />
                Resources
              </Link>
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-4 border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Achievements
            </h2>
            <div className="space-y-2">
              {[
                { name: 'First steps', earned: currentWeek >= 1 || moduleProgress > 0 },
                { name: 'Week 1 complete', earned: currentWeek >= 2 },
                { name: 'Active participant', earned: journalCount >= 1 },
                { name: 'Peer circle member', earned: isPeerCircleMember },
              ].map((badge) => (
                <div
                  key={badge.name}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    badge.earned ? 'bg-teal-50 text-teal-800' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <Award className={`h-4 w-4 shrink-0 ${badge.earned ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
