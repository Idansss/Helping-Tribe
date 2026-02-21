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
import { CalendarDays, Plus, Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

type EventRow = {
  id: string
  module_id: string | null
  event_type: string
  scheduled_date: string | null
  title: string
  description: string | null
  meeting_link: string | null
  week_number: number | null
  created_at: string
}

const EVENT_TYPES = [
  { value: 'discussion_prompt', label: 'Discussion' },
  { value: 'peer_circle', label: 'Peer Circle' },
  { value: 'facilitator_session', label: 'Facilitator Session' },
  { value: 'wrap_up', label: 'Wrap-Up' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment_due', label: 'Assignment Due' },
  { value: 'info_session', label: 'Info Session' },
  { value: 'orientation', label: 'Orientation' },
] as const

export default function AdminCalendarPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [list, setList] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState<string>('facilitator_session')
  const [formDate, setFormDate] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formMeetingLink, setFormMeetingLink] = useState('')
  const [formWeek, setFormWeek] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('weekly_events')
        .select('id, module_id, event_type, scheduled_date, title, description, meeting_link, week_number, created_at')
        .order('scheduled_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      setList((data ?? []) as EventRow[])
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
    setFormType('facilitator_session')
    setFormDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    setFormDescription('')
    setFormMeetingLink('')
    setFormWeek('')
    setDialogOpen(true)
  }

  const openEdit = (row: EventRow) => {
    setEditingId(row.id)
    setFormTitle(row.title)
    setFormType(row.event_type)
    setFormDate(row.scheduled_date ? format(new Date(row.scheduled_date), "yyyy-MM-dd'T'HH:mm") : '')
    setFormDescription(row.description || '')
    setFormMeetingLink(row.meeting_link || '')
    setFormWeek(row.week_number != null ? String(row.week_number) : '')
    setDialogOpen(true)
  }

  const save = async () => {
    if (!formTitle.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: formTitle.trim(),
        event_type: formType,
        scheduled_date: formDate ? new Date(formDate).toISOString() : null,
        description: formDescription.trim() || null,
        meeting_link: formMeetingLink.trim() || null,
        week_number: formWeek.trim() ? parseInt(formWeek, 10) : null,
      }
      if (editingId) {
        const { error } = await supabase.from('weekly_events').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('weekly_events').insert(payload)
        if (error) throw error
      }
      setDialogOpen(false)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save event.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const remove = (id: string) => setDeletingId(id)

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      const { error } = await supabase.from('weekly_events').delete().eq('id', deletingId)
      if (error) throw error
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete event.', variant: 'destructive' })
    } finally {
      setDeletingId(null)
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
          <h1 className="text-2xl font-bold text-slate-900">Calendar (Training schedule)</h1>
          <p className="text-sm text-slate-600 mt-1">
            Add and edit weekly events. Learners and mentors see this schedule on their Calendar pages.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add event
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
            No events yet. Add events to show them on the learner and mentor calendars.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Date / time</th>
                  <th className="pb-2 pr-4 font-medium">Week</th>
                  <th className="pb-2 pr-4 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{row.title}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="text-xs capitalize">{row.event_type.replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {row.scheduled_date ? format(new Date(row.scheduled_date), 'PPp') : '—'}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{row.week_number != null ? row.week_number : '—'}</td>
                    <td className="py-3 pr-4 flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)} aria-label="Edit">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => remove(row.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit event' : 'New event'}</DialogTitle>
            <DialogDescription>
              This event will appear on learner and mentor calendars.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Peer Learning Circle" className="mt-1" />
            </div>
            <div>
              <Label>Event type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date & time (optional)</Label>
              <Input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Week number (optional, 0–9)</Label>
              <Input value={formWeek} onChange={(e) => setFormWeek(e.target.value)} placeholder="e.g. 1" className="mt-1 w-24" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Short description…" rows={2} className="mt-1" />
            </div>
            <div>
              <Label>Meeting link (optional)</Label>
              <Input value={formMeetingLink} onChange={(e) => setFormMeetingLink(e.target.value)} placeholder="https://…" className="mt-1" />
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

      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>This calendar event will be permanently removed.</DialogDescription>
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
