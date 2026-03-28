'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Download, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ResourceDoc = {
  id: string
  week_number: number
  title: string
  description: string | null
  file_url: string | null
  file_name: string | null
}

export function WeeklyDocuments() {
  const supabase = createClient()
  const [docs, setDocs] = useState<ResourceDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [progressMap, setProgressMap] = useState<Record<number, number>>({})

  useEffect(() => {
    async function load() {
      const [{ data: docsData }, { data: { user } }] = await Promise.all([
        supabase.from('resource_documents').select('*').order('week_number', { ascending: true }),
        supabase.auth.getUser(),
      ])

      setDocs((docsData ?? []) as ResourceDoc[])

      if (user) {
        const { data: modData } = await supabase
          .from('modules')
          .select('id, week_number')
          .order('week_number', { ascending: true })

        if (modData?.length) {
          const { data: progressData } = await supabase
            .from('module_progress')
            .select('module_id, progress, completed, is_completed')
            .eq('user_id', user.id)

          const byModule: Record<string, number> = {}
          ;(progressData ?? []).forEach((p: any) => {
            byModule[p.module_id] = p.completed || p.is_completed ? 100 : (p.progress ?? 0)
          })

          const byWeek: Record<number, number> = {}
          modData.forEach((m: any) => {
            byWeek[m.week_number] = byModule[m.id] ?? 0
          })
          setProgressMap(byWeek)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  function isLocked(week: number): boolean {
    if (week <= 1) return false
    return (progressMap[week - 1] ?? 0) < 100
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading documents…
      </div>
    )
  }

  if (docs.length === 0) {
    return <p className="text-sm text-slate-500 py-4">No documents available yet. Check back soon.</p>
  }

  return (
    <div className="grid gap-3">
      {docs.map((doc) => {
        const locked = isLocked(doc.week_number)
        return (
          <div
            key={doc.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              locked
                ? 'border-slate-200 bg-slate-50 opacity-60'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${locked ? 'bg-slate-200' : 'bg-teal-100'}`}>
                {locked
                  ? <Lock className="h-4 w-4 text-slate-400" />
                  : <FileText className="h-4 w-4 text-teal-700" />
                }
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${locked ? 'text-slate-400' : 'text-slate-900'}`}>
                  {doc.title}
                </p>
                <p className="text-xs text-slate-500">
                  Week {doc.week_number}
                  {locked ? ` · Complete Week ${doc.week_number - 1} to unlock` : doc.description ? ` · ${doc.description}` : ''}
                </p>
              </div>
            </div>
            {locked ? (
              <Lock className="h-4 w-4 text-slate-300 flex-shrink-0 ml-3" />
            ) : doc.file_url ? (
              <Button size="sm" variant="outline" asChild className="flex-shrink-0 ml-3">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Open
                </a>
              </Button>
            ) : (
              <span className="text-xs text-slate-400 flex-shrink-0 ml-3">No file yet</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
