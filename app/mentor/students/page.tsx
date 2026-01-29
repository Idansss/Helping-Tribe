'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Search, MessageCircle } from 'lucide-react'
import { MentorLayout } from '@/components/lms/MentorLayout'

interface StudentRow {
  id: string
  full_name: string | null
  email: string | null
  cohort_name: string | null
  completion_rate: number
}

export default function MentorStudentsPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [filtered, setFiltered] = useState<StudentRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    if (!query) {
      setFiltered(students)
    } else {
      const q = query.toLowerCase()
      setFiltered(
        students.filter((s) =>
          (s.full_name || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.cohort_name || '').toLowerCase().includes(q)
        )
      )
    }
  }, [query, students])

  async function loadStudents() {
    setLoading(true)
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role, cohort_id, auth:auth.users(email)')
        .eq('role', 'student')

      if (!profiles || profiles.length === 0) {
        setStudents([])
        return
      }

      // Fetch cohorts for names
      const cohortIds = Array.from(
        new Set(
          profiles
            .map((p: any) => p.cohort_id)
            .filter((id: string | null) => id !== null)
        )
      )

      let cohortsById: Record<string, string> = {}
      if (cohortIds.length > 0) {
        const { data: cohorts } = await supabase
          .from('cohorts')
          .select('id, name')
          .in('id', cohortIds)

        cohortsById =
          cohorts?.reduce(
            (acc: Record<string, string>, c: any) => {
              acc[c.id] = c.name
              return acc
            },
            {}
          ) ?? {}
      }

      // Completion rates from module_progress
      const { data: progress } = await supabase
        .from('module_progress')
        .select('user_id, is_completed')

      const completionByUser: Record<string, number> = {}
      if (progress && progress.length > 0) {
        const grouped: Record<string, { done: number; total: number }> = {}
        for (const row of progress as any[]) {
          const uid = row.user_id
          if (!grouped[uid]) grouped[uid] = { done: 0, total: 0 }
          grouped[uid].total += 1
          if (row.is_completed) grouped[uid].done += 1
        }
        for (const [uid, g] of Object.entries(grouped)) {
          completionByUser[uid] =
            g.total > 0 ? Math.round((g.done / g.total) * 100) : 0
        }
      }

      const rows: StudentRow[] = (profiles as any[]).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.auth?.email ?? null,
        cohort_name: p.cohort_id ? cohortsById[p.cohort_id] ?? null : null,
        completion_rate: completionByUser[p.id] ?? 0,
      }))

      setStudents(rows)
      setFiltered(rows)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Learners
            </h1>
            <p className="text-sm text-slate-600">
              View the students in your program and quickly scan their
              progress.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-4 w-4" />
            <span>{students.length} learners</span>
          </div>
        </div>

        <Card className="p-4 border-slate-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or cohort"
                className="pl-8 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Cohort</th>
                  <th className="px-3 py-2">Completion</th>
                  <th className="px-3 py-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      Loading learners…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      No learners found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b last:border-b-0 border-slate-100"
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">
                          {s.full_name || 'Unnamed learner'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {s.email || '—'}
                      </td>
                      <td className="px-3 py-2">
                        {s.cohort_name ? (
                          <Badge
                            variant="outline"
                            className="border-slate-200 text-slate-700"
                          >
                            {s.cohort_name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {s.completion_rate}%
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/mentor/messages?to=${s.id}`}>
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MentorLayout>
  )
}

