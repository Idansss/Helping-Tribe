'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type Applicant = {
  id: string
  full_name_certificate: string
  phone_whatsapp: string
  email: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

export default function ApplicantsPage() {
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('applicants')
      .select('id, full_name_certificate, phone_whatsapp, email, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to load applicants', description: error.message })
      setApplicants([])
    } else {
      setApplicants((data ?? []) as Applicant[])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function approve(applicantId: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/admin/applicants/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Failed to approve applicant')
      }

      const fullUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${json.setPasswordUrl}`
          : json.setPasswordUrl

      try {
        await navigator.clipboard.writeText(fullUrl)
        toast({
          title: 'Approved',
          description: `Matric: ${json.matricNumber}. Set-password link copied to clipboard.`,
        })
      } catch {
        toast({
          title: 'Approved',
          description: `Matric: ${json.matricNumber}. Set-password link: ${fullUrl}`,
        })
      }

      await load()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Approve failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  async function reject(applicantId: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/admin/applicants/reject', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to reject applicant')
      toast({ title: 'Rejected', description: 'Applicant marked as rejected.' })
      await load()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Reject failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  const pending = applicants.filter((a) => a.status === 'PENDING')
  const processed = applicants.filter((a) => a.status !== 'PENDING')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Applicants</h1>
        <p className="text-sm text-slate-600">
          Review applications, approve to generate a matric number + set-password link.
        </p>
      </div>

      <Card className="p-4 border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-900">Pending</div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading…</div>
        ) : pending.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No pending applicants.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {a.full_name_certificate}
                    </div>
                    <div className="text-xs text-slate-600">
                      {a.phone_whatsapp} • {a.email}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Submitted: {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => approve(a.id)}
                      disabled={busyId === a.id}
                    >
                      {busyId === a.id ? 'Approving…' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reject(a.id)}
                      disabled={busyId === a.id}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 border-slate-200 bg-white">
        <div className="text-sm font-medium text-slate-900">Processed</div>
        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading…</div>
        ) : processed.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No processed applicants yet.</div>
        ) : (
          <div className="mt-4 space-y-2">
            {processed.slice(0, 20).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 truncate">{a.full_name_certificate}</span>
                <span className="text-xs text-slate-500">{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

