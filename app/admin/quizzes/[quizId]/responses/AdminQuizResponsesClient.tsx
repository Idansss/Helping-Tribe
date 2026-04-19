'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle2, ListChecks, User, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import type {
  AdminQuizAttempt,
  AdminQuizQuestion,
  AdminQuizQuestionResponse,
  AdminQuizResponsesData,
} from '@/lib/server/admin/quiz-responses'

function optionLetter(index: number) {
  if (index >= 0 && index < 26) return String.fromCharCode(65 + index)
  return String(index + 1)
}

type AdminQuizResponsesClientProps = AdminQuizResponsesData

export default function AdminQuizResponsesClient({
  quiz,
  questions,
  attempts,
  responsesByAttempt,
  errorMessage,
}: AdminQuizResponsesClientProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const questionMap = useMemo(() => {
    const map: Record<string, AdminQuizQuestion> = {}
    for (const question of questions) {
      map[question.id] = question
    }
    return map
  }, [questions])

  const totalAttempts = attempts.length
  const completedAttempts = attempts.filter((attempt) => attempt.completed_at).length

  if (errorMessage) {
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

        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="py-10 text-center">
            <p className="font-medium text-red-700">{errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!quiz) {
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

        <Card>
          <CardContent className="py-12 text-center text-slate-500">Quiz not found.</CardContent>
        </Card>
      </div>
    )
  }

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

      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/70 to-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-start gap-2">
            <ListChecks className="h-6 w-6 text-teal-600 mt-0.5 shrink-0" />
            <span>{quiz.title} - Student responses</span>
          </CardTitle>
          <CardDescription>
            {quiz.description || 'View every student attempt and see which answer they chose for each question.'}
          </CardDescription>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge variant={quiz.published ? 'default' : 'secondary'}>
              {quiz.published ? 'Published' : 'Draft'}
            </Badge>
            <span>
              {completedAttempts} completed | {totalAttempts} total {totalAttempts === 1 ? 'attempt' : 'attempts'}
            </span>
            <span>|</span>
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
              const left = questionMap[a.question_id]?.sort_order ?? 0
              const right = questionMap[b.question_id]?.sort_order ?? 0
              return left - right
            })
            const correct = responses.filter((response) => response.is_correct).length
            const total = responses.length
            const name =
              attempt.profile?.full_name ||
              attempt.profile?.email ||
              'Unknown student'
            const isOpen = expanded[attempt.id] ?? true

            return (
              <AttemptCard
                key={attempt.id}
                attempt={attempt}
                correct={correct}
                isOpen={isOpen}
                name={name}
                onToggle={() => setExpanded((prev) => ({ ...prev, [attempt.id]: !isOpen }))}
                questionMap={questionMap}
                responses={responses}
                total={total}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

type AttemptCardProps = {
  attempt: AdminQuizAttempt
  correct: number
  isOpen: boolean
  name: string
  onToggle: () => void
  questionMap: Record<string, AdminQuizQuestion>
  responses: AdminQuizQuestionResponse[]
  total: number
}

function AttemptCard({
  attempt,
  correct,
  isOpen,
  name,
  onToggle,
  questionMap,
  responses,
  total,
}: AttemptCardProps) {
  return (
    <Card className="border-slate-200">
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
            <Button variant="outline" size="sm" onClick={onToggle}>
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
              {responses.map((response, index) => {
                const question = questionMap[response.question_id]
                const chosenText =
                  question && Array.isArray(question.options)
                    ? question.options[response.selected_answer_index]
                    : undefined
                const correctText =
                  question && Array.isArray(question.options)
                    ? question.options[question.correct_answer_index]
                    : undefined

                return (
                  <li
                    key={response.id}
                    className="rounded-lg border border-slate-200 p-3 bg-slate-50/50"
                  >
                    <p className="font-medium text-slate-900">
                      {index + 1}. {question?.question_text ?? 'Question'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      {response.is_correct ? (
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
                        ? `${optionLetter(response.selected_answer_index)}. ${chosenText}`
                        : optionLetter(response.selected_answer_index)}
                    </p>
                    {!response.is_correct && question && (
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium">Correct answer: </span>
                        {correctText !== undefined
                          ? `${optionLetter(question.correct_answer_index)}. ${correctText}`
                          : optionLetter(question.correct_answer_index)}
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
}
