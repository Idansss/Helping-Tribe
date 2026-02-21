'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  BookOpen,
  Video,
  GraduationCap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type GradingType =
  | 'assignments'
  | 'ilt-sessions'
  | 'case-studies'
  | 'ethics-quizzes'
  | 'practice-recordings'
  | 'learning-journals'
  | 'final-projects'

type GradingStatus = 'pending' | 'in_review' | 'reviewed'

type GradingItem = {
  id: string
  type: GradingType
  title: string
  learnerName: string
  courseTitle: string
  submittedAt: string
  status: GradingStatus
  score?: number
  feedback?: string
  notes?: string
}

const TYPE_LABELS: Record<GradingType, string> = {
  'assignments': 'Assignments',
  'ilt-sessions': 'ILT sessions',
  'case-studies': 'Case Studies',
  'ethics-quizzes': 'Ethics Quizzes',
  'practice-recordings': 'Counseling Practice Recordings',
  'learning-journals': 'Learning Journals',
  'final-projects': 'Final Projects',
}

const TYPE_ICONS: Record<GradingType, React.ComponentType<{ className?: string }>> =
  {
    'assignments': ClipboardList,
    'ilt-sessions': Video,
    'case-studies': FileText,
    'ethics-quizzes': CheckCircle2,
    'practice-recordings': Video,
    'learning-journals': BookOpen,
    'final-projects': GraduationCap,
  }

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function MentorGradingHubPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<GradingType>('assignments')
  const [items, setItems] = useState<GradingItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | GradingStatus>('all')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [score, setScore] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // ── Load items from DB whenever the active tab changes ────────────────────
  useEffect(() => {
    loadItems(activeTab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  async function loadItems(tab: GradingType) {
    setLoadingItems(true)
    setItems([])
    try {
      if (tab === 'assignments') {
        const { data, error } = await supabase
          .from('assignment_submissions')
          .select('id, submitted_at, graded, grade, feedback, file_url, file_name, user_id, assignment_id, assignments(title, assignment_type), profiles(full_name)')
          .order('submitted_at', { ascending: false })
          .limit(100)
        if (error) throw error
        setItems(
          (data ?? []).map((row: any) => ({
            id: row.id,
            type: 'assignments',
            title: row.file_name ?? row.assignments?.title ?? 'Assignment Submission',
            learnerName: row.profiles?.full_name ?? 'Unknown Learner',
            courseTitle: row.assignments?.title ?? '—',
            submittedAt: row.submitted_at ?? row.created_at,
            status: row.graded ? 'reviewed' : 'pending',
            score: row.grade ?? undefined,
            feedback: row.feedback ?? undefined,
          }))
        )
      } else if (tab === 'learning-journals') {
        const { data, error } = await supabase
          .from('learning_journals')
          .select('id, content, updated_at, created_at, user_id, module_id, modules(title), profiles(full_name)')
          .order('updated_at', { ascending: false })
          .limit(100)
        if (error) throw error
        setItems(
          (data ?? []).map((row: any) => ({
            id: row.id,
            type: 'learning-journals',
            title: `Journal — ${row.modules?.title ?? 'Module'}`,
            learnerName: row.profiles?.full_name ?? 'Unknown Learner',
            courseTitle: row.modules?.title ?? '—',
            submittedAt: row.updated_at ?? row.created_at,
            status: 'pending',
          }))
        )
      } else if (tab === 'final-projects') {
        const { data, error } = await supabase
          .from('final_exam_submissions')
          .select('id, file_url, file_name, submitted_at, graded, grade, feedback, user_id, profiles(full_name)')
          .order('submitted_at', { ascending: false })
          .limit(100)
        if (error) throw error
        setItems(
          (data ?? []).map((row: any) => ({
            id: row.id,
            type: 'final-projects',
            title: row.file_name ?? 'Final Project',
            learnerName: row.profiles?.full_name ?? 'Unknown Learner',
            courseTitle: 'Final Project',
            submittedAt: row.submitted_at,
            status: row.graded ? 'reviewed' : 'pending',
            score: row.grade ?? undefined,
            feedback: row.feedback ?? undefined,
          }))
        )
      } else if (tab === 'ethics-quizzes') {
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select('id, score, passed, completed_at, user_id, quiz_id, quizzes(title), profiles(full_name)')
          .order('completed_at', { ascending: false })
          .limit(100)
        if (error) throw error
        setItems(
          (data ?? []).map((row: any) => ({
            id: row.id,
            type: 'ethics-quizzes',
            title: row.quizzes?.title ?? 'Quiz Attempt',
            learnerName: row.profiles?.full_name ?? 'Unknown Learner',
            courseTitle: row.quizzes?.title ?? '—',
            submittedAt: row.completed_at,
            status: 'reviewed',
            score: row.score ?? undefined,
          }))
        )
      } else {
        // ilt-sessions, case-studies, practice-recordings — show empty for now
        setItems([])
      }
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to load submissions.', variant: 'destructive' })
    } finally {
      setLoadingItems(false)
    }
  }

  // ── Persist grade + feedback to the correct table ─────────────────────────
  async function persistReview(item: GradingItem, newScore: number | undefined, newFeedback: string) {
    if (item.type === 'assignments') {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({ graded: true, grade: newScore ?? null, feedback: newFeedback || null })
        .eq('id', item.id)
      if (error) throw error
    } else if (item.type === 'final-projects') {
      const { error } = await supabase
        .from('final_exam_submissions')
        .update({ graded: true, grade: newScore ?? null, feedback: newFeedback || null })
        .eq('id', item.id)
      if (error) throw error
    }
    // journal / quiz / ilt / case-study — no dedicated grade column yet; optimistic only
  }

  const countsByType = useMemo(() => {
    const counts: Record<GradingType, { total: number; pending: number }> = {
      'assignments': { total: 0, pending: 0 },
      'ilt-sessions': { total: 0, pending: 0 },
      'case-studies': { total: 0, pending: 0 },
      'ethics-quizzes': { total: 0, pending: 0 },
      'practice-recordings': { total: 0, pending: 0 },
      'learning-journals': { total: 0, pending: 0 },
      'final-projects': { total: 0, pending: 0 },
    }
    for (const it of items) {
      counts[it.type].total += 1
      if (it.status !== 'reviewed') counts[it.type].pending += 1
    }
    return counts
  }, [items])

  const filtered = useMemo(() => {
    return items
      .filter((it) => it.type === activeTab)
      .filter((it) => (statusFilter === 'all' ? true : it.status === statusFilter))
      .filter((it) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (
          it.title.toLowerCase().includes(q) ||
          it.learnerName.toLowerCase().includes(q) ||
          it.courseTitle.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))
  }, [items, activeTab, query, statusFilter])

  const selected = selectedId ? items.find((i) => i.id === selectedId) : null

  function openReview(item: GradingItem) {
    setSelectedId(item.id)
    setReviewOpen(true)
    setScore(item.score != null ? String(item.score) : '')
    setFeedback(item.feedback ?? '')
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: 'in_review' } : p))
    )
  }

  async function markReviewed() {
    if (!selectedId) return
    const parsedScore =
      score.trim().length === 0 ? undefined : Math.max(0, Math.min(100, Number(score)))
    const finalScore = Number.isFinite(parsedScore as number) ? (parsedScore as number) : undefined
    const finalFeedback = feedback.trim()
    const item = items.find((i) => i.id === selectedId)
    setSaving(true)
    try {
      if (item) await persistReview(item, finalScore, finalFeedback)
      setItems((prev) =>
        prev.map((p) =>
          p.id === selectedId
            ? { ...p, status: 'reviewed', score: finalScore, feedback: finalFeedback }
            : p
        )
      )
      setReviewOpen(false)
      toast({ title: 'Submission marked as reviewed.' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save review.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function resetFilters() {
    setQuery('')
    setStatusFilter('all')
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Grading Hub
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Central place to review case studies, ethics quizzes, practice
              recordings, journals and final projects.
            </p>
          </div>
        </div>

        <Card className="p-4 border-[#e2e8f0]">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GradingType)}>
            <TabsList className="flex flex-nowrap md:flex-wrap justify-start gap-2 bg-slate-50 rounded-lg p-2 overflow-x-auto md:overflow-visible mb-4">
              {(Object.keys(TYPE_LABELS) as GradingType[]).map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="text-xs px-3 py-1.5 whitespace-nowrap"
                >
                  <span className="mr-2">{TYPE_LABELS[key]}</span>
                  {countsByType[key].pending > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-[10px] h-5 min-w-5 px-1">
                      {countsByType[key].pending}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search learner, course, title..."
                  className="pl-8 h-9 text-sm border-[#e2e8f0]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="h-9 w-40 text-xs border-[#e2e8f0]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In review</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs border-[#e2e8f0]"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>

            <TabsContent value={activeTab} className="pt-4">
              {loadingItems ? (
                <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading submissions…</span>
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="Nothing available to grade yet"
                  description="When learners submit work, it will appear here for your review and grading."
                  icon={<ClipboardList className="h-4 w-4" />}
                />
              ) : (
                <div className="space-y-3">
                  {filtered.map((it) => {
                    const Icon = TYPE_ICONS[it.type]
                    const statusBadge =
                      it.status === 'reviewed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : it.status === 'in_review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                    const statusText =
                      it.status === 'reviewed'
                        ? 'Reviewed'
                        : it.status === 'in_review'
                          ? 'In review'
                          : 'Pending'
                    return (
                      <div
                        key={it.id}
                        className="rounded-md border border-[#e2e8f0] bg-white p-4 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                              <Icon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {it.title}
                                </p>
                                <Badge variant="outline" className={`text-[10px] ${statusBadge}`}>
                                  {statusText}
                                </Badge>
                                {it.status === 'reviewed' && typeof it.score === 'number' && (
                                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-[10px]">
                                    Score: {it.score}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                <span className="font-medium">{it.learnerName}</span> •{' '}
                                {it.courseTitle}
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Submitted {formatDateTime(it.submittedAt)}</span>
                              </div>
                              {it.notes && (
                                <p className="mt-2 text-[11px] text-slate-500">
                                  <span className="font-medium text-slate-600">Notes:</span>{' '}
                                  {it.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-xs border-[#e2e8f0]"
                              onClick={() => openReview(it)}
                            >
                              {it.status === 'reviewed' ? 'View' : 'Review'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <Dialog
          open={reviewOpen}
          onOpenChange={(open) => {
            setReviewOpen(open)
            if (!open) setSelectedId(null)
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review submission</DialogTitle>
              <DialogDescription>
                Add score + feedback, then mark as reviewed.
              </DialogDescription>
            </DialogHeader>

            {selected ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="p-3 border-[#e2e8f0]">
                    <p className="text-[11px] text-slate-500">Learner</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selected.learnerName}
                    </p>
                  </Card>
                  <Card className="p-3 border-[#e2e8f0]">
                    <p className="text-[11px] text-slate-500">Course</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selected.courseTitle}
                    </p>
                  </Card>
                  <Card className="p-3 border-[#e2e8f0] md:col-span-2">
                    <p className="text-[11px] text-slate-500">Submission</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selected.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Type: {TYPE_LABELS[selected.type]} • Submitted{' '}
                      {formatDateTime(selected.submittedAt)}
                    </p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="score" className="text-xs text-slate-700">
                      Score (0–100)
                    </Label>
                    <Input
                      id="score"
                      inputMode="numeric"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="e.g. 85"
                      className="h-9 text-sm border-[#e2e8f0]"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label htmlFor="feedback" className="text-xs text-slate-700">
                      Feedback
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write feedback the learner will see…"
                      className="min-h-[90px] text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReviewOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-800 text-white"
                    onClick={markReviewed}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark reviewed'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">No submission selected.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}

