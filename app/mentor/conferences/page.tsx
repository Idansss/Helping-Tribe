'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/admin/EmptyState'
import {
  CalendarDays,
  Search,
  Edit2,
  Trash2,
  Copy,
  MoreVertical,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Download,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

type Conference = {
  id: string
  mentor_id: string
  title: string
  host: string
  conference_date: string | null  // YYYY-MM-DD
  conference_time: string | null  // HH:MM
  duration_mins: number
  location: string
  notes: string | null
  meeting_link: string | null
  created_at: string
}

const formatDateDisplay = (dateStr: string | null) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getConferenceStatus = (date: string | null, time: string | null): 'upcoming' | 'past' | 'ongoing' => {
  if (!date || !time) return 'upcoming'
  try {
    const confDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const endTime = new Date(confDateTime.getTime() + 60 * 60 * 1000)
    if (now < confDateTime) return 'upcoming'
    if (now > endTime) return 'past'
    return 'ongoing'
  } catch {
    return 'upcoming'
  }
}

export default function MentorConferencesPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [bulkDeletePending, setBulkDeletePending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null)
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration'>('date')
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})

  const [title, setTitle] = useState('')
  const [host, setHost] = useState('Instructor')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMins, setDurationMins] = useState('60')
  const [location, setLocation] = useState('Zoom')
  const [notes, setNotes] = useState('')
  const [meetingLink, setMeetingLink] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mentor_conferences')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setConferences((data ?? []) as Conference[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setTitle('')
    setHost('Instructor')
    setDate('')
    setTime('')
    setDurationMins('60')
    setLocation('Zoom')
    setNotes('')
    setMeetingLink('')
  }

  const openForm = () => {
    resetForm()
    const now = new Date()
    setDate(now.toISOString().split('T')[0])
    setTime('18:00')
    setShowForm(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('mentor_conferences').insert({
        mentor_id: user.id,
        title: title.trim(),
        host: host.trim() || 'Instructor',
        conference_date: date || null,
        conference_time: time || null,
        duration_mins: Math.max(15, Math.min(240, Number(durationMins) || 60)),
        location,
        notes: notes.trim() || null,
        meeting_link: meetingLink.trim() || null,
      })
      if (error) throw error
      setShowForm(false)
      resetForm()
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to create conference.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (conf: Conference) => {
    setSelectedConference(conf)
    setTitle(conf.title)
    setHost(conf.host)
    setDate(conf.conference_date ?? '')
    setTime(conf.conference_time ?? '')
    setDurationMins(String(conf.duration_mins))
    setLocation(conf.location)
    setNotes(conf.notes ?? '')
    setMeetingLink(conf.meeting_link ?? '')
    setShowEditDialog(true)
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConference || !title.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('mentor_conferences')
        .update({
          title: title.trim(),
          host: host.trim() || 'Instructor',
          conference_date: date || null,
          conference_time: time || null,
          duration_mins: Math.max(15, Math.min(240, Number(durationMins) || 60)),
          location,
          notes: notes.trim() || null,
          meeting_link: meetingLink.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedConference.id)
      if (error) throw error
      setShowEditDialog(false)
      setSelectedConference(null)
      resetForm()
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to update conference.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      const { error } = await supabase.from('mentor_conferences').delete().eq('id', deletingId)
      if (error) throw error
      setSelectedIds((prev) => { const next = { ...prev }; delete next[deletingId]; return next })
      setDeletingId(null)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete conference.', variant: 'destructive' })
    }
  }

  const duplicateConference = async (conf: Conference) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('mentor_conferences').insert({
        mentor_id: user.id,
        title: `${conf.title} (Copy)`,
        host: conf.host,
        conference_date: conf.conference_date,
        conference_time: conf.conference_time,
        duration_mins: conf.duration_mins,
        location: conf.location,
        notes: conf.notes,
        meeting_link: conf.meeting_link,
      })
      if (error) throw error
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to duplicate conference.', variant: 'destructive' })
    }
  }

  const confirmBulkDelete = async () => {
    const ids = Object.keys(selectedIds).filter((id) => selectedIds[id])
    try {
      const { error } = await supabase.from('mentor_conferences').delete().in('id', ids)
      if (error) throw error
      setSelectedIds({})
      setBulkDeletePending(false)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete selected conferences.', variant: 'destructive' })
    }
  }

  const copyMeetingLink = (conf: Conference) => {
    const link = conf.meeting_link || ''
    if (!link) { toast({ title: 'No meeting link set.' }); return }
    navigator.clipboard.writeText(link)
    toast({ title: 'Meeting link copied.' })
  }

  const exportConferences = () => {
    const csv = [
      ['Title', 'Host', 'Date', 'Time', 'Duration (mins)', 'Location', 'Status'],
      ...filtered.map((c) => {
        const status = getConferenceStatus(c.conference_date, c.conference_time)
        return [c.title, c.host, c.conference_date ?? '', c.conference_time ?? '', String(c.duration_mins), c.location, status]
      }),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conferences-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = useMemo(() => {
    let result = [...conferences]
    const q = query.trim().toLowerCase()
    if (q) result = result.filter((c) => c.title.toLowerCase().includes(q) || c.host.toLowerCase().includes(q) || c.location.toLowerCase().includes(q))
    if (dateFrom) result = result.filter((c) => (c.conference_date ?? '') >= dateFrom)
    if (dateTo) result = result.filter((c) => (c.conference_date ?? '') <= dateTo)
    if (locationFilter !== 'all') result = result.filter((c) => c.location === locationFilter)
    if (statusFilter !== 'all') result = result.filter((c) => getConferenceStatus(c.conference_date, c.conference_time) === statusFilter)
    result.sort((a, b) => {
      if (sortBy === 'date') return (a.conference_date ?? '').localeCompare(b.conference_date ?? '')
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'duration') return b.duration_mins - a.duration_mins
      return 0
    })
    return result
  }, [conferences, query, dateFrom, dateTo, locationFilter, statusFilter, sortBy])

  const stats = useMemo(() => {
    const now = new Date()
    return {
      total: conferences.length,
      upcoming: conferences.filter((c) => { try { return c.conference_date && new Date(`${c.conference_date}T${c.conference_time ?? '00:00'}`) > now } catch { return false } }).length,
      past: conferences.filter((c) => { try { return c.conference_date && new Date(`${c.conference_date}T${c.conference_time ?? '00:00'}`) < now } catch { return false } }).length,
    }
  }, [conferences])

  const selectedCount = Object.values(selectedIds).filter(Boolean).length
  const toggleSelectAll = () => {
    const allSelected = filtered.every((c) => selectedIds[c.id])
    if (allSelected) { setSelectedIds({}) } else {
      const next: Record<string, boolean> = {}
      filtered.forEach((c) => { next[c.id] = true })
      setSelectedIds(next)
    }
  }

  const ConferenceForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs text-slate-700">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Group Debrief: Week 3" className="text-sm" required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Host</Label>
        <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="Instructor name" className="text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Zoom">Zoom</SelectItem>
            <SelectItem value="Google Meet">Google Meet</SelectItem>
            <SelectItem value="In-person">In-person</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Time</Label>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Duration (minutes)</Label>
        <Input type="number" min="15" max="240" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} className="text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Meeting link (optional)</Label>
        <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://…" className="text-sm" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs text-slate-700">Notes (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm" />
      </div>
      <div className="md:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => { setShowForm(false); setShowEditDialog(false); resetForm() }}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conferences (Live sessions)</h1>
          <p className="text-sm text-slate-600 max-w-xl">Schedule and manage online supervision sessions, group debriefs and live teaching.</p>
        </div>
      </div>

      {conferences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-teal-200">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-slate-600 mb-1">Total</p><p className="text-2xl font-bold text-slate-900">{stats.total}</p></div>
              <CalendarDays className="h-8 w-8 text-teal-600" />
            </div>
          </Card>
          <Card className="p-4 border-emerald-200">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-slate-600 mb-1">Upcoming</p><p className="text-2xl font-bold text-slate-900">{stats.upcoming}</p></div>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-4 border-slate-200">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-slate-600 mb-1">Past</p><p className="text-2xl font-bold text-slate-900">{stats.past}</p></div>
              <XCircle className="h-8 w-8 text-slate-600" />
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4 space-y-4 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md min-w-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search conferences..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-9 w-36 text-xs">
                <div className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /><SelectValue /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="duration">Sort by Duration</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportConferences} className="h-9 text-xs" disabled={filtered.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs px-1 pb-4 border-b border-slate-200">
          <span className="font-medium text-slate-700">Filters:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">From</span>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36 text-xs px-3" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">To</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36 text-xs px-3" />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Zoom">Zoom</SelectItem>
              <SelectItem value="Google Meet">Google Meet</SelectItem>
              <SelectItem value="In-person">In-person</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
          {(dateFrom || dateTo || locationFilter !== 'all' || statusFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); setLocationFilter('all'); setStatusFilter('all') }} className="h-8 text-xs">
              Reset filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : conferences.length === 0 ? (
          <EmptyState
            title="No conferences have been created yet!"
            description="Create a new conference below to host live supervision or group sessions."
            actionLabel="Add conference"
            icon={<CalendarDays className="h-4 w-4" />}
            onActionClick={openForm}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Showing {filtered.length} of {conferences.length} conference(s)
                {selectedCount > 0 && ` • ${selectedCount} selected`}
              </p>
              {selectedCount > 0 && (
                <Button variant="destructive" size="sm" onClick={() => setBulkDeletePending(true)} className="h-8 text-xs">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete ({selectedCount})
                </Button>
              )}
            </div>
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-3 py-2 text-left font-medium w-10">
                      <input type="checkbox" checked={filtered.length > 0 && filtered.every((c) => selectedIds[c.id])} onChange={toggleSelectAll} className="rounded border-slate-300" aria-label="Select all" />
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Title</th>
                    <th className="px-3 py-2 text-left font-medium">Host</th>
                    <th className="px-3 py-2 text-left font-medium">Date & Time</th>
                    <th className="px-3 py-2 text-left font-medium">Duration</th>
                    <th className="px-3 py-2 text-left font-medium">Location</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-500">No conferences match your filters</td></tr>
                  ) : (
                    filtered.map((c) => {
                      const status = getConferenceStatus(c.conference_date, c.conference_time)
                      const statusConfig = {
                        upcoming: { label: 'Upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200' },
                        ongoing: { label: 'Ongoing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
                        past: { label: 'Past', className: 'bg-slate-50 text-slate-600 border-slate-200' },
                      }[status]
                      return (
                        <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/70 cursor-pointer" onClick={() => { setSelectedConference(c); setShowDetailsDialog(true) }}>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedIds[c.id] || false} onChange={(e) => setSelectedIds((prev) => ({ ...prev, [c.id]: e.target.checked }))} className="rounded border-slate-300" />
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-900">{c.title}</td>
                          <td className="px-3 py-2 text-slate-600">{c.host}</td>
                          <td className="px-3 py-2 text-slate-600">
                            <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDateDisplay(c.conference_date)}</div>
                            {c.conference_time && <div className="flex items-center gap-1 text-slate-500"><Clock className="h-3 w-3" />{c.conference_time}</div>}
                          </td>
                          <td className="px-3 py-2 text-slate-600">{c.duration_mins} mins</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-[10px]"><MapPin className="h-3 w-3 mr-1" />{c.location}</Badge>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className={`text-[10px] ${statusConfig.className}`}>{statusConfig.label}</Badge>
                          </td>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedConference(c); setShowDetailsDialog(true) }}>
                                  <ExternalLink className="h-3.5 w-3.5 mr-2" /> View details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => startEdit(c)}>
                                  <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyMeetingLink(c)}>
                                  <Copy className="h-3.5 w-3.5 mr-2" /> Copy link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => duplicateConference(c)}>
                                  <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeletingId(c.id)} className="text-red-600">
                                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-4">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs" onClick={openForm}>
            Add conference
          </Button>
        </div>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card className="p-4 border-slate-200 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">New conference</h2>
          <ConferenceForm onSubmit={handleCreate} submitLabel="Create" />
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { if (!open) { setShowEditDialog(false); resetForm() } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit conference</DialogTitle>
            <DialogDescription>Update the conference details.</DialogDescription>
          </DialogHeader>
          <ConferenceForm onSubmit={saveEdit} submitLabel="Save changes" />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedConference?.title}</DialogTitle>
          </DialogHeader>
          {selectedConference && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div><span className="font-medium text-slate-900">Host:</span> {selectedConference.host}</div>
                <div><span className="font-medium text-slate-900">Location:</span> {selectedConference.location}</div>
                <div><span className="font-medium text-slate-900">Date:</span> {formatDateDisplay(selectedConference.conference_date)}</div>
                <div><span className="font-medium text-slate-900">Time:</span> {selectedConference.conference_time ?? '—'}</div>
                <div><span className="font-medium text-slate-900">Duration:</span> {selectedConference.duration_mins} mins</div>
              </div>
              {selectedConference.meeting_link && (
                <div className="text-xs">
                  <span className="font-medium text-slate-900">Meeting link:</span>{' '}
                  <a href={selectedConference.meeting_link} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline break-all">{selectedConference.meeting_link}</a>
                </div>
              )}
              {selectedConference.notes && (
                <div className="text-xs"><span className="font-medium text-slate-900">Notes:</span> {selectedConference.notes}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this conference?</DialogTitle>
            <DialogDescription>This conference will be permanently removed.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <Dialog open={bulkDeletePending} onOpenChange={setBulkDeletePending}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {selectedCount} conference(s)?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setBulkDeletePending(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>Delete all</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
