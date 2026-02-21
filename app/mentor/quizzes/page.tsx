'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Pencil, Trash2, ListChecks, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type QuizRow = {
  id: string
  title: string
  description: string | null
  published: boolean
  created_at: string
}

type QuestionRow = {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer_index: number
  sort_order: number
}

function parseQuestionOptions(raw: string) {
  return raw
    .split(/\r?\n|\\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

function optionLetter(index: number) {
  if (index >= 0 && index < 26) return String.fromCharCode(65 + index)
  return String(index + 1)
}

export default function MentorQuizzesPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState<QuizRow[]>([])
  const [loading, setLoading] = useState(true)
  const [quizDialogOpen, setQuizDialogOpen] = useState(false)
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false)
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [quizPublished, setQuizPublished] = useState(false)
  const [savingQuiz, setSavingQuiz] = useState(false)

  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [qText, setQText] = useState('')
  const [qOptions, setQOptions] = useState('')
  const [qCorrectIndex, setQCorrectIndex] = useState(0)
  const [savingQuestion, setSavingQuestion] = useState(false)

  const qParsedOptions = useMemo(() => parseQuestionOptions(qOptions), [qOptions])
  const canPickCorrectAnswer = qParsedOptions.length >= 2
  const clampedCorrectIndex = Math.min(
    qCorrectIndex,
    Math.max(0, qParsedOptions.length - 1)
  )

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description, published, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setQuizzes((data ?? []) as QuizRow[])
    } catch (e) {
      console.error(e)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuizzes()
  }, [])

  const openCreateQuiz = () => {
    setEditingQuizId(null)
    setQuizTitle('')
    setQuizDescription('')
    setQuizPublished(false)
    setQuizDialogOpen(true)
  }

  const openEditQuiz = (row: QuizRow) => {
    setEditingQuizId(row.id)
    setQuizTitle(row.title)
    setQuizDescription(row.description ?? '')
    setQuizPublished(row.published)
    setQuizDialogOpen(true)
  }

  const saveQuiz = async () => {
    if (!quizTitle.trim()) return
    setSavingQuiz(true)
    try {
      const payload = {
        title: quizTitle.trim(),
        description: quizDescription.trim() || null,
        published: quizPublished,
        updated_at: new Date().toISOString(),
      }
      if (editingQuizId) {
        const { error } = await supabase.from('quizzes').update(payload).eq('id', editingQuizId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('quizzes').insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        })
        if (error) throw error
      }
      setQuizDialogOpen(false)
      loadQuizzes()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save quiz.', variant: 'destructive' })
    } finally {
      setSavingQuiz(false)
    }
  }

  const deleteQuiz = (id: string) => setDeletingQuizId(id)

  const confirmDeleteQuiz = async () => {
    if (!deletingQuizId) return
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', deletingQuizId)
      if (error) throw error
      loadQuizzes()
      if (selectedQuizId === deletingQuizId) setQuestionsDialogOpen(false)
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete quiz.', variant: 'destructive' })
    } finally {
      setDeletingQuizId(null)
    }
  }

  const openQuestions = async (quizId: string) => {
    setSelectedQuizId(quizId)
    setQuestionsDialogOpen(true)
    setQuestionsLoading(true)
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('id, quiz_id, question_text, options, correct_answer_index, sort_order')
        .eq('quiz_id', quizId)
        .order('sort_order', { ascending: true })
      if (error) throw error
      setQuestions((data ?? []) as QuestionRow[])
    } catch (e) {
      console.error(e)
      setQuestions([])
    } finally {
      setQuestionsLoading(false)
    }
  }

  const openAddQuestion = () => {
    if (!selectedQuizId) return
    setEditingQuestionId(null)
    setQText('')
    setQOptions('')
    setQCorrectIndex(0)
    setQuestionDialogOpen(true)
  }

  const openEditQuestion = (q: QuestionRow) => {
    setEditingQuestionId(q.id)
    setQText(q.question_text)
    setQOptions(Array.isArray(q.options) ? q.options.join('\n') : '')
    setQCorrectIndex(Number(q.correct_answer_index))
    setQuestionDialogOpen(true)
  }

  const saveQuestion = async () => {
    if (!selectedQuizId || !qText.trim()) return
    const opts = qParsedOptions
    if (opts.length < 2) {
      toast({ title: 'Add at least 2 options (one per line).', variant: 'destructive' })
      return
    }
    const idx = Math.min(qCorrectIndex, opts.length - 1)
    setSavingQuestion(true)
    try {
      const payload = {
        quiz_id: selectedQuizId,
        question_text: qText.trim(),
        options: opts,
        correct_answer_index: idx,
        sort_order: editingQuestionId ? questions.find((x) => x.id === editingQuestionId)?.sort_order ?? 0 : questions.length,
      }
      if (editingQuestionId) {
        const { error } = await supabase.from('quiz_questions').update(payload).eq('id', editingQuestionId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('quiz_questions').insert(payload)
        if (error) throw error
      }
      setQuestionDialogOpen(false)
      if (selectedQuizId) openQuestions(selectedQuizId)
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save question.', variant: 'destructive' })
    } finally {
      setSavingQuestion(false)
    }
  }

  const deleteQuestion = (id: string) => setDeletingQuestionId(id)

  const confirmDeleteQuestion = async () => {
    if (!deletingQuestionId) return
    try {
      const { error } = await supabase.from('quiz_questions').delete().eq('id', deletingQuestionId)
      if (error) throw error
      if (selectedQuizId) openQuestions(selectedQuizId)
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete question.', variant: 'destructive' })
    } finally {
      setDeletingQuestionId(null)
    }
  }

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mentor" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Mentor
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-sm text-slate-600 mt-1">
            Create quizzes and set correct answers. Learners see published quizzes; once they submit an answer it is locked and cannot be changed.
          </p>
        </div>
        <Button onClick={openCreateQuiz} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add quiz
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">
            No quizzes yet. Add a quiz, add questions, and set the correct answer for each. Publish to show to learners.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-3 pl-4 pr-4 align-middle font-medium">Title</th>
                  <th className="py-3 pr-4 align-middle font-medium">Status</th>
                  <th className="py-3 pr-4 align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-4 pl-4 pr-4 align-middle font-medium text-slate-900">{row.title}</td>
                    <td className="py-4 pr-4 align-middle">
                      <Badge variant={row.published ? 'default' : 'secondary'}>
                        {row.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => openQuestions(row.id)}>
                        <ListChecks className="h-4 w-4 mr-1" />
                        Questions
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditQuiz(row)} aria-label="Edit quiz">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => deleteQuiz(row.id)} aria-label="Delete quiz">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuizId ? 'Edit quiz' : 'New quiz'}</DialogTitle>
            <DialogDescription>
              Set title and description. Publish to show the quiz to learners. Then add questions and set correct answers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title</Label>
              <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Week 1 Ethics Quiz" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Brief description for learners" rows={2} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quiz-published-mentor"
                checked={quizPublished}
                onChange={(e) => setQuizPublished(e.target.checked)}
                className="rounded border-slate-300"
              />
              <Label htmlFor="quiz-published-mentor">Published (visible to learners)</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setQuizDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveQuiz} disabled={savingQuiz}>
                {savingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={questionsDialogOpen} onOpenChange={setQuestionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Questions — {selectedQuiz?.title ?? 'Quiz'}</DialogTitle>
            <DialogDescription>
              Add questions and set the correct answer (index). Learners cannot change their answer after submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Button onClick={openAddQuestion} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add question
            </Button>
            {questionsLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading questions…
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No questions yet. Add one and set the correct answer.</p>
            ) : (
              <ul className="space-y-3">
                {questions.map((q, i) => (
                  <li key={q.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{i + 1}. {q.question_text}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Correct: {optionLetter(q.correct_answer_index)}. {Array.isArray(q.options) ? q.options[q.correct_answer_index] : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => openEditQuestion(q)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700" onClick={() => deleteQuestion(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestionId ? 'Edit question' : 'New question'}</DialogTitle>
            <DialogDescription>
              One question per form. Options one per line. Select which option is the correct answer (learners cannot change after submit).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Question text</Label>
              <Input value={qText} onChange={(e) => setQText(e.target.value)} placeholder="e.g. What is the first step in active listening?" className="mt-1" />
            </div>
            <div>
              <Label>Options (one per line; first line = Option 1, etc.)</Label>
              <Textarea value={qOptions} onChange={(e) => setQOptions(e.target.value)} placeholder="Reflect back what you heard\nAsk open questions\nGive advice immediately\nEnd the conversation" rows={4} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label>Correct answer</Label>
              <Select
                value={canPickCorrectAnswer ? String(clampedCorrectIndex) : undefined}
                onValueChange={(v) => setQCorrectIndex(Number(v))}
              >
                <SelectTrigger className="mt-1 w-full" disabled={!canPickCorrectAnswer}>
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {canPickCorrectAnswer ? (
                    qParsedOptions.map((opt, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {optionLetter(i)}. {opt}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__placeholder__" disabled>
                      Add at least 2 options above
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveQuestion} disabled={savingQuestion}>
                {savingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingQuizId} onOpenChange={(open) => { if (!open) setDeletingQuizId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this quiz?</DialogTitle>
            <DialogDescription>All questions and learner attempts will be permanently removed.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingQuizId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteQuiz}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingQuestionId} onOpenChange={(open) => { if (!open) setDeletingQuestionId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove this question?</DialogTitle>
            <DialogDescription>This will permanently remove the question and any recorded answers.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingQuestionId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteQuestion}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
