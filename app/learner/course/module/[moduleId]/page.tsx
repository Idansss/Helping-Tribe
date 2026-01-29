'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CoursePlayer } from '@/components/lms/CoursePlayer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowLeft, FileText } from 'lucide-react'
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
]

function isUuid(s: string): boolean {
  return s.length > 10 && (s.includes('-') || /^[0-9a-f]{32}$/i.test(s))
}

export default function LearnerModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = use(params)
  const supabase = createClient()
  const [resolvedModuleId, setResolvedModuleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fallbackWeek, setFallbackWeek] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function resolve() {
      if (!moduleId) {
        if (!cancelled) setLoading(false)
        return
      }

      if (isUuid(moduleId)) {
        const { data } = await supabase
          .from('modules')
          .select('id')
          .eq('id', moduleId)
          .single()
        if (!cancelled && data) {
          setResolvedModuleId((data as { id: string }).id)
        }
        if (!cancelled) setLoading(false)
        return
      }

      const week = parseInt(moduleId, 10)
      if (week >= 1 && week <= 9) {
        const { data } = await supabase
          .from('modules')
          .select('id')
          .eq('week_number', week)
          .order('week_number', { ascending: true })
          .limit(1)
          .single()
        if (!cancelled) {
          if (data) {
            setResolvedModuleId((data as { id: string }).id)
          } else {
            setFallbackWeek(week)
          }
        }
      }
      if (!cancelled) setLoading(false)
    }
    resolve()
    return () => { cancelled = true }
  }, [moduleId, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-500">
        Loading module…
      </div>
    )
  }

  if (resolvedModuleId) {
    return <CoursePlayer moduleId={resolvedModuleId} />
  }

  if (fallbackWeek !== null) {
    const info = HELP_MODULES[fallbackWeek - 1]
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/learner/course/modules" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to modules
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-500">Week {fallbackWeek}</span>
              <Badge variant="secondary">{info?.theme ?? 'Module'}</Badge>
            </div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-600" />
              {info?.title ?? `Module ${fallbackWeek}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600">
              Notes and full content for this module will appear here once your course is fully set up. You can use your Learning Journal and Peer Circles in the meantime.
            </p>
            <Card className="border-dashed bg-slate-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes & content
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                Complete lesson content, readings, and worksheets for Week {fallbackWeek} will be available in this section. Check back after your facilitator has published the module.
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/learner/journal/entries">Learning Journal</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/learner/circles">Peer Circles</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/learner/course/modules">Back to My Course</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <p className="text-slate-600">Module not found.</p>
      <Button asChild>
        <Link href="/learner/course/modules">Back to My Course</Link>
      </Button>
    </div>
  )
}
