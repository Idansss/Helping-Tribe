'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Search, Loader2, Tag, ChevronRight } from 'lucide-react'

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

const categoryColors: Record<string, string> = {
  general: 'bg-slate-100 text-slate-700 border-slate-300',
  ethics: 'bg-purple-100 text-purple-700 border-purple-300',
  techniques: 'bg-teal-100 text-teal-700 border-teal-300',
  self_care: 'bg-green-100 text-green-700 border-green-300',
  assessment: 'bg-blue-100 text-blue-700 border-blue-300',
  crisis: 'bg-red-100 text-red-700 border-red-300',
  group_work: 'bg-orange-100 text-orange-700 border-orange-300',
  documentation: 'bg-yellow-100 text-yellow-700 border-yellow-300',
}

export default function MentorCpdSnippetsPage() {
  const supabase = createClient()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selected, setSelected] = useState<Snippet | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('cpd_snippets')
          .select('id, title, content, category, tags, created_at')
          .order('category')
          .order('title')
        if (error) throw error
        setSnippets((data ?? []) as Snippet[])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = snippets.filter((s) => {
    const q = search.toLowerCase()
    const matchesSearch = !search || s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || (s.tags ?? []).some((t) => t.toLowerCase().includes(q))
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (value: string) => CATEGORIES.find((c) => c.value === value)?.label ?? value

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-teal-600" />
          CPD Snippets
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Quick-reference cards for your Continuing Professional Development.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search snippets…"
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

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-500">
          {snippets.length === 0 ? 'No CPD snippets have been added yet.' : 'No snippets match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((snippet) => (
            <Card
              key={snippet.id}
              className="p-4 cursor-pointer hover:shadow-md transition-all border-l-4 border-l-teal-500 group"
              onClick={() => setSelected(snippet)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-sm leading-snug flex-1">{snippet.title}</h3>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 mt-0.5" />
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] mb-2 ${categoryColors[snippet.category] ?? categoryColors.general}`}
              >
                {getCategoryLabel(snippet.category)}
              </Badge>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{snippet.content}</p>
              {(snippet.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  <Tag className="h-3 w-3 text-slate-400 mt-0.5" />
                  {snippet.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-500">{tag}</span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="leading-snug">{selected?.title}</DialogTitle>
            {selected && (
              <Badge
                variant="outline"
                className={`w-fit text-xs mt-1 ${categoryColors[selected.category] ?? categoryColors.general}`}
              >
                {getCategoryLabel(selected.category)}
              </Badge>
            )}
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.content}</p>
              {(selected.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs text-slate-600">{tag}</Badge>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
