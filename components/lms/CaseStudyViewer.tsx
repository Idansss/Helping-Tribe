'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, CheckCircle2, Lightbulb, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import Link from 'next/link'

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
}

interface CaseStudyResponse {
  id: string
  responses: Record<string, string>
  reflection: string | null
  submitted_at: string
}

export function CaseStudyViewer({ caseStudyId }: { caseStudyId: string }) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [response, setResponse] = useState<CaseStudyResponse | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHints, setShowHints] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    async function loadCaseStudy() {
      try {
        const { data, error } = await supabase
          .from('case_studies')
          .select('*')
          .eq('id', caseStudyId)
          .single()

        if (error) throw error
        if (data) {
          setCaseStudy(data as CaseStudy)
        }
      } catch (error) {
        console.error('Error loading case study:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCaseStudy()
  }, [caseStudyId, supabase])

  useEffect(() => {
    async function loadResponse() {
      if (!caseStudy) return

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('case_study_responses')
          .select('*')
          .eq('case_study_id', caseStudy.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setResponse(data as CaseStudyResponse)
          setAnswers(data.responses || {})
          setReflection(data.reflection || '')
        }
      } catch (error) {
        console.error('Error loading response:', error)
      }
    }

    loadResponse()
  }, [caseStudy, supabase])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSave = async () => {
    if (!caseStudy) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('case_study_responses')
        .upsert({
          case_study_id: caseStudy.id,
          user_id: user.id,
          responses: answers,
          reflection: reflection || null,
          submitted_at: new Date().toISOString()
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving response:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading case study...</p>
        </div>
      </div>
    )
  }

  if (!caseStudy) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Case study not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/case-studies">← Back to Case Studies</Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">{caseStudy.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              {caseStudy.module && (
                <Badge variant="outline">
                  Week {caseStudy.module.week_number}
                </Badge>
              )}
              <Badge className={getDifficultyColor(caseStudy.difficulty_level)}>
                {caseStudy.difficulty_level.charAt(0).toUpperCase() + caseStudy.difficulty_level.slice(1)}
              </Badge>
            </div>
          </div>
          {response && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
      </div>

      {/* Learning Objectives */}
      {caseStudy.learning_objectives && caseStudy.learning_objectives.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Learning Objectives</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseStudy.learning_objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Scenario */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {caseStudy.scenario}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Questions</CardTitle>
          <CardDescription>
            Answer these questions to analyze the case study
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {caseStudy.questions.map((question, idx) => (
            <div key={question.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <label className="text-base font-semibold flex-1">
                  {idx + 1}. {question.question}
                </label>
                {question.hint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHints(prev => ({
                      ...prev,
                      [question.id]: !prev[question.id]
                    }))}
                  >
                    <Lightbulb className={`h-4 w-4 ${showHints[question.id] ? 'text-yellow-600' : ''}`} />
                  </Button>
                )}
              </div>
              {question.hint && showHints[question.id] && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Hint:</strong> {question.hint}
                  </p>
                </div>
              )}
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Your answer..."
                className="min-h-[120px]"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card>
        <CardHeader>
          <CardTitle>Reflection</CardTitle>
          <CardDescription>
            Optional: Share your overall thoughts and insights about this case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What did you learn from analyzing this case? What would you do differently? What insights did you gain?"
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/case-studies">Back to Case Studies</Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Response'}
        </Button>
      </div>

      {response && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Last saved: {format(new Date(response.submitted_at), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
