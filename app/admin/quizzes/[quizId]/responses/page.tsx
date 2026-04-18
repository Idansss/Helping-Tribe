'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle2, ListChecks, Loader2, User, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

type Quiz = {
  id: string
  title: string
  description: string | null
  published: boolean
}

type Question = {
  id: string
  question_text: string
  options: string[]
  correct_answer_index: number
  sort_order: number
}

type Attempt = {
  id: string
  user_id: string
  quiz_id: string
  completed_at: string | null
  started_at?: string | null
  created_at?: string | null
  profile?: {
    id: string
    full_name: string | null
    email: string | null
    role: string | null
  } | null
}

type QuestionResponse = {
  id: string
  attempt_id: string
  question_id: string
  selected_answer_index: number
  is_correct: boolean
  submitted_at: string | null
}

function optionLetter(index: number) {
  if (index >= 0 && index < 26) return String.fromCharCode(65 + index)
  return String(index + 1)
}

export default function AdminQuizResponsesPage() {
  const params = useParams()
  const quizId = params?.quizId as string
  const supabase = createClient()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [responsesByAttempt, setResponsesByAttempt] = useState<Record<string, QuestionResponse[]>>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!quizId) return
    async function load() {
      setLoading(true)
      try {
        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('id, title, description, published')
          .eq('id', quizId)
          .maybeSingle()
        if (quizErr) throw quizErr
        setQuiz(quizData as Quiz | null)

        const { data: qData, error: qErr } = await supabase
          .from('quiz_questions')
          .select('id, question_text, options, correct_answer_index, sort_order')
          .eq('quiz_id', quizId)
          .order('sort_order', { ascending: true })
        if (qErr) throw qErr
        setQuestions((qData ?? []) as Question[])

        const { data: attemptData, error: attemptErr } = await supabase
          .from('quiz_attempts')
          .select(`id, user_id, quiz_id, completed_at, started_at, created_at,
            profile:profiles(id, full_name, email, role)`)
          .eq('quiz_id', quizId)
          .order('completed_at', { ascending: false, nullsFirst: false })
        if (attemptErr) throw attemptErr
        const normalizedAttempts = (attemptData ?? []).map((a: unknown) => {
          const row = a as Attempt & { profile?: Attempt['profile'] | Attempt['profile'][] }
          const profile = Array.isArray(row.profile)
            ? (row.profile[0] ?? null)
            : (row.profile ?? null)
          return { ...row, profile }
        }) as Attempt[]
        setAttempts(normalizedAttempts)

        if (normalizedAttempts.length > 0) {
          const attemptIds = normalizedAttempts.map((a) => a.id)
          const { data: respData, error: respErr } = await supabase
            .from('quiz_question_responses')
            .select('id, attempt_id, question_id, selected_answer_index, is_correct, submitted_at')
            .in('attempt_id', attemptIds)
          if (respErr) throw respErr
          const grouped: Record<string, QuestionResponse[]> = {}
          for (const r of (respData ?? []) as QuestionResponse[]) {
            grouped[r.attempt_id] = grouped[r.attempt_id] ?? []
            grouped[r.attempt_id].push(r)
          }
          setResponsesByAttempt(grouped)
        }
      } catch (err) {
        console.error('Failed to load quiz responses', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [quizId, supabase])

  const questionMap = useMemo(() => {
    const map: Record<string, Question> = {}
    for (const q of questions) map[q.id] = q
    return map
  }, [questions])

  const totalAttempts = attempts.length
  const completedAttempts = attempts.filter((a) => a.completed_at).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/quizzes" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading quiz responses…
        </div>
      ) : !quiz ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">Quiz not found.</CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50/70 to-white">
            <CardHeader>
              <CardTitle className="text-xl flex items-start gap-2">
                <ListChecks className="h-6 w-6 text-teal-600 mt-0.5 shrink-0" />
                <span>{quiz.title} — Student responses</span>
              </CardTitle>
              <CardDescription>
                {quiz.description || 'View every student attempt and see which answer they chose for each question.'}
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Badge variant={quiz.published ? 'default' : 'secondary'}>
                  {quiz.published ? 'Published' : 'Draft'}
                </Badge>
                <span>
                  {completedAttempts} completed · {totalAttempts} total {totalAttempts === 1 ? 'attempt' : 'attempts'}
                </span>
                <span>·</span>
                <span>{questions.length} {questions.length === 1 ? 'question' : 'questions'}</span>
              </div>
            </CardHeader>
          </Card>

          {attempts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No students have taken this quiz yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => {
                const responses = (responsesByAttempt[attempt.id] ?? []).sort((a, b) => {
                  const qa = questionMap[a.question_id]?.sort_order ?? 0
                  const qb = questionMap[b.question_id]?.sort_order ?? 0
                  return qa - qb
                })
                const correct = responses.filter((r) => r.is_correct).length
                const total = responses.length
                const name =
                  attempt.profile?.full_name ||
                  attempt.profile?.email ||
                  'Unknown student'
                const isOpen = expanded[attempt.id] ?? true
                return (
                  <Card key={attempt.id} className="border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="font-semibold text-slate-900">{name}</p>
                              {attempt.profile?.role && (
                                <Badge variant="secondary" className="capitalize">
                                  {attempt.profile.role}
                                </Badge>
                              )}
                            </div>
                            {attempt.profile?.email && (
                              <p className="text-xs text-slate-500 break-all">
                                {attempt.profile.email}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                              {attempt.completed_at
                                ? `Submitted ${format(new Date(attempt.completed_at), 'PPp')}`
                                : 'In progress'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={total > 0 && correct === total ? 'default' : 'secondary'}
                            className={
                              total === 0
                                ? ''
                                : correct === total
                                ? 'bg-green-600 hover:bg-green-600'
                                : ''
                            }
                          >
                            {correct} / {total} correct
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpanded((prev) => ({ ...prev, [attempt.id]: !isOpen }))
                            }
                          >
                            {isOpen ? 'Hide answers' : 'Show answers'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {isOpen && (
                      <CardContent className="pt-0">
                        {responses.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No answers recorded for this attempt.
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {responses.map((r, i) => {
                              const q = questionMap[r.question_id]
                              const chosenText =
                                q && Array.isArray(q.options)
                                  ? q.options[r.selected_answer_index]
                                  : undefined
                              const correctText =
                                q && Array.isArray(q.options)
                                  ? q.options[q.correct_answer_index]
                                  : undefined
                              return (
                                <li
                                  key={r.id}
                                  className="rounded-lg border border-slate-200 p-3 bg-slate-50/50"
                                >
                                  <p className="font-medium text-slate-900">
                                    {i + 1}. {q?.question_text ?? 'Question'}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    {r.is_correct ? (
                                      <span className="inline-flex items-center gap-1 text-green-700">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Correct
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-red-700">
                                        <XCircle className="h-4 w-4" />
                                        Incorrect
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm text-slate-700">
                                    <span className="font-medium">Student chose: </span>
                                    {chosenText !== undefined
                                      ? `${optionLetter(r.selected_answer_index)}. ${chosenText}`
                                      : optionLetter(r.selected_answer_index)}
                                  </p>
                                  {!r.is_correct && q && (
                                    <p className="mt-1 text-sm text-slate-600">
                                      <span className="font-medium">Correct answer: </span>
                                      {correctText !== undefined
                                        ? `${optionLetter(q.correct_answer_index)}. ${correctText}`
                                        : optionLetter(q.correct_answer_index)}
                                    </p>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
