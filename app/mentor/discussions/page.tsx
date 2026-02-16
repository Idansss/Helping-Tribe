'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { createClient } from '@/lib/supabase/client'
import { DiscussionForum } from '@/components/lms/DiscussionForum'
import {
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

type ModuleOption = { id: string; title: string; week: number }

type PromptRow = {
  id: string
  module_id: string
  prompt_text: string
  posted_at: string
  sort_order: number
  module?: { week_number: number; title: string }
  response_count?: number
}

type PromptQueryRow = Omit<PromptRow, 'module' | 'sort_order'> & {
  sort_order?: number | null
  module?: { week_number: number; title: string } | { week_number: number; title: string }[] | null
}

export default function MentorDiscussionsPage() {
  const supabase = createClient()
  const [modules, setModules] = useState<ModuleOption[]>([])
  const [prompts, setPrompts] = useState<PromptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formModuleId, setFormModuleId] = useState<string>('')
  const [formPromptText, setFormPromptText] = useState('')
  const [formSortOrder, setFormSortOrder] = useState<string>('')

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('id, title, week_number')
        .order('week_number', { ascending: true })
      if (error) throw error
      setModules(
        (data || []).map((r: { id: string; title: string; week_number: number }) => ({
          id: r.id,
          title: r.title,
          week: r.week_number,
        }))
      )
    } catch (e) {
      console.error(e)
      setModules([])
    }
  }

  const loadPrompts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('discussion_prompts')
        .select(`
          id,
          module_id,
          prompt_text,
          posted_at,
          sort_order,
          module:modules(week_number, title)
        `)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('posted_at', { ascending: false })

      if (error) throw error
      const rows = (data ?? []) as PromptQueryRow[]
      const normalizedRows: PromptRow[] = rows.map((p) => ({
        ...p,
        sort_order: p.sort_order ?? 0,
        module: Array.isArray(p.module) ? (p.module[0] ?? undefined) : (p.module ?? undefined),
      }))
      const withCounts = await Promise.all(
        normalizedRows.map(async (p) => {
          const { count } = await supabase
            .from('discussion_responses')
            .select('*', { count: 'exact', head: true })
            .eq('prompt_id', p.id)
          return { ...p, response_count: count ?? 0 }
        })
      )
      setPrompts(withCounts)
    } catch (e) {
      console.error(e)
      setPrompts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModules()
  }, [])

  useEffect(() => {
    loadPrompts()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setFormModuleId(modules[0]?.id ?? '')
    setFormPromptText('')
    setFormSortOrder(String(prompts.length))
    setDialogOpen(true)
  }

  const openEdit = (row: PromptRow) => {
    setEditingId(row.id)
    setFormModuleId(row.module_id)
    setFormPromptText(row.prompt_text)
    setFormSortOrder(String(row.sort_order ?? 0))
    setDialogOpen(true)
  }

  const save = async () => {
    if (!formPromptText.trim()) return
    const moduleId = formModuleId || modules[0]?.id
    if (!moduleId) {
      alert('Select a module.')
      return
    }
    setSaving(true)
    try {
      const sortOrder = formSortOrder.trim() ? parseInt(formSortOrder, 10) : 0
      const payload = {
        module_id: moduleId,
        prompt_text: formPromptText.trim(),
        sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      }
      if (editingId) {
        const { error } = await supabase.from('discussion_prompts').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('discussion_prompts').insert(payload)
        if (error) throw error
      }
      setDialogOpen(false)
      loadPrompts()
    } catch (e) {
      console.error(e)
      alert('Failed to save. Run supabase/scripts/create_discussion_prompts_admin_policies.sql if you see a policy error.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this discussion prompt? All replies will be deleted.')) return
    try {
      const { error } = await supabase.from('discussion_prompts').delete().eq('id', id)
      if (error) throw error
      loadPrompts()
    } catch (e) {
      console.error(e)
      alert('Failed to delete.')
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= prompts.length) return
    const a = prompts[index]
    const b = prompts[targetIndex]
    const orderA = a.sort_order ?? 0
    const orderB = b.sort_order ?? 0
    try {
      await supabase.from('discussion_prompts').update({ sort_order: orderB }).eq('id', a.id)
      await supabase.from('discussion_prompts').update({ sort_order: orderA }).eq('id', b.id)
      loadPrompts()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mentor" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-teal-600" />
            Discussions
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage discussion prompts by module and view forum activity. Same prompts learners see; add or edit here so the forum is never empty.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add prompt
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-base">Discussion prompts</CardTitle>
          <CardDescription>
            Link each prompt to a module and set order. Lower order appears first in the forum.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : prompts.length === 0 ? (
            <p className="text-sm text-slate-500 py-6">
              No discussion prompts yet. Add one to show it on the learner forum.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 pr-4 font-medium w-16">Order</th>
                    <th className="pb-2 pr-4 font-medium">Module</th>
                    <th className="pb-2 pr-4 font-medium">Prompt</th>
                    <th className="pb-2 pr-4 font-medium w-20">Replies</th>
                    <th className="pb-2 pr-4 font-medium w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((row, index) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveOrder(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveOrder(index, 'down')}
                            disabled={index === prompts.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <span className="text-slate-600 w-6">{row.sort_order ?? 0}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {row.module
                          ? `Week ${row.module.week_number}: ${row.module.title}`
                          : row.module_id}
                      </td>
                      <td className="py-3 pr-4 max-w-xs">
                        <span className="line-clamp-2 text-slate-900">{row.prompt_text}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{row.response_count ?? 0}</td>
                      <td className="py-3 pr-4 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => remove(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/discussions/${row.module_id}`} target="_blank" rel="noopener noreferrer">
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Forum preview</CardTitle>
          <CardDescription>
            How learners see the discussion forum.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiscussionForum />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit discussion prompt' : 'New discussion prompt'}</DialogTitle>
            <DialogDescription>
              Link the prompt to a module. Learners will see it on the forum and can reply in the thread.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Module</Label>
              <Select value={formModuleId} onValueChange={setFormModuleId}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      Week {m.week}: {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prompt text</Label>
              <Textarea
                value={formPromptText}
                onChange={(e) => setFormPromptText(e.target.value)}
                placeholder="e.g. What did you find most challenging about this week's topic?"
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Sort order (lower = first in list)</Label>
              <Input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(e.target.value)}
                placeholder="0"
                className="mt-1 w-24"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
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
