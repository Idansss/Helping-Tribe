'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Download, Loader2 } from 'lucide-react'
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

  useEffect(() => {
    supabase
      .from('resource_documents')
      .select('*')
      .order('week_number', { ascending: true })
      .then(({ data }) => {
        setDocs((data ?? []) as ResourceDoc[])
        setLoading(false)
      })
  }, [supabase])

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
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-teal-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
              <p className="text-xs text-slate-500">
                Week {doc.week_number}
                {doc.description ? ` · ${doc.description}` : ''}
              </p>
            </div>
          </div>
          {doc.file_url ? (
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
      ))}
    </div>
  )
}
