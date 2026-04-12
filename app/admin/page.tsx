'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  HeartPulse,
  MessageSquare,
  Users,
} from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'
import { QuickActions } from '@/components/admin/QuickActions'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

type DashboardMetrics = {
  activeLearners: number
  activeMentors: number
  pendingApplicants: number
  completionRate: number
  ethicsCompliant: number
  peerCircles: number
  coursesCount: number
  recentLogins: number
  recentCompletions: number
}

const INITIAL_METRICS: DashboardMetrics = {
  activeLearners: 0,
  activeMentors: 0,
  pendingApplicants: 0,
  completionRate: 0,
  ethicsCompliant: 0,
  peerCircles: 0,
  coursesCount: 0,
  recentLogins: 0,
  recentCompletions: 0,
}

function formatDashboardDate(value: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(value, 100))
}

function getCount(result: PromiseSettledResult<any>) {
  if (result.status !== 'fulfilled' || result.value?.error) {
    return 0
  }

  return result.value.count ?? 0
}

function getRows<T>(result: PromiseSettledResult<any>) {
  if (result.status !== 'fulfilled' || result.value?.error) {
    return [] as T[]
  }

  return (result.value.data ?? []) as T[]
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('Admin')
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS)

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        const resolvedName =
          profile?.full_name?.trim() ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Admin'

        setAdminName(resolvedName)
      }

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentSince = sevenDaysAgo.toISOString()

      const results = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['mentor', 'faculty']),
        supabase.from('applicants').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('peer_circles').select('id', { count: 'exact', head: true }),
        supabase.from('modules').select('id', { count: 'exact', head: true }),
        supabase.from('modules').select('id').order('week_number', { ascending: true }),
        supabase.from('module_progress').select('user_id, module_id, is_completed'),
        supabase.from('modules').select('id, week_number'),
        supabase
          .from('user_activity')
          .select('id', { count: 'exact', head: true })
          .eq('activity_type', 'login')
          .gte('created_at', recentSince),
        supabase
          .from('user_activity')
          .select('id', { count: 'exact', head: true })
          .in('activity_type', ['quiz_complete', 'assignment_submit'])
          .gte('created_at', recentSince),
      ])

      const studentProfiles = getRows<{ id: string }>(results[0])
      const mentorCount = getCount(results[1])
      const pendingApplicants = getCount(results[2])
      const peerCircles = getCount(results[3])
      const coursesCount = getCount(results[4])
      const modules = getRows<{ id: string }>(results[5])
      const progressRows = getRows<{
        user_id: string
        module_id: string
        is_completed: boolean
      }>(results[6])
      const modulesWithWeek = getRows<{ id: string; week_number: number }>(results[7])
      const recentLogins = getCount(results[8])
      const recentCompletions = getCount(results[9])

      const studentIds = new Set(studentProfiles.map((profile) => profile.id))
      const totalExpectedCompletions = studentIds.size * modules.length

      let completedModules = 0
      for (const row of progressRows) {
        if (row.is_completed && studentIds.has(row.user_id)) {
          completedModules += 1
        }
      }

      const completionRate =
        totalExpectedCompletions > 0
          ? Math.round((completedModules / totalExpectedCompletions) * 100)
          : 0

      const ethicsModuleIds = new Set(
        modulesWithWeek
          .filter((row) => [3, 4, 5].includes(row.week_number))
          .map((row) => row.id)
      )

      const totalExpectedEthics = studentIds.size * ethicsModuleIds.size
      let completedEthics = 0

      for (const row of progressRows) {
        if (
          row.is_completed &&
          studentIds.has(row.user_id) &&
          ethicsModuleIds.has(row.module_id)
        ) {
          completedEthics += 1
        }
      }

      const ethicsCompliant =
        totalExpectedEthics > 0
          ? Math.round((completedEthics / totalExpectedEthics) * 100)
          : 0

      setMetrics({
        activeLearners: studentProfiles.length,
        activeMentors: mentorCount,
        pendingApplicants,
        completionRate,
        ethicsCompliant,
        peerCircles,
        coursesCount,
        recentLogins,
        recentCompletions,
      })
    } catch (error) {
      console.error('Error loading admin dashboard', error)
      setMetrics(INITIAL_METRICS)
    } finally {
      setLoading(false)
    }
  }

  const operations = [
    {
      label: 'Applicants awaiting review',
      value: metrics.pendingApplicants.toString(),
      href: '/admin/applicants',
      detail: 'Review new admissions and move approved applicants into onboarding.',
    },
    {
      label: 'Learner accounts',
      value: metrics.activeLearners.toString(),
      href: '/admin/users',
      detail: 'Keep learner records, facilitator roles, and access settings current.',
    },
    {
      label: 'Published modules',
      value: metrics.coursesCount.toString(),
      href: '/admin/courses',
      detail: 'Update weekly content, uploads, and completion requirements.',
    },
    {
      label: 'Peer circles',
      value: metrics.peerCircles.toString(),
      href: '/admin/reports',
      detail: 'Track group activity, practicum readiness, and supervision coverage.',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome back, {adminName}.
          </h2>
          <p className="text-sm text-slate-500">
            This dashboard focuses on live admissions, learner progress, and support operations.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Last refreshed {formatDashboardDate(new Date())}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Active learners"
          value={loading ? '...' : metrics.activeLearners.toString()}
          sublabel="Current student records in the training portal"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          label="Pending applicants"
          value={loading ? '...' : metrics.pendingApplicants.toString()}
          sublabel="Applications still waiting for an admissions decision"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatsCard
          label="Completion rate"
          value={loading ? '...' : `${metrics.completionRate}%`}
          sublabel="Completed module progress across enrolled learners"
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatsCard
          label="Ethics compliance"
          value={loading ? '...' : `${metrics.ethicsCompliant}%`}
          sublabel="Completion of the ethics and safeguarding weeks"
          icon={<HeartPulse className="h-4 w-4" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Operational priorities</h3>
              <p className="text-xs text-slate-500">
                Core admin workstreams that should stay current during each cohort.
              </p>
            </div>
            <div className="md:w-[320px]">
              <QuickActions />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {operations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-teal-200 hover:bg-teal-50/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">
                      {loading ? '...' : item.value}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Program health</h3>
            <p className="text-xs text-slate-500">
              A quick read on progression, facilitator coverage, and recent activity.
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Overall module completion</span>
                <span>{loading ? '...' : `${metrics.completionRate}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-700"
                  style={{ width: `${clampPercent(metrics.completionRate)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Ethics and safeguarding completion</span>
                <span>{loading ? '...' : `${metrics.ethicsCompliant}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  style={{ width: `${clampPercent(metrics.ethicsCompliant)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  Last 7 days
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {loading ? '...' : metrics.recentLogins}
                </div>
                <div className="text-xs text-slate-500">Learner sign-ins</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Last 7 days
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {loading ? '...' : metrics.recentCompletions}
                </div>
                <div className="text-xs text-slate-500">Completion events</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Facilitator coverage
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {loading ? '...' : metrics.activeMentors.toString()}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Facilitator and faculty profiles currently available to support delivery.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BookOpen className="h-4 w-4 text-teal-700" />
            Content and delivery
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Keep modules, quizzes, and support materials aligned with the current cohort schedule.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <Link href="/admin/courses" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Manage modules and uploads</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/quizzes" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Review quizzes and assessments</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/resources" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Update learner resources</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageSquare className="h-4 w-4 text-teal-700" />
            Communication
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Keep admissions, announcements, and direct support conversations moving without delays.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <Link href="/admin/messages" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Open admin inbox</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/notifications" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Adjust notification rules</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/newsletter" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Send cohort updates</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <HeartPulse className="h-4 w-4 text-teal-700" />
            Safeguarding focus
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Use reporting and discussions to catch ethics gaps early and keep practicum support structured.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <Link href="/admin/reports" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Open training reports</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/discussions" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Review moderated discussions</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/settings" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span>Adjust access and onboarding rules</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}
