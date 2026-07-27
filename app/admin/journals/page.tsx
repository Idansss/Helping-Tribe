'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, FileText, Loader2, User, ArrowLeft } from 'lucide-react'

interface JournalEntry {
  id: string
  user_id: string
  module_id: string
  content: string
  created_at: string
  updated_at: string
  modules: { title: string; week_number: number } | null
}

type JournalEntryQueryRow = Omit<JournalEntry, 'modules'> & {
  modules: { title: string; week_number: number } | { title: string; week_number: number }[] | null
}

interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
}

/** Split journal text on markdown-style horizontal rules (full line of ---, ***, or ___). */
function splitJournalSections(raw: string): string[] {
  return raw.split(/\r?\n\s*[-*_]{3,}\s*\r?\n/)
}

/** Turn `**bold**` segments into <strong>; leave everything else as text. */
function formatInlineBold(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(<span key={key++}>{text.slice(last, m.index)}</span>)
    }
    nodes.push(
      <strong key={key++} className="font-semibold text-slate-900">
        {m[1]}
      </strong>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) {
    nodes.push(<span key={key++}>{text.slice(last)}</span>)
  }
  return nodes.length > 0 ? nodes : text
}

function JournalReflectionBody({ content }: { content: string }) {
  const trimmed = content.trim()
  if (!trimmed) {
    return <span className="text-slate-400">—</span>
  }
  const sections = splitJournalSections(trimmed).map((s) => s.trim()).filter(Boolean)

  return (
    <div className="space-y-6">
      {sections.map((section, si) => {
        const paragraphs = section.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
        return (
          <React.Fragment key={si}>
            {si > 0 && <hr className="border-slate-200" />}
            <div className="space-y-4">
              {paragraphs.map((para, pi) => (
                <div
                  key={pi}
                  className="text-sm leading-relaxed text-slate-700 [&_strong]:text-slate-900"
                >
                  {para.split('\n').map((line, li) => (
                    <span key={li} className="block min-h-[1.25em]">
                      {formatInlineBold(line)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default function AdminJournalsPage() {
  const supabase = createClient()
  const [entries, setEntries] = React.useState<JournalEntry[]>([])
  const [profiles, setProfiles] = React.useState<Record<string, ProfileRow>>({})
  const [loading, setLoading] = React.useState(true)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const loadJournals = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data: journalData, error: journalError } = await supabase
        .from('learning_journals')
        .select('id, user_id, module_id, content, created_at, updated_at, modules(title, week_number)')
        .order('updated_at', { ascending: false })

      if (journalError) throw journalError
      const list = ((journalData || []) as JournalEntryQueryRow[]).map((entry) => ({
        ...entry,
        modules: Array.isArray(entry.modules) ? (entry.modules[0] ?? null) : entry.modules,
      }))
      setEntries(list)

      const userIds = [...new Set(list.map((e) => e.user_id))]
      if (userIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
        if (!profileError && profileData) {
          const byId: Record<string, ProfileRow> = {}
          ;(profileData as ProfileRow[]).forEach((p) => {
            byId[p.id] = p
          })
          setProfiles(byId)
        }
      }
    } catch (err) {
      console.error('Error loading journals:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  React.useEffect(() => {
    loadJournals()
  }, [loadJournals])

  const formatDate = (s: string) => {
    try {
      const d = new Date(s)
      return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
    } catch {
      return s
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-[var(--talent-primary-dark)]">
          Learning journals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View learner reflections and notes submitted in the Learning Journal.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Journal entries</h2>
          <Badge variant="outline">{entries.length} entries</Badge>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading journals…
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6">
            No journal entries yet. Learners will appear here once they save reflections from the Learning Journal.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const profile = profiles[entry.user_id]
              const name = profile?.full_name || profile?.email || 'Learner'
              const moduleTitle = entry.modules?.title ?? 'Module'
              const week = entry.modules?.week_number ?? null
              const isExpanded = expandedId === entry.id
              return (
                <div
                  key={entry.id}
                  className="overflow-hidden rounded-lg border border-border bg-muted/40"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 p-4 text-left text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <User className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="size-3" aria-hidden="true" />
                        {week != null ? `Week ${week}: ` : ''}
                        {moduleTitle}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(entry.updated_at)}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="size-3.5" aria-hidden="true" />
                        Reflection
                      </div>
                      <div className="max-h-80 overflow-y-auto rounded-md border border-border bg-background p-4 shadow-sm">
                        <JournalReflectionBody content={entry.content || ''} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
