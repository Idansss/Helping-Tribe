'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { ModuleListSkeleton } from '@/components/lms/LoadingSkeletons'
import {
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  Users,
  CheckCircle2,
  Lock,
  Target,
} from 'lucide-react'
import Link from 'next/link'

const HELP_MODULES = [
  { week: 1, title: 'Helping Profession, Ethics, Cultural Competence', theme: 'Foundations' },
  { week: 2, title: 'Exploration & Insight Stages, Trauma-Informed Practice', theme: 'Exploration' },
  { week: 3, title: 'Action Stage, Conflict Resolution', theme: 'Action' },
  { week: 4, title: 'Self-Care & Supervision', theme: 'Practitioner wellbeing' },
  { week: 5, title: 'Working with Special Populations', theme: 'Special populations' },
  { week: 6, title: 'Crisis Intervention & Trauma Counselling', theme: 'Crisis' },
  { week: 7, title: 'Group Counselling & Peer Support', theme: 'Group skills' },
  { week: 8, title: 'Case Analysis & Feedback', theme: 'Integration' },
  { week: 9, title: 'Final Projects & Wrap-Up', theme: 'Certification' },
] as const

interface ModuleProgress {
  module_id: string
  week_number: number
  progress: number
  completed: boolean
}

export default function LearnerCourseModulesPage() {
  const supabase = createClient()
  const [modulesFromDb, setModulesFromDb] = useState<{ id: string; week_number: number; title: string }[]>([])
  const [progressMap, setProgressMap] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: modData, error: modErr } = await supabase
          .from('modules')
          .select('id, week_number, title')
          .order('week_number', { ascending: true })
        if (!modErr && modData?.length) {
          setModulesFromDb(modData as { id: string; week_number: number; title: string }[])
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: progressData } = await supabase
              .from('module_progress')
              .select('module_id, progress, completed')
              .eq('user_id', user.id)
            if (progressData?.length) {
              const byModule: Record<string, { progress: number; completed: boolean }> = {}
              progressData.forEach((p: { module_id: string; progress: number; completed: boolean }) => {
                byModule[p.module_id] = { progress: p.progress, completed: p.completed }
              })
              const byWeek: Record<number, number> = {}
              modData.forEach((m: { id: string; week_number: number }) => {
                const p = byModule[m.id]
                byWeek[m.week_number] = p?.completed ? 100 : (p?.progress ?? 0)
              })
              setProgressMap(byWeek)
            }
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const displayModules = modulesFromDb.length > 0
    ? modulesFromDb.map((m) => ({
        id: m.id,
        week: m.week_number,
        title: m.title,
        theme: HELP_MODULES[m.week_number - 1]?.theme ?? 'Module',
      }))
    : HELP_MODULES.map((m, i) => ({
        id: `w${m.week}`,
        week: m.week,
        title: m.title,
        theme: m.theme,
      }))

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Course</h1>
        <p className="text-slate-600 mt-1">
          HELP Foundations Training — 9-week program in mental health and psychosocial support. Complete modules, attend Peer Learning Circles, and submit your Learning Journal to progress.
        </p>
      </div>

      {/* Program requirements reminder */}
      <Card className="border-teal-200 bg-teal-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-teal-700" />
            To graduate you will need to:
          </CardTitle>
          <CardDescription>
            Maintain 80% attendance, submit weekly reflective journals, participate in group work, and complete the Final Project in Module 9. Outstanding students may receive a Certificate of Merit.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Module list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Modules</h2>
        {loading ? (
          <ModuleListSkeleton />
        ) : (
          <ul className="space-y-3">
            {displayModules.map((mod) => {
              const progress = progressMap[mod.week] ?? 0
              const completed = progress >= 100
              const moduleId = mod.id
              const isRealId = moduleId && moduleId.length > 10 && !moduleId.startsWith('w')
              const href = `/learner/course/module/${isRealId ? moduleId : mod.week}`

              return (
                <li key={mod.week}>
                  <Card className="overflow-hidden border-slate-200 hover:border-teal-300 transition-colors">
                    <Link href={href} className="block">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${completed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {completed ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-slate-500">Week {mod.week}</span>
                              <Badge variant="secondary" className="text-[10px]">{mod.theme}</Badge>
                            </div>
                            <h3 className="font-semibold text-slate-900 truncate">{mod.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-teal-600 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-10">{progress}%</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Weekly structure</CardTitle>
          <CardDescription>
            Each week includes: Discussion Prompt (Monday), Independent Study, Peer Learning Circle (mid-week), Weekly Quiz (Friday), Assignment (due Sunday), Facilitator-Led Session, and Wrap-Up & Feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {['Discussion', 'Independent Study', 'Peer Circle', 'Quiz', 'Assignment', 'Facilitator Session', 'Wrap-Up'].map((label) => (
            <Badge key={label} variant="outline" className="text-xs">{label}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
