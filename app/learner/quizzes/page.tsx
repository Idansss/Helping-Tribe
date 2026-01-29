'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { QuizListSkeleton } from '@/components/lms/LoadingSkeletons'
import { ListChecks, ArrowRight, CheckCircle2 } from 'lucide-react'

type Quiz = {
  id: string
  title: string
  description: string | null
  published: boolean
}

type Attempt = {
  id: string
  quiz_id: string
  completed_at: string | null
}

export default function LearnerQuizzesPage() {
  const supabase = createClient()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setQuizzes([])
          setAttempts([])
          setLoading(false)
          return
        }

        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('id, title, description, published')
          .eq('published', true)
          .order('created_at', { ascending: false })

        if (quizErr) throw quizErr
        setQuizzes((quizData ?? []) as Quiz[])

        const { data: attemptData, error: attemptErr } = await supabase
          .from('quiz_attempts')
          .select('id, quiz_id, completed_at')
          .eq('user_id', user.id)

        if (attemptErr) throw attemptErr
        setAttempts((attemptData ?? []) as Attempt[])
      } catch (e) {
        console.error(e)
        setQuizzes([])
        setAttempts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getAttempt = (quizId: string) => attempts.find((a) => a.quiz_id === quizId)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ListChecks className="h-7 w-7 text-teal-600" />
          Quizzes
        </h1>
        <p className="text-slate-600 mt-1">
          Quizzes are set by your mentors and admins. Once you submit an answer it is locked—you cannot change it. Take your time and choose carefully.
        </p>
      </div>

      {loading ? (
        <QuizListSkeleton />
      ) : quizzes.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-8 text-center text-slate-600">
            <ListChecks className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No published quizzes yet.</p>
            <p className="text-sm mt-1">Your mentor or admin will publish quizzes here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const attempt = getAttempt(quiz.id)
            const completed = attempt?.completed_at != null
            return (
              <Card key={quiz.id} className="border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {quiz.title}
                        {completed && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </CardTitle>
                      {quiz.description && (
                        <CardDescription className="mt-1">{quiz.description}</CardDescription>
                      )}
                    </div>
                    <Button asChild size="sm" className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white">
                      <Link href={completed ? `/learner/quizzes/${quiz.id}/results` : `/learner/quizzes/${quiz.id}`}>
                        {completed ? 'View results' : 'Take quiz'}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
