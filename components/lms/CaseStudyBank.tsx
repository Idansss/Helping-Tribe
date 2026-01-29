'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CaseStudyCard } from './CaseStudyCard'

interface CaseStudy {
  id: string
  module_id: string | null
  title: string
  scenario: string
  questions: Array<{
    id: string
    question: string
    hint?: string
  }>
  learning_objectives: string[] | null
  difficulty_level: string
  tags: string[] | null
  module?: {
    week_number: number
    title: string
  }
  hasResponse?: boolean
}

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'] as const

export function CaseStudyBank() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudy[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadCaseStudies() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('case_studies')
          .select('*')
          .order('title', { ascending: true })

        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
            setTableMissing(true)
            setCaseStudies([])
            setFilteredCaseStudies([])
            setLoading(false)
            return
          }
          throw error
        }

        const list = (data ?? []) as CaseStudy[]
        const withModule = list.map((cs) => ({ ...cs, module: undefined }))

        const caseStudiesWithResponses = await Promise.all(
          withModule.map(async (caseStudy) => {
            const { data: responseData } = await supabase
              .from('case_study_responses')
              .select('id')
              .eq('case_study_id', caseStudy.id)
              .eq('user_id', user.id)
              .maybeSingle()
            return { ...caseStudy, hasResponse: !!responseData }
          })
        )

        setCaseStudies(caseStudiesWithResponses)
        setFilteredCaseStudies(caseStudiesWithResponses)
      } catch (error) {
        console.error('Error loading case studies:', error)
        setTableMissing(true)
        setCaseStudies([])
        setFilteredCaseStudies([])
      } finally {
        setLoading(false)
      }
    }

    loadCaseStudies()
  }, [supabase])

  useEffect(() => {
    let filtered = caseStudies
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (cs) =>
          cs.title.toLowerCase().includes(q) ||
          cs.scenario.toLowerCase().includes(q) ||
          cs.tags?.some((t) => t.toLowerCase().includes(q)) ||
          cs.learning_objectives?.some((o) => o?.toLowerCase().includes(q))
      )
    }
    if (filterDifficulty) filtered = filtered.filter((cs) => cs.difficulty_level === filterDifficulty)
    setFilteredCaseStudies(filtered)
  }, [searchQuery, filterDifficulty, caseStudies])

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500 text-sm">Loading case studies...</p>
      </div>
    )
  }

  if (tableMissing) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Case Study Bank is not set up yet.</p>
        <p className="mt-1 text-amber-800">
          An admin needs to run the setup script in Supabase so case studies can be created and shown here. Once set up, admins and mentors can add case studies from their portals.
        </p>
        <p className="mt-2 text-xs text-amber-700">
          Run <code className="rounded bg-amber-100 px-1">supabase/scripts/create_case_studies_and_admin_policies.sql</code> in Supabase Dashboard → SQL Editor.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search case studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm border-slate-200"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={filterDifficulty === null ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterDifficulty(null)}
          >
            All
          </Button>
          {DIFFICULTY_OPTIONS.map((d) => (
            <Button
              key={d}
              variant={filterDifficulty === d ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => setFilterDifficulty(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>

      {filteredCaseStudies.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700">No case studies found</p>
          <p className="mt-1 text-xs text-slate-500">
            {caseStudies.length === 0
              ? 'Admins or mentors can add case studies from their portals. Check back later.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCaseStudies.map((cs) => (
            <CaseStudyCard key={cs.id} caseStudy={cs} basePath="/learner/cases" />
          ))}
        </div>
      )}
    </div>
  )
}
