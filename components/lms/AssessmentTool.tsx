'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface Question {
  id: string
  type: 'textarea' | 'scale' | 'multiple_choice' | 'single_choice'
  question: string
  required?: boolean
  scale?: {
    min: number
    max: number
    labels?: {
      min?: string
      max?: string
    }
  }
  options?: string[]
}

interface AssessmentTool {
  id: string
  tool_type: string
  title: string
  description: string | null
  questions: Question[]
  is_active: boolean
  module_id: string | null
}

interface AssessmentToolProps {
  assessmentId: string
}

export function AssessmentTool({ assessmentId }: AssessmentToolProps) {
  const [assessment, setAssessment] = useState<AssessmentTool | null>(null)
  const [responses, setResponses] = useState<Record<string, string | number | string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hasExistingResponse, setHasExistingResponse] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadAssessment() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessment_tools')
          .select('*')
          .eq('id', assessmentId)
          .single()

        if (assessmentError) throw assessmentError
        if (assessmentData) {
          setAssessment(assessmentData as AssessmentTool)
        }

        // Check for existing response
        const { data: responseData } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('assessment_id', assessmentId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (responseData) {
          setHasExistingResponse(true)
          setSubmitted(true)
          setResponses(responseData.responses as Record<string, string | number>)
        }
      } catch (error) {
        console.error('Error loading assessment:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssessment()
  }, [assessmentId, supabase])

  const handleResponseChange = (questionId: string, value: string | number | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!assessment) return

    // Validate required questions
    const requiredQuestions = assessment.questions.filter(q => q.required)
    const missingRequired = requiredQuestions.filter(q => !responses[q.id] || responses[q.id] === '')

    if (missingRequired.length > 0) {
      alert(`Please answer all required questions: ${missingRequired.map(q => q.question).join(', ')}`)
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          user_id: user.id,
          responses: responses,
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'assessment_id,user_id'
        })

      if (error) throw error

      setSubmitted(true)
      setHasExistingResponse(true)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Failed to submit assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Assessment not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{assessment.title}</h1>
        {assessment.description && (
          <p className="text-muted-foreground mt-2">{assessment.description}</p>
        )}
      </div>

      {submitted && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">
                {hasExistingResponse ? 'Your response has been updated.' : 'Thank you! Your response has been submitted.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            Please answer all required questions. Your responses are confidential.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment.questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <label className="text-sm font-medium">
                {index + 1}. {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {question.type === 'textarea' && (
                <Textarea
                  value={responses[question.id] as string || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  disabled={submitted}
                  className="w-full"
                />
              )}

              {question.type === 'scale' && question.scale && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground min-w-[100px]">
                      {question.scale.labels?.min || question.scale.min}
                    </span>
                    <div className="flex-1 flex gap-2">
                      {Array.from({ length: question.scale.max - question.scale.min + 1 }, (_, i) => {
                        const value = question.scale!.min + i
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => !submitted && handleResponseChange(question.id, value)}
                            disabled={submitted}
                            className={`flex-1 py-2 px-3 rounded border transition-colors ${
                              responses[question.id] === value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-muted border-border'
                            } ${submitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[100px] text-right">
                      {question.scale.labels?.max || question.scale.max}
                    </span>
                  </div>
                  {responses[question.id] && (
                    <p className="text-xs text-muted-foreground text-center">
                      Selected: {responses[question.id]}
                    </p>
                  )}
                </div>
              )}

              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(responses[question.id] as unknown as string[])?.includes(option) || false}
                        onChange={(e) => {
                          const current = (responses[question.id] as unknown as string[]) || []
                          const updated = e.target.checked
                            ? [...current, option]
                            : current.filter(o => o !== option)
                          handleResponseChange(question.id, updated)
                        }}
                        disabled={submitted}
                        className="rounded"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'single_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={responses[question.id] === option}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        disabled={submitted}
                        className="rounded"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          {!submitted && (
            <div className="pt-4">
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </Button>
            </div>
          )}

          {submitted && (
            <div className="pt-4">
              <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">
                Edit Response
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
