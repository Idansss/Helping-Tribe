'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, ListChecks, ArrowLeft, Loader2 } from 'lucide-react'

type Quiz = {
  id: string
  title: string
  description: string | null
}

type Response = {
  question_id: string
  question_text?: string
  options?: string[]
  selected_answer_index: number
  is_correct: boolean
}

export default function LearnerQuizResultsPage() {
  const params = useParams()
  const quizId = params?.quizId as string
  const supabase = createClient()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const optionLabel = (idx: number) => {
    if (idx >= 0 && idx < 26) return String.fromCharCode(65 + idx) // A-Z
    return String(idx + 1)
  }

  useEffect(() => {
    if (!quizId) return
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('id, title, description')
          .eq('id', quizId)
          .single()

        if (quizErr || !quizData) {
          setLoading(false)
          return
        }
        setQuiz(quizData as Quiz)

        const { data: attempt } = await supabase
          .from('quiz_attempts')
          .select('id')
          .eq('quiz_id', quizId)
          .eq('user_id', user.id)
          .single()

        if (!attempt) {
          setLoading(false)
          return
        }

        const { data: respData } = await supabase
          .from('quiz_question_responses')
          .select('question_id, selected_answer_index, is_correct')
          .eq('attempt_id', attempt.id)
          .order('submitted_at', { ascending: true })

        if (!respData?.length) {
          setResponses([])
          setLoading(false)
          return
        }

        const questionIds = [...new Set(respData.map((r) => r.question_id))]
        const { data: qData } = await supabase
          .from('quiz_questions')
          .select('id, question_text, options')
          .in('id', questionIds)

        const qMap = (qData ?? []).reduce((acc: Record<string, { question_text: string; options: string[] }>, q: any) => {
          acc[q.id] = { question_text: q.question_text, options: q.options ?? [] }
          return acc
        }, {})

        const withText = (respData as Response[]).map((r) => ({
          ...r,
          question_text: qMap[r.question_id]?.question_text,
          options: qMap[r.question_id]?.options ?? [],
        }))
        setResponses(withText)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [quizId])

  const correctCount = responses.filter((r) => r.is_correct).length
  const total = responses.length

  if (loading || !quiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-slate-500 py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading results…
        </div>
        <Button variant="outline" asChild>
          <Link href="/learner/quizzes">Back to Quizzes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learner/quizzes" className="flex items-center gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
      </div>

      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/80 to-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-teal-600" />
            {quiz.title} — Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-semibold text-slate-900">
            {correctCount} / {total} correct
          </p>
          <p className="text-sm text-slate-600">
            Your answers are locked. You cannot change them after submitting.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your answers</h2>
        {responses.map((r, i) => (
          <Card key={r.question_id} className="border-slate-200">
            <CardContent className="pt-4">
              <p className="font-medium text-slate-900">{i + 1}. {r.question_text ?? 'Question'}</p>
              <p className="mt-2 text-sm text-slate-600">
                You chose:{' '}
                {Array.isArray(r.options)
                  ? `${optionLabel(r.selected_answer_index)}. ${r.options[r.selected_answer_index]}`
                  : '—'}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm">
                {r.is_correct ? (
                  <span className="flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Correct — answer locked.
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-700">
                    <XCircle className="h-4 w-4" />
                    Incorrect — answer locked.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
