'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, Loader2, BookOpen } from 'lucide-react'
import { CaseStudyCard } from '@/components/lms/CaseStudyCard'

type CaseStudyRow = {
  id: string
  title: string
  scenario: string
  difficulty_level: string
  questions: { id: string; question: string; hint?: string }[]
  learning_objectives: string[] | null
  tags: string[] | null
  module_id: string | null
  module?: { week_number: number; title: string }
  hasResponse?: boolean
}

export default function MentorCaseStudiesPage() {
  const supabase = createClient()
  const [list, setList] = useState<CaseStudyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('case_studies')
          .select('*')
          .order('title', { ascending: true })

        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
            setTableMissing(true)
            setList([])
            setLoading(false)
            return
          }
          throw error
        }
        setList((data ?? []) as CaseStudyRow[])
      } catch (e) {
        console.error(e)
        setTableMissing(true)
        setList([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Case Studies</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          View case studies available in the Case Study Bank. Learners see these on their portal; admins create and edit them from the admin portal.
        </p>
      </div>

      {loading ? (
        <Card className="p-6 border-slate-200">
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading case studies…
          </div>
        </Card>
      ) : tableMissing ? (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900 font-medium">Case Study Bank is not set up yet.</p>
          <p className="text-sm text-amber-800 mt-1">An admin needs to run the case studies setup script in Supabase. Once set up, case studies will appear here and in the learner portal.</p>
        </Card>
      ) : list.length === 0 ? (
        <Card className="p-6 border-slate-200">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 text-center">No case studies yet.</p>
          <p className="text-xs text-slate-500 text-center mt-1">Admins can add them from Admin → Case Studies.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((cs) => (
            <CaseStudyCard key={cs.id} caseStudy={cs} basePath="/learner/cases" />
          ))}
        </div>
      )}
    </div>
  )
}
