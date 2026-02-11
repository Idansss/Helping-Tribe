'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ListChecks } from 'lucide-react'

type Quiz = {
  id: string
  title: string
  description: string | null
}

type Question = {
  id: string
  question_text: string
  options: string[]
  sort_order: number
}

type Response = {
  question_id: string
  selected_answer_index: number
  is_correct: boolean
  submitted_at: string
}

export default function LearnerTakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params?.quizId as string
  const supabase = createClient()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optionLabel = (idx: number) => {
    if (idx >= 0 && idx < 26) return String.fromCharCode(65 + idx) // A-Z
    return String(idx + 1)
  }

  useEffect(() => {
    if (!quizId) return
    async function init() {
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/student/login')
          return
        }

        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('id, title, description')
          .eq('id', quizId)
          .eq('published', true)
          .single()

        if (quizErr || !quizData) {
          setError('Quiz not found or not published.')
          setLoading(false)
          return
        }
        setQuiz(quizData as Quiz)

        const { data: qData, error: qErr } = await supabase
          .from('quiz_questions')
          .select('id, question_text, options, sort_order')
          .eq('quiz_id', quizId)
          .order('sort_order', { ascending: true })

        if (qErr || !qData?.length) {
          setError('No questions in this quiz yet.')
          setLoading(false)
          return
        }
        setQuestions(qData as Question[])

        const attemptResult = await getOrCreateAttempt(user.id)
        if (attemptResult === null) {
          setError('Could not start attempt.')
          setLoading(false)
          return
        }
        if (attemptResult.redirect) {
          setLoading(false)
          return
        }
        setAttemptId(attemptResult.id)

        const { data: respData } = await supabase
          .from('quiz_question_responses')
          .select('question_id, selected_answer_index, is_correct, submitted_at')
          .eq('attempt_id', attemptResult.id)
        setResponses((respData ?? []) as Response[])
      } catch (e) {
        console.error(e)
        setError('Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    async function getOrCreateAttempt(userId: string): Promise<{ id: string } | { redirect: true } | null> {
      const { data: existing } = await supabase
        .from('quiz_attempts')
        .select('id, completed_at')
        .eq('quiz_id', quizId)
        .eq('user_id', userId)
        .single()

      if (existing) {
        if (existing.completed_at) {
          router.replace(`/learner/quizzes/${quizId}/results`)
          return { redirect: true }
        }
        return { id: existing.id }
      }

      const { data: inserted, error } = await supabase
        .from('quiz_attempts')
        .insert({ quiz_id: quizId, user_id: userId })
        .select('id')
        .single()

      if (error) return null
      return inserted ? { id: inserted.id } : null
    }

    init()
  }, [quizId, router])

  const responseForQuestion = (questionId: string) =>
    responses.find((r) => r.question_id === questionId)

  const submitAnswer = async () => {
    if (attemptId == null || selectedIndex == null || currentIndex >= questions.length) return
    const q = questions[currentIndex]
    const existing = responseForQuestion(q.id)
    if (existing) {
      setSelectedIndex(null)
      setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/quiz/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          questionId: q.id,
          selectedAnswerIndex: selectedIndex,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to submit.')
        setSubmitting(false)
        return
      }
      setResponses((prev) => [
        ...prev,
        {
          question_id: q.id,
          selected_answer_index: selectedIndex,
          is_correct: data.is_correct,
          submitted_at: new Date().toISOString(),
        },
      ])
      setSelectedIndex(null)
      if (currentIndex >= questions.length - 1) {
        await supabase
          .from('quiz_attempts')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', attemptId)
        const { data: { user } } = await supabase.auth.getUser()
        if (user && quiz) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'quiz_results',
            title: 'Quiz results ready',
            body: quiz.title,
            link: `/learner/quizzes/${quizId}/results`,
          })
        }
        router.push(`/learner/quizzes/${quizId}/results`)
      } else {
        setCurrentIndex((i) => i + 1)
      }
    } catch (e) {
      console.error(e)
      setError('Failed to submit answer.')
    } finally {
      setSubmitting(false)
    }
  }

  const currentQuestion = questions[currentIndex]
  const currentResponse = currentQuestion ? responseForQuestion(currentQuestion.id) : null
  const allAnswered = questions.length > 0 && questions.every((q) => responseForQuestion(q.id))
  const canSubmit = selectedIndex != null && !currentResponse && !submitting

  if (loading || !quiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-slate-500 py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          {loading ? 'Loadingâ€¦' : error || 'Quiz not found.'}
        </div>
        {!loading && (
          <Button variant="outline" asChild>
            <Link href="/learner/quizzes">Back to Quizzes</Link>
          </Button>
        )}
      </div>
    )
  }

  if (error && !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-red-600">{error}</p>
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
            Back
          </Link>
        </Button>
        <span className="text-sm text-slate-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-teal-600" />
            {quiz.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion && (
            <>
              <p className="text-lg leading-relaxed text-slate-900">{currentQuestion.question_text}</p>
              <div className="space-y-3">
                {(currentQuestion.options || []).map((opt, idx) => {
                  const resp = currentResponse
                  const isSelected = selectedIndex === idx
                  const isLocked = !!resp
                  const correct = resp && resp.is_correct && resp.selected_answer_index === idx
                  const wrong = resp && !resp.is_correct && resp.selected_answer_index === idx
                  const wasPicked = resp && resp.selected_answer_index === idx

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) setSelectedIndex(idx)
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                        isLocked ? 'cursor-default text-slate-700' : 'cursor-pointer hover:bg-teal-50/60'
                      } ${isSelected && !isLocked ? 'bg-teal-50' : ''} ${correct ? 'bg-green-50' : ''} ${
                        wrong ? 'bg-red-50' : ''
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span className="w-6 shrink-0 font-semibold text-slate-900" aria-hidden="true">
                          {optionLabel(idx)}.
                        </span>
                        <span className="flex-1 leading-relaxed text-slate-900">{opt}</span>
                        {correct && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                        {wrong && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
                      </span>
                      {isLocked && wasPicked && (
                        <span className="block text-xs mt-1 text-slate-500">
                          {resp.is_correct ? 'Correct - answer locked.' : 'Incorrect - answer locked.'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  Previous
                </Button>
                {currentResponse ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      currentIndex < questions.length - 1
                        ? setCurrentIndex((i) => i + 1)
                        : router.push(`/learner/quizzes/${quizId}/results`)
                    }
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {currentIndex < questions.length - 1 ? 'Next' : 'See results'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={!canSubmit}
                    onClick={submitAnswer}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit answer'}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
