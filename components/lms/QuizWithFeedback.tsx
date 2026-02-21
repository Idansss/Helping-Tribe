'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Trophy,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category?: string
}

interface QuizWithFeedbackProps {
  moduleId: string
  moduleTitle: string
  questions: QuizQuestion[]
  onComplete?: (score: number) => void
}

export function QuizWithFeedback({ moduleId, moduleTitle, questions, onComplete }: QuizWithFeedbackProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    setShowFeedback(true)
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      // Build final answers map including the current question
      const finalAnswers =
        selectedAnswer !== null
          ? { ...answers, [currentQuestion.id]: selectedAnswer }
          : answers
      completeQuiz(finalAnswers)
    }
  }

  function scoreAnswers(answersMap: Record<string, number>) {
    const correctCount = Object.entries(answersMap).filter(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId)
      return question && answer === question.correctAnswer
    }).length
    return Math.round((correctCount / questions.length) * 100)
  }

  function completeQuiz(finalAnswers: Record<string, number> = answers) {
    setIsComplete(true)
    const score = scoreAnswers(finalAnswers)
    onComplete?.(score)
  }

  const calculateFinalScore = () => scoreAnswers(answers)

  if (isComplete) {
    const finalScore = calculateFinalScore()
    const passed = finalScore >= 70

    return (
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className={cn(
            "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
            passed ? "bg-green-100" : "bg-yellow-100"
          )}>
            {passed ? (
              <Trophy className="h-12 w-12 text-green-600" />
            ) : (
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#4c1d95] mb-2">
              {passed ? 'Congratulations!' : 'Good Effort!'}
            </h2>
            <p className="text-gray-600">
              {passed 
                ? 'You passed the quiz! Great work on mastering this module.'
                : 'You didn\'t quite hit the passing score this time. Review the material and try again!'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-5xl font-bold text-[#4c1d95]">{finalScore}%</p>
              <p className="text-sm text-gray-600 mt-1">Your Score</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-gray-400">{Object.keys(answers).length}/{questions.length}</p>
              <p className="text-sm text-gray-600 mt-1">Correct</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="bg-[#4c1d95] hover:bg-[#5b21b6]"
              onClick={() => {
                setCurrentQuestionIndex(0)
                setSelectedAnswer(null)
                setShowFeedback(false)
                setAnswers({})
                setIsComplete(false)
              }}
            >
              Retake Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/learner/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#4c1d95]">{moduleTitle} Quiz</h2>
            <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <Badge className="bg-[#4c1d95] text-white">
            {Math.round(progress)}%
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Question Card */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Question */}
          <div>
            {currentQuestion.category && (
              <Badge className="mb-3 bg-purple-100 text-purple-700">
                {currentQuestion.category}
              </Badge>
            )}
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrectAnswer = index === currentQuestion.correctAnswer
              const showAsCorrect = showFeedback && isCorrectAnswer
              const showAsWrong = showFeedback && isSelected && !isCorrect
              const label = index >= 0 && index < 26 ? String.fromCharCode(65 + index) : String(index + 1)

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                    showAsCorrect && "border-green-500 bg-green-50",
                    showAsWrong && "border-red-500 bg-red-50",
                    !showFeedback && isSelected && "border-[#4c1d95] bg-purple-50",
                    !showFeedback && !isSelected && "border-gray-200 hover:border-[#4c1d95] hover:bg-purple-50/50",
                    showFeedback && !showAsCorrect && !showAsWrong && "border-gray-200 opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-600">
                        {label}
                      </span>
                      <span className="font-medium leading-snug">{option}</span>
                    </div>
                    {showAsCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {showAsWrong && <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={cn(
              "p-4 rounded-xl border-2",
              isCorrect ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"
            )}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <p className="font-semibold mb-2 text-gray-900">
                    {isCorrect ? '✓ Correct!' : '× Not quite right'}
                  </p>
                  <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showFeedback ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="bg-[#4c1d95] hover:bg-[#5b21b6] flex-1"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-[#4c1d95] hover:bg-[#5b21b6] flex-1"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    View Results
                    <Trophy className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
