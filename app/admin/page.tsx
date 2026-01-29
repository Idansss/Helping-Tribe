'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HeartPulse,
  ListChecks,
  Users,
} from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'
import { QuickActions } from '@/components/admin/QuickActions'
import { EmptyState } from '@/components/admin/EmptyState'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const timelineItems = [
  {
    id: 1,
    label: 'Week 3 • Ethics & Boundaries',
    detail: '27 learners completed ethics compliance quiz',
    time: '2 hours ago',
    type: 'course',
  },
  {
    id: 2,
    label: 'Peer Circles',
    detail: 'New peer circle created: Lagos Evening Cohort',
    time: 'Today',
    type: 'enrollment',
  },
  {
    id: 3,
    label: 'Practicum (Weeks 7–9)',
    detail: '5 supervisors submitted practicum evaluations',
    time: 'Yesterday',
    type: 'signin',
  },
 ] as const

type TimelineEventType = (typeof timelineItems)[number]['type'] | 'all'

type DashboardWidgetsConfig = {
  kpis: boolean
  activity: boolean
  recent: boolean
  quickActions: boolean
  checklist: boolean
}

type ChecklistItem = { id: string; label: string }
type ChecklistSection = {
  id: string
  title: string
  description?: string
  href?: string
  items: ChecklistItem[]
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard & overview',
    description:
      'Admin overview widgets, KPIs, activity charts, and audit timeline.',
    items: [
      { id: 'dashboard-customizable', label: 'Customizable dashboard widgets + drag-and-drop layout' },
      { id: 'dashboard-activity', label: 'Portal activity chart (logins vs completions) + time range' },
      { id: 'dashboard-quick-actions', label: 'Quick actions shortcuts (add user/course/group, settings, reports)' },
      { id: 'dashboard-kpis', label: 'Overview KPIs (active users, assigned courses, groups, training time, completion)' },
      { id: 'dashboard-timeline', label: 'Timeline / audit log with filters (sign-in, course created, enrollment)' },
      { id: 'dashboard-greeting', label: 'Personalized greeting (e.g., “Welcome, Abass!”)' },
    ],
  },
  {
    id: 'users',
    title: 'Users',
    href: '/admin/users',
    items: [
      { id: 'users-list', label: 'User list table (User, Email, Type, Registration, Last login) + sort/search/filter' },
      { id: 'users-add', label: 'Add user: single add + bulk import (CSV)' },
      { id: 'users-types', label: 'User types (SuperAdmin/Admin/Trainer/Learner) + permission matrix' },
      { id: 'users-custom-types', label: 'Custom user types (“Add user type”) with per-permission configuration' },
      { id: 'users-signup', label: 'User creation: admin-manual sign up + optional social sign up' },
      { id: 'users-default-type', label: 'Default user type for new registrations (e.g., Learner)' },
      { id: 'users-learner-home', label: 'Simple Learner dashboard toggle (“My Courses” vs standard dashboard) default home' },
      { id: 'users-timezone', label: 'Portal-wide default timezone for dates/times' },
      { id: 'users-sso', label: 'SSO (Single Sign-On) + clarify email/domain rules for SSO users' },
      { id: 'users-tos', label: 'Terms of service: first-login acceptance flow' },
      { id: 'users-custom-fields', label: 'Custom user fields (department, employee ID, etc.) for reporting/segmentation' },
    ],
  },
  {
    id: 'courses',
    title: 'Courses',
    href: '/admin/courses',
    items: [
      { id: 'courses-list', label: 'Course list table (Course, Code, Category, Last updated) + search/filter/sort' },
      { id: 'courses-add', label: 'Add course: create new + import courses' },
      { id: 'courses-categories', label: 'Hierarchical categories (parent category), counts and course organization' },
      { id: 'courses-global-settings', label: 'Global course settings: show summary on entry, LinkedIn cert share, ratings' },
      { id: 'courses-certificates', label: 'Certificates: custom templates per course completion' },
      { id: 'courses-custom-fields', label: 'Custom course fields (extra metadata)' },
      { id: 'courses-external-catalog', label: 'External catalog: public URL + optional hide-branch-courses-from-main-catalog' },
      { id: 'courses-social', label: 'Social interactions/sharing in catalog (when external catalog is on)' },
    ],
  },
  {
    id: 'learning-paths',
    title: 'Learning paths',
    href: '/admin/learning-paths',
    items: [
      { id: 'paths-create', label: 'Learning paths: curated sequences of courses with structured steps' },
      { id: 'paths-empty', label: 'Empty state with message + CTA when no paths exist' },
    ],
  },
  {
    id: 'course-store',
    title: 'Course store',
    href: '/admin/course-store',
    items: [
      { id: 'store-browse', label: 'Browse/add courses from external providers (Compliance, skills, etc.)' },
      { id: 'store-categories', label: 'Store categories (Power Skills, Workplace Essentials, add-ons, etc.)' },
      { id: 'store-add', label: 'Add to portal via “+” on course cards' },
    ],
  },
  {
    id: 'groups',
    title: 'Groups',
    href: '/admin/groups',
    items: [
      { id: 'groups-assign', label: 'Groups: assign sets of courses to many users at once' },
      { id: 'groups-add', label: 'Add group: create group, add members, assign courses' },
    ],
  },
  {
    id: 'branches',
    title: 'Branches',
    href: '/admin/branches',
    items: [
      { id: 'branches-subportals', label: 'Branches: sub-portals with own courses/paths/users/domain/appearance' },
      { id: 'branches-add', label: 'Add branch: create and configure each branch' },
    ],
  },
  {
    id: 'automations',
    title: 'Automations',
    href: '/admin/automations',
    items: [
      { id: 'automations-rules', label: 'Automation rules: on event X, do Y (assign course, send certificate, notify)' },
      { id: 'automations-add', label: 'Add automation: trigger + one/more actions; manage existing rules' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    href: '/admin/notifications',
    items: [
      { id: 'notifications-rules', label: 'Notification rules: name/event/recipient + enable/disable' },
      { id: 'notifications-events', label: 'Events catalog (grading/submission/cert issued/course assigned/completed/user added)' },
      { id: 'notifications-add', label: 'Add notification rule for an event + recipient' },
      { id: 'notifications-tabs', label: 'Tabs: Overview (rules), History (sent), Pending, System notifications' },
    ],
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    href: '/admin/newsletter',
    items: [
      { id: 'newsletter-create', label: 'Create newsletter issues with subject and content' },
      { id: 'newsletter-edit', label: 'Edit draft newsletter issues before sending' },
      { id: 'newsletter-send', label: 'Send newsletter issues to all subscribers' },
      { id: 'newsletter-subscribers', label: 'View and manage newsletter subscribers list' },
      { id: 'newsletter-public-form', label: 'Public subscription form in footer' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    href: '/admin/reports',
    items: [
      { id: 'reports-overview', label: 'Overview: key metrics + activity chart + course-level stats' },
      { id: 'reports-matrix', label: 'Training matrix: users × courses grid + search + export to Excel' },
      { id: 'reports-timeline', label: 'Timeline: event log with From/To, event/user/course filters + reset' },
      { id: 'reports-progress', label: 'Training progress: download/export with options' },
    ],
  },
  {
    id: 'skills',
    title: 'Skills',
    href: '/admin/skills',
    items: [
      { id: 'skills-toggle', label: 'Enable/disable skills; list/grid with add/search/sort' },
      { id: 'skills-tabs', label: 'Tabs: Skills, Users, Talent Pool' },
      { id: 'skills-settings', label: 'Skill settings: activate for learners; recommendations; skill levels' },
      { id: 'skills-assessment', label: 'Assessment: expiration, Q count, pass mark, retry-after, completion time' },
      { id: 'skills-ai', label: 'AI instruction field for relevant skill recommendations' },
    ],
  },
  {
    id: 'portal-settings',
    title: 'Account & settings (portal)',
    href: '/admin/settings',
    items: [
      { id: 'settings-identity', label: 'Identity: site name, description (SEO), domain/custom domain' },
      { id: 'settings-announcements', label: 'Announcements: internal (dashboard) + external (login page)' },
      { id: 'settings-branding-controls', label: 'Branding: hide “Powered by …”, restrict product emails to Admins/Instructors' },
      { id: 'settings-portal', label: 'Portal settings: AI features on/off; legacy vs new interface default' },
      { id: 'settings-demo-data', label: 'Demo data: reset/delete demo environment' },
      { id: 'settings-branding', label: 'Branding uploads: logo/favicon/default course image (type/size limits)' },
      { id: 'settings-theme', label: 'Theme picker (e.g., “Fun blue”)' },
      { id: 'settings-homepage', label: 'Custom homepage (optional)' },
      { id: 'settings-locale', label: 'Locale/data format: date/number format options' },
    ],
  },
  {
    id: 'profile-messaging',
    title: 'Profile & messaging',
    items: [
      { id: 'profile', label: 'My profile: bio/photo/timezone/language/email preferences + exclude non-essential' },
      { id: 'password', label: 'Change password in profile/settings' },
      { id: 'messages', label: 'Messages: Inbox/Sent, filters, compose new message' },
    ],
  },
  {
    id: 'ux-patterns',
    title: 'UX and admin patterns',
    items: [
      { id: 'ux-search', label: 'Global search across users/courses/content' },
      // Removed: subscription/gamification feature
      // { id: 'ux-upgrade', label: 'Upgrade prompts (badges + “Upgrade now”)' },
      { id: 'ux-empty-states', label: 'Empty states: illustration + explanation + CTA across modules' },
      { id: 'ux-save-cancel', label: 'Save/Cancel on settings pages; reset-to-default where relevant' },
    ],
  },
]

const STORAGE_KEY = 'helping-tribe.adminChecklist.v1'
const DASHBOARD_STORAGE_KEY = 'helping-tribe.adminDashboard.v1'

export default function AdminDashboardPage() {
  const allChecklistItems = useMemo(
    () => CHECKLIST_SECTIONS.flatMap((section) => section.items),
    []
  )

  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>(
    'week'
  )
  const [eventFilter, setEventFilter] = useState<TimelineEventType>('all')
  const [showCustomize, setShowCustomize] = useState(false)
  const [widgets, setWidgets] = useState<DashboardWidgetsConfig>({
    kpis: true,
    activity: true,
    recent: true,
    quickActions: true,
    checklist: true,
  })
  const [adminName, setAdminName] = useState('Abass')
  const [metrics, setMetrics] = useState({
    activeLearners: 0,
    completionRate: '0%',
    ethicsCompliant: '0%',
    peerCircles: 0,
    coursesCount: 0,
  })
  const [activityStats, setActivityStats] = useState({ logins: 0, completions: 0 })

  useEffect(() => {
    loadAdminStats()
  }, [])

  async function loadAdminStats() {
    try {
      const supabase = createClient()
      const { count: learnersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
      const { count: circlesCount } = await supabase
        .from('peer_circles')
        .select('*', { count: 'exact', head: true })
      const { count: coursesCount } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })

      const { data: modulesData } = await supabase.from('modules').select('id').order('week_number', { ascending: true })
      const totalModules = modulesData?.length ?? 0
      const { data: progressData } = await supabase.from('module_progress').select('user_id, module_id, is_completed')
      const progressList = (progressData ?? []) as { user_id: string; module_id: string; is_completed: boolean }[]
      const { data: studentProfiles } = await supabase.from('profiles').select('id').eq('role', 'student')
      const studentIds = new Set((studentProfiles ?? []).map((p: { id: string }) => p.id))
      const totalExpected = studentIds.size * totalModules
      let completedTotal = 0
      progressList.forEach((p) => {
        if (studentIds.has(p.user_id) && p.is_completed) completedTotal += 1
      })
      const completionPct = totalExpected > 0 ? Math.round((completedTotal / totalExpected) * 100) : 0

      const ethicsWeekNumbers = [3, 4, 5]
      const { data: modsWithWeek } = await supabase.from('modules').select('id, week_number')
      const ethicsIds = (modsWithWeek ?? []).filter((m: { week_number: number }) => ethicsWeekNumbers.includes(m.week_number)).map((m: { id: string }) => m.id)
      const ethicsExpected = studentIds.size * ethicsIds.length
      let ethicsCompleted = 0
      progressList.forEach((p) => {
        if (studentIds.has(p.user_id) && p.completed && ethicsIds.includes(p.module_id)) ethicsCompleted += 1
      })
      const ethicsPct = ethicsExpected > 0 ? Math.round((ethicsCompleted / ethicsExpected) * 100) : 0

      setMetrics({
        activeLearners: learnersCount ?? 0,
        completionRate: `${completionPct}%`,
        ethicsCompliant: `${ethicsPct}%`,
        peerCircles: circlesCount ?? 0,
        coursesCount: coursesCount ?? 0,
      })

      try {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const iso = weekAgo.toISOString()
        const { count: loginCount } = await supabase
          .from('user_activity')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'login')
          .gte('created_at', iso)
        const { count: completionCount } = await supabase
          .from('user_activity')
          .select('*', { count: 'exact', head: true })
          .in('activity_type', ['quiz_complete', 'assignment_submit'])
          .gte('created_at', iso)
        setActivityStats({ logins: loginCount ?? 0, completions: completionCount ?? 0 })
      } catch {
        setActivityStats({ logins: 0, completions: 0 })
      }
    } catch (e) {
      console.error('Error loading admin stats', e)
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, boolean>
      setChecked(parsed ?? {})
    } catch {
      // ignore
    }
    try {
      const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as DashboardWidgetsConfig
        setWidgets((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore
    }

    try {
      const profileRaw = localStorage.getItem('ht-admin-profile')
      if (profileRaw) {
        const profile = JSON.parse(profileRaw) as { name?: string }
        if (profile?.name && profile.name.trim().length > 0) {
          setAdminName(profile.name.trim())
        } else {
          setAdminName('Admin')
        }
      }
    } catch {
      // ignore profile parse issues
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
    } catch {
      // ignore
    }
  }, [checked])

  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(widgets))
    } catch {
      // ignore
    }
  }, [widgets])

  const completedCount = allChecklistItems.reduce(
    (acc, item) => acc + (checked[item.id] ? 1 : 0),
    0
  )

  const filteredTimeline = timelineItems.filter((item) =>
    eventFilter === 'all' ? true : item.type === eventFilter
  )

  return (
    <div className="space-y-6">
      {/* Personalized greeting + customize controls */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome back, {adminName}.
          </h2>
          <p className="text-xs text-slate-500">
            This is your portal overview for cohort health, activity, and admin
            tasks.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="text-[11px] text-slate-500">
            {new Date().toLocaleString('en-NG', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowCustomize((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
            Customize dashboard widgets
          </button>
          {showCustomize && (
            <div className="mt-1 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
              {(
                [
                  ['kpis', 'Overview KPIs'],
                  ['activity', 'Portal activity'],
                  ['recent', 'Timeline'],
                  ['quickActions', 'Quick actions'],
                  ['checklist', 'Admin checklist'],
                ] as [keyof DashboardWidgetsConfig, string][]
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={widgets[key]}
                    onChange={(e) =>
                      setWidgets((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="h-3.5 w-3.5 accent-[#7c3aed]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      {widgets.kpis && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            label="Active learners"
            value={metrics.activeLearners.toString()}
            sublabel="Currently progressing through the 9-week journey"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            label="Completion rate"
            value={metrics.completionRate}
            sublabel="Completed all 9 weeks including practicum"
            icon={<GraduationCap className="h-4 w-4" />}
          />
          <StatsCard
            label="Ethics compliant"
            value={metrics.ethicsCompliant}
            sublabel="Learners who passed ethics & safeguarding"
            icon={<HeartPulse className="h-4 w-4" />}
          />
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {widgets.activity && (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Portal activity
                  </h2>
                  <p className="text-xs text-slate-500">
                    Logins vs course completions across all learners.
                  </p>
                </div>
                <Tabs
                  value={timeRange}
                  onValueChange={(value) =>
                    setTimeRange(value as 'week' | 'month' | 'quarter')
                  }
                >
                  <TabsList className="grid h-7 grid-cols-3 rounded-full bg-slate-100">
                    <TabsTrigger
                      value="week"
                      className="px-2 text-[11px] data-[state=active]:bg-white data-[state=active]:text-slate-900"
                    >
                      Week
                    </TabsTrigger>
                    <TabsTrigger
                      value="month"
                      className="px-2 text-[11px] data-[state=active]:bg-white data-[state=active]:text-slate-900"
                    >
                      Month
                    </TabsTrigger>
                    <TabsTrigger
                      value="quarter"
                      className="px-2 text-[11px] data-[state=active]:bg-white data-[state=active]:text-slate-900"
                    >
                      Quarter
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Logins</span>
                  <span className="tabular-nums">{activityStats.logins}</span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7c3aed] to-[#4c1d95]"
                    style={{ width: `${Math.min(100, (activityStats.logins || 0) * 2)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Course completions</span>
                  <span className="tabular-nums">
                    {activityStats.completions}
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-600"
                    style={{ width: `${Math.min(100, (activityStats.completions || 0) * 2)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Counts for the last 7 days from user activity.
                </p>
              </div>
            </Card>
          )}

          {widgets.recent && (
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Timeline / audit log
                  </h2>
                  <p className="text-xs text-slate-500">
                    Key events across sign-ins, courses and enrollments.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>Last 7 days</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(
                  [
                    ['all', 'All events'],
                    ['signin', 'Sign-ins'],
                    ['course', 'Courses'],
                    ['enrollment', 'Enrollments'],
                  ] as [TimelineEventType, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEventFilter(value)}
                    className={
                      value === eventFilter
                        ? 'rounded-full bg-[#7c3aed] px-3 py-1 text-[11px] font-medium text-white'
                        : 'rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <ul className="space-y-3">
                {filteredTimeline.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 text-xs text-slate-600"
                  >
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-[#7c3aed]" />
                    <div className="flex-1 space-y-0.5">
                      <div className="font-medium text-slate-900">
                        {item.label}
                      </div>
                      <div>{item.detail}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.time}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {widgets.quickActions && <QuickActions />}

          <EmptyState
            title="Configure practicum supervision"
            description="Set up supervisors, evaluation forms and ethics safeguards for Weeks 7–9 to keep real-world practice structured and safe."
            actionLabel="Open practicum settings"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {widgets.checklist && (
          <Card className="p-4 xl:col-span-1">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#7c3aed]" />
                  <h2 className="text-sm font-semibold text-slate-900 truncate">
                    Admin build checklist
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Everything from the TalentLMS-style admin ideas, captured as a
                  single checklist.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="shrink-0 bg-slate-100 text-slate-700"
              >
                {completedCount}/{allChecklistItems.length} done
              </Badge>
            </div>

            <div className="mt-4 rounded-md border bg-white">
              <div className="px-3 py-2 border-b text-xs font-medium text-slate-700">
                Jump to section
              </div>
              <ul className="max-h-[420px] overflow-auto py-1">
                {CHECKLIST_SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      <span className="truncate">{section.title}</span>
                      <span className="tabular-nums text-[11px] text-slate-400">
                        {
                          section.items.reduce(
                            (acc, item) => acc + (checked[item.id] ? 1 : 0),
                            0
                          )
                        }
                        /{section.items.length}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setChecked({})}
                className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-4"
              >
                Reset checklist
              </button>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved in this browser
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 xl:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-slate-900">
                Full admin scope
              </h2>
              <p className="text-xs text-slate-500">
                Use this as your single source of truth for what the Helping
                Tribe admin should include.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next: Record<string, boolean> = {}
                for (const item of allChecklistItems) next[item.id] = true
                setChecked(next)
              }}
              className="text-xs font-medium text-[#4c1d95] hover:underline underline-offset-4"
            >
              Mark all complete
            </button>
          </div>

          <Accordion
            type="multiple"
            className="rounded-md border bg-white"
            defaultValue={['users', 'courses']}
          >
            {CHECKLIST_SECTIONS.map((section) => {
              const sectionDone = section.items.reduce(
                (acc, item) => acc + (checked[item.id] ? 1 : 0),
                0
              )
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  id={section.id}
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {section.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-700"
                          >
                            {sectionDone}/{section.items.length}
                          </Badge>
                          {section.href && (
                            <Link
                              href={section.href}
                              className="text-xs font-medium text-[#4c1d95] hover:underline underline-offset-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open
                            </Link>
                          )}
                        </div>
                        {section.description && (
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {section.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <ul className="space-y-2">
                      {section.items.map((item) => {
                        const isChecked = Boolean(checked[item.id])
                        return (
                          <li key={item.id} className="flex items-start gap-3">
                            <input
                              id={item.id}
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setChecked((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.checked,
                                }))
                              }
                              className="mt-0.5 h-4 w-4 accent-[#7c3aed]"
                            />
                            <label
                              htmlFor={item.id}
                              className={
                                isChecked
                                  ? 'text-xs text-slate-500 line-through'
                                  : 'text-xs text-slate-700'
                              }
                            >
                              {item.label}
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </Card>
      </section>
    </div>
  )
}

