'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Quiz, QuizQuestion, QuizAttempt } from '@/types'
import { useRouter } from 'next/navigation'

interface AssessmentEngineProps {
  moduleId: string
}

export function AssessmentEngine({ moduleId }: AssessmentEngineProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadQuiz() {
      try {
        // Load quiz for module
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('module_id', moduleId)
          .single()

        if (quizError) throw quizError
        setQuiz(quizData as Quiz)

        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('question_number', { ascending: true })

        if (questionsError) throw questionsError
        if (questionsData) {
          setQuestions(questionsData as QuizQuestion[])
        }
      } catch (error) {
        console.error('Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [moduleId, supabase])

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = async () => {
    if (questions.length === 0 || !quiz) return

    setSubmitting(true)
    try {
      // Calculate score
      let correctCount = 0
      questions.forEach(question => {
        const selectedOptionId = answers[question.id]
        const correctOption = question.options.find((opt: any) => opt.is_correct)
        if (selectedOptionId === correctOption?.id) {
          correctCount++
        }
      })

      const calculatedScore = Math.round((correctCount / questions.length) * 100)
      const hasPassed = calculatedScore >= quiz.passing_score

      setScore(calculatedScore)
      setPassed(hasPassed)
      setSubmitted(true)

      // Save attempt
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score: calculatedScore,
          passed: hasPassed,
          answers,
        })

      if (attemptError) throw attemptError

      // Update module progress
      const { error: progressError } = await supabase
        .from('module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          quiz_score: calculatedScore,
          quiz_passed: hasPassed,
          quiz_completed_at: new Date().toISOString(),
          is_completed: hasPassed, // Only mark complete if passed
          completed_at: hasPassed ? new Date().toISOString() : null,
        })

      if (progressError) throw progressError
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No quiz available for this module</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const allAnswered = questions.every(q => answers[q.id])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>
            {quiz.description || `Complete this quiz to proceed. Passing score: ${quiz.passing_score}%`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-6">
              {/* Results */}
              <div className={`p-6 rounded-lg ${
                passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {passed ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">
                      {passed ? 'Congratulations! You Passed!' : 'You Did Not Pass'}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Your score: {score}% (Required: {quiz.passing_score}%)
                    </p>
                  </div>
                </div>

                {!passed && (
                  <div className="mt-4 p-4 bg-white rounded border border-red-200">
                    <p className="text-sm text-muted-foreground">
                      You need to score at least {quiz.passing_score}% to pass. Please review the module and try again.
                    </p>
                  </div>
                )}
              </div>

              {/* Review Answers */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Review Your Answers</h4>
                {questions.map((question, index) => {
                  const selectedOptionId = answers[question.id]
                  const correctOption = question.options.find((opt: any) => opt.is_correct)
                  const isCorrect = selectedOptionId === correctOption?.id
                  const selectedOption = question.options.find((opt: any) => opt.id === selectedOptionId)

                  return (
                    <Card key={question.id} className={isCorrect ? 'border-green-500' : 'border-red-500'}>
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-1" />
                          )}
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              Question {index + 1}: {question.question_text}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {question.options.map((option: any, optionIndex: number) => {
                          const isSelected = option.id === selectedOptionId
                          const isCorrectOption = option.is_correct
                          const label =
                            optionIndex >= 0 && optionIndex < 26
                              ? String.fromCharCode(65 + optionIndex)
                              : String(optionIndex + 1)

                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded border ${
                                isCorrectOption
                                  ? 'bg-green-50 border-green-500'
                                  : isSelected && !isCorrectOption
                                  ? 'bg-red-50 border-red-500'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold text-slate-600">
                                  {label}
                                </span>
                                <span className="font-medium">{option.text}</span>
                                {isCorrectOption && (
                                  <Badge variant="default" className="bg-green-500">
                                    Correct
                                  </Badge>
                                )}
                                {isSelected && !isCorrectOption && (
                                  <Badge variant="destructive">Your Answer</Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex gap-4">
                <Button onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
                {!passed && (
                  <Button variant="outline" onClick={() => router.push(`/course/module/${moduleId}`)}>
                    Review Module
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-muted-foreground">
                  {Object.keys(answers).length} of {questions.length} answered
                </span>
              </div>

              {/* Question */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentQuestion.question_text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQuestion.options.map((option: any, optionIndex: number) => {
                    const isSelected = answers[currentQuestion.id] === option.id
                    const label =
                      optionIndex >= 0 && optionIndex < 26
                        ? String.fromCharCode(65 + optionIndex)
                        : String(optionIndex + 1)

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-600">
                            {label}
                          </span>
                          <span className="leading-snug">{option.text}</span>
                        </span>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    disabled={!answers[currentQuestion.id]}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
