'use client'

import { useEffect, useState } from 'react'
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
import { Briefcase, Plus, Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react'

type CaseStudyRow = {
  id: string
  title: string
  scenario: string
  difficulty_level: string
  questions: { id: string; question: string; hint?: string }[]
  learning_objectives: string[] | null
  tags: string[] | null
  created_at: string
}

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const

function questionsFromText(text: string): { id: string; question: string; hint?: string }[] {
  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean)
  return lines.map((line, i) => {
    const [question, hint] = line.split('|').map((s) => s.trim())
    return { id: `q${i + 1}`, question: question || line, hint: hint || undefined }
  })
}

function questionsToText(qs: { id: string; question: string; hint?: string }[]): string {
  return (qs || []).map((q) => (q.hint ? `${q.question} | ${q.hint}` : q.question)).join('\n')
}

export default function AdminCaseStudiesPage() {
  const supabase = createClient()
  const [list, setList] = useState<CaseStudyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formScenario, setFormScenario] = useState('')
  const [formDifficulty, setFormDifficulty] = useState<string>('intermediate')
  const [formObjectives, setFormObjectives] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formQuestions, setFormQuestions] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title, scenario, difficulty_level, questions, learning_objectives, tags, created_at')
        .order('title', { ascending: true })
      if (error) throw error
      setList((data ?? []) as CaseStudyRow[])
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setFormTitle('')
    setFormScenario('')
    setFormDifficulty('intermediate')
    setFormObjectives('')
    setFormTags('')
    setFormQuestions('')
    setDialogOpen(true)
  }

  const openEdit = (row: CaseStudyRow) => {
    setEditingId(row.id)
    setFormTitle(row.title)
    setFormScenario(row.scenario)
    setFormDifficulty(row.difficulty_level || 'intermediate')
    setFormObjectives((row.learning_objectives ?? []).join('\n'))
    setFormTags((row.tags ?? []).join(', '))
    setFormQuestions(questionsToText(row.questions || []))
    setDialogOpen(true)
  }

  const save = async () => {
    if (!formTitle.trim() || !formScenario.trim()) return
    setSaving(true)
    try {
      const questions = questionsFromText(formQuestions)
      if (questions.length === 0) {
        alert('Add at least one question (one per line).')
        setSaving(false)
        return
      }
      const payload = {
        title: formTitle.trim(),
        scenario: formScenario.trim(),
        difficulty_level: formDifficulty,
        learning_objectives: formObjectives.split('\n').map((s) => s.trim()).filter(Boolean) || null,
        tags: formTags.split(',').map((s) => s.trim()).filter(Boolean) || null,
        questions,
      }
      if (editingId) {
        const { error } = await supabase.from('case_studies').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('case_studies').insert(payload)
        if (error) throw error
      }
      setDialogOpen(false)
      load()
    } catch (e) {
      console.error(e)
      alert('Failed to save. Check the console.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this case study? Learner responses will be deleted too.')) return
    try {
      const { error } = await supabase.from('case_studies').delete().eq('id', id)
      if (error) throw error
      load()
    } catch (e) {
      console.error(e)
      alert('Failed to delete.')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Case Studies</h1>
          <p className="text-sm text-slate-600 mt-1">
            Create and edit case studies. Learners see them in the Case Study Bank; mentors can view and assign them.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add case study
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : list.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">
            No case studies yet. Add one to show it in the learner Case Study Bank.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Difficulty</th>
                  <th className="pb-2 pr-4 font-medium">Questions</th>
                  <th className="pb-2 pr-4 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{row.title}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="capitalize">{row.difficulty_level}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {(row.questions?.length ?? 0)} questions
                    </td>
                    <td className="py-3 pr-4 flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => remove(row.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit case study' : 'New case study'}</DialogTitle>
            <DialogDescription>
              Learners will see this in the Case Study Bank. Add scenario and questions; optional: learning objectives, tags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Case 1: Student with Depression" className="mt-1" />
            </div>
            <div>
              <Label>Scenario</Label>
              <Textarea value={formScenario} onChange={(e) => setFormScenario(e.target.value)} placeholder="Describe the scenario…" rows={4} className="mt-1" />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={formDifficulty} onValueChange={setFormDifficulty}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Questions (one per line; optional hint after &quot;|&quot;)</Label>
              <Textarea value={formQuestions} onChange={(e) => setFormQuestions(e.target.value)} placeholder="What signs do you notice?&#10;How would you approach? | Think about listening" rows={5} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label>Learning objectives (one per line, optional)</Label>
              <Textarea value={formObjectives} onChange={(e) => setFormObjectives(e.target.value)} placeholder="Recognize signs&#10;Supportive communication" rows={2} className="mt-1" />
            </div>
            <div>
              <Label>Tags (comma-separated, optional)</Label>
              <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="depression, youth, school" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
