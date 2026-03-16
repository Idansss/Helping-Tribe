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
import { GraduationCap, Plus, Pencil, Trash2, ArrowLeft, Loader2, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type Snippet = {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'ethics', label: 'Ethics & Boundaries' },
  { value: 'techniques', label: 'Counseling Techniques' },
  { value: 'self_care', label: 'Self-Care & Supervision' },
  { value: 'assessment', label: 'Assessment & Diagnosis' },
  { value: 'crisis', label: 'Crisis Intervention' },
  { value: 'group_work', label: 'Group Work' },
  { value: 'documentation', label: 'Documentation' },
]

export default function AdminCpdSnippetsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [list, setList] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState('general')
  const [formTags, setFormTags] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cpd_snippets')
        .select('id, title, content, category, tags, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setList((data ?? []) as Snippet[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingId(null)
    setFormTitle('')
    setFormContent('')
    setFormCategory('general')
    setFormTags('')
    setDialogOpen(true)
  }

  const openEdit = (row: Snippet) => {
    setEditingId(row.id)
    setFormTitle(row.title)
    setFormContent(row.content)
    setFormCategory(row.category)
    setFormTags((row.tags ?? []).join(', '))
    setDialogOpen(true)
  }

  const save = async () => {
    if (!formTitle.trim() || !formContent.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const tags = formTags.split(',').map((t) => t.trim()).filter(Boolean)
      const payload = {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        tags,
        updated_at: new Date().toISOString(),
      }
      if (editingId) {
        const { error } = await supabase.from('cpd_snippets').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('cpd_snippets').insert({ ...payload, created_by: user?.id })
        if (error) throw error
      }
      setDialogOpen(false)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save snippet.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      const { error } = await supabase.from('cpd_snippets').delete().eq('id', deletingId)
      if (error) throw error
      setDeletingId(null)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete snippet.', variant: 'destructive' })
    }
  }

  const filtered = list.filter((s) => {
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (value: string) => CATEGORIES.find((c) => c.value === value)?.label ?? value

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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-teal-600" />
            CPD Snippets
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Short learning cards for Continuing Professional Development. Visible to mentors and learners.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add snippet
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4 border-slate-200">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">
            {list.length === 0 ? 'No snippets yet. Add your first CPD snippet.' : 'No snippets match your search.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium">Tags</th>
                  <th className="pb-2 pr-4 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900 max-w-xs">
                      <div>{row.title}</div>
                      <div className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">{row.content}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="text-xs capitalize bg-teal-50 text-teal-700 border-teal-200">
                        {getCategoryLabel(row.category)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {(row.tags ?? []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] text-slate-600">{tag}</Badge>
                        ))}
                        {(row.tags ?? []).length > 3 && (
                          <Badge variant="outline" className="text-[10px] text-slate-400">+{row.tags.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => setDeletingId(row.id)} aria-label="Delete">
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit snippet' : 'New CPD snippet'}</DialogTitle>
            <DialogDescription>
              Snippets appear as quick-reference cards for mentors and learners.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Active Listening — key points" className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write the snippet content…"
                rows={6}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tags (comma-separated, optional)</Label>
              <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="e.g. empathy, listening, week 3" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this snippet?</DialogTitle>
            <DialogDescription>This CPD snippet will be permanently removed.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
