'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AssignmentCard } from './AssignmentCard'

interface Assignment {
  id: string
  module_id: string
  title: string
  description: string | null
  assignment_type: string
  due_date: string | null
  max_points: number | null
  instructions: string | null
  module?: {
    week_number: number
    title: string
  }
  submission?: {
    id: string
    submitted_at: string
    graded: boolean
    grade: number | null
  }
}

export function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadAssignments() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('assignments')
          .select(`
            *,
            module:modules(week_number, title)
          `)
          .order('due_date', { ascending: true, nullsFirst: false })

        if (error) throw error

        if (data) {
          // Load submissions for each assignment
          const assignmentsWithSubmissions = await Promise.all(
            data.map(async (assignment) => {
              const { data: submissionData } = await supabase
                .from('assignment_submissions')
                .select('*')
                .eq('assignment_id', assignment.id)
                .eq('user_id', user.id)
                .maybeSingle()

              return {
                ...assignment,
                submission: submissionData || undefined
              }
            })
          )

          setAssignments(assignmentsWithSubmissions as Assignment[])
          setFilteredAssignments(assignmentsWithSubmissions as Assignment[])
        }
      } catch (error) {
        console.error('Error loading assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssignments()
  }, [supabase])

  useEffect(() => {
    let filtered = assignments

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.module?.title.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (filterType) {
      filtered = filtered.filter(a => a.assignment_type === filterType)
    }

    // Filter by status
    if (filterStatus) {
      if (filterStatus === 'submitted') {
        filtered = filtered.filter(a => a.submission)
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(a => !a.submission)
      } else if (filterStatus === 'graded') {
        filtered = filtered.filter(a => a.submission?.graded)
      }
    }

    setFilteredAssignments(filtered)
  }, [searchQuery, filterType, filterStatus, assignments])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    )
  }

  const types = Array.from(new Set(assignments.map(a => a.assignment_type)))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Assignments</h1>
        <p className="text-muted-foreground mt-2">
          Complete your assignments and track your progress
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType(null)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  filterType === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All Types
              </button>
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filterType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setFilterStatus(null)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filterStatus === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('submitted')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filterStatus === 'submitted'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Submitted
                </button>
                <button
                  onClick={() => setFilterStatus('graded')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filterStatus === 'graded'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Graded
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No assignments found. Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  )
}
