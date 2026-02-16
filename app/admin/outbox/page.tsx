'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type OutboxRow = {
  id: string
  recipient_email: string
  subject: string
  body: string
  kind: string
  applicant_id: string | null
  student_id: string | null
  created_at: string
}

export default function AdminOutboxPage() {
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<OutboxRow[]>([])

  async function loadOutbox() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('email_outbox')
        .select('id, recipient_email, subject, body, kind, applicant_id, student_id, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setRows((data ?? []) as OutboxRow[])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load outbox',
        description: error?.message || 'Error',
      })
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOutbox()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Email outbox</h1>
          <p className="text-sm text-slate-600">
            Simulated outbound emails for approvals and set-password links.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadOutbox} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="border-slate-200 bg-white p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading outbox...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">No outbox emails yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <article key={row.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.kind}</p>
                  <p className="text-xs text-slate-500">{new Date(row.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-900">{row.subject}</p>
                <p className="mt-1 text-xs text-slate-600">To: {row.recipient_email}</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-700">
                  {row.body}
                </pre>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
