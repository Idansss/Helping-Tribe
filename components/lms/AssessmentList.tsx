'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface AssessmentTool {
  id: string
  tool_type: string
  title: string
  description: string | null
  is_active: boolean
  module_id: string | null
  hasResponse?: boolean
}

const TOOL_TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pre_training: { label: 'Pre-Training', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: FileText },
  post_training: { label: 'Post-Training', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
  session_feedback: { label: 'Session Feedback', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Clock },
  final_evaluation: { label: 'Final Evaluation', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: AlertCircle }
}

function getErrorMessage(error: unknown) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error && error.message) return error.message
  const maybe = error as { message?: string; code?: string; details?: string; hint?: string }
  return [maybe.message, maybe.code, maybe.details, maybe.hint].filter(Boolean).join(' | ') || 'Unknown error'
}

function isMissingRelationError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()
  const code = String((error as { code?: string } | null)?.code || '')
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('could not find the table')
  )
}

export function AssessmentList() {
  const [assessments, setAssessments] = useState<AssessmentTool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function loadAssessments() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) setAssessments([])
          return
        }

        const { data, error } = await supabase
          .from('assessment_tools')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (error) {
          if (isMissingRelationError(error)) {
            if (!cancelled) setAssessments([])
            return
          }
          throw error
        }

        if (data) {
          const assessmentsWithResponses = await Promise.all(
            data.map(async (assessment) => {
              const { data: responseData, error: responseError } = await supabase
                .from('assessment_responses')
                .select('id')
                .eq('assessment_id', assessment.id)
                .eq('user_id', user.id)
                .maybeSingle()

              if (responseError && !isMissingRelationError(responseError)) {
                console.warn('Assessment response lookup failed:', getErrorMessage(responseError))
              }

              return {
                ...assessment,
                hasResponse: !!responseData
              }
            })
          )

          if (!cancelled) setAssessments(assessmentsWithResponses as AssessmentTool[])
        }
      } catch (error) {
        console.warn('Error loading assessments:', getErrorMessage(error))
        if (!cancelled) setAssessments([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAssessments()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Assessment Tools</h1>
        <p className="text-muted-foreground mt-2">
          Complete assessments to help us improve the training program
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map((assessment) => {
          const config = TOOL_TYPE_CONFIG[assessment.tool_type] || {
            label: assessment.tool_type,
            color: 'bg-gray-100 text-gray-800',
            icon: FileText
          }
          const Icon = config.icon

          return (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {assessment.title}
                    </CardTitle>
                    <Badge className={`${config.color} mt-2`}>
                      {config.label}
                    </Badge>
                  </div>
                  {assessment.hasResponse && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
                {assessment.description && (
                  <CardDescription className="mt-2">
                    {assessment.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/learner/assessments/${assessment.id}`}>
                    {assessment.hasResponse ? 'View/Edit Response' : 'Start Assessment'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {assessments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No assessments available at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
