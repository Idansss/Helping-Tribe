'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/admin/EmptyState'
import {
  CalendarDays,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  MoreVertical,
  Clock,
  MapPin,
  Users,
  Video,
  ExternalLink,
  Download,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { MentorLayout } from '@/components/lms/MentorLayout'
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

type Conference = {
  id: string
  title: string
  host: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  durationMins: number
  location: 'Zoom' | 'Google Meet' | 'In-person'
  notes?: string
  createdAt: string
  meetingLink?: string
}

const STORAGE_KEY = 'ht-mentor-conferences'

const formatDateForInput = (dateStr: string) => {
  if (!dateStr) return ''
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return dateStr
}

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateTime = (date: string, time: string) => {
  try {
    const dt = new Date(`${date}T${time}`)
    return dt.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return `${date} • ${time}`
  }
}

const getConferenceStatus = (date: string, time: string): 'upcoming' | 'past' | 'ongoing' => {
  try {
    const confDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const endTime = new Date(confDateTime.getTime() + 60 * 60 * 1000) // +1 hour default
    
    if (now < confDateTime) return 'upcoming'
    if (now > endTime) return 'past'
    return 'ongoing'
  } catch {
    return 'upcoming'
  }
}

export default function MentorConferencesPage() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration'>('date')
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAttendeesDialog, setShowAttendeesDialog] = useState(false)
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null)

  const [title, setTitle] = useState('')
  const [host, setHost] = useState('Instructor')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMins, setDurationMins] = useState('60')
  const [location, setLocation] = useState<Conference['location']>('Zoom')
  const [notes, setNotes] = useState('')
  const [meetingLink, setMeetingLink] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Conference[]
      if (Array.isArray(parsed)) setConferences(parsed)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conferences))
    } catch {
      // ignore
    }
  }, [conferences])

  const openForm = () => {
    resetForm()
    // sensible defaults
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    setDate(`${yyyy}-${mm}-${dd}`)
    setTime('18:00')
    setDurationMins('60')
    setShowForm(true)
  }

  const filtered = useMemo(() => {
    let result = [...conferences]

    // Search filter
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((c) => {
        return (
          c.title.toLowerCase().includes(q) ||
          c.host.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))
        )
      })
    }

    // Date filter
    if (dateFrom) {
      result = result.filter((c) => c.date >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((c) => c.date <= dateTo)
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter((c) => c.location === locationFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => {
        const status = getConferenceStatus(c.date, c.time)
        return status === statusFilter
      })
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(`${a.date}T${a.time}`).getTime()
        const dateB = new Date(`${b.date}T${b.time}`).getTime()
        return dateA - dateB
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'duration') {
        return b.durationMins - a.durationMins
      }
      return 0
    })

    return result
  }, [conferences, query, dateFrom, dateTo, locationFilter, statusFilter, sortBy])

  const stats = useMemo(() => {
    const now = new Date()
    const upcoming = conferences.filter((c) => {
      try {
        const confDateTime = new Date(`${c.date}T${c.time}`)
        return confDateTime > now
      } catch {
        return false
      }
    })
    const past = conferences.filter((c) => {
      try {
        const confDateTime = new Date(`${c.date}T${c.time}`)
        const endTime = new Date(confDateTime.getTime() + c.durationMins * 60 * 1000)
        return endTime < now
      } catch {
        return false
      }
    })
    return {
      total: conferences.length,
      upcoming: upcoming.length,
      past: past.length,
    }
  }, [conferences])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const dur = Math.max(15, Math.min(240, Number(durationMins) || 60))
    const createdAt = new Date().toISOString()
    const newConf: Conference = {
      id: `conf-${Date.now()}`,
      title: title.trim(),
      host: host.trim() || 'Instructor',
      date,
      time,
      durationMins: dur,
      location,
      notes: notes.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
      createdAt,
    }
    setConferences((prev) => [newConf, ...prev])
    setTitle('')
    setHost('Instructor')
    setDate('')
    setTime('')
    setDurationMins('60')
    setLocation('Zoom')
    setNotes('')
    setMeetingLink('')
    setShowForm(false)
  }

  const startEdit = (conf: Conference) => {
    setSelectedConference(conf)
    setTitle(conf.title)
    setHost(conf.host)
    setDate(conf.date)
    setTime(conf.time)
    setDurationMins(String(conf.durationMins))
    setLocation(conf.location)
    setNotes(conf.notes || '')
    setMeetingLink(conf.meetingLink || '')
    setShowEditDialog(true)
  }

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConference || !title.trim()) return
    const dur = Math.max(15, Math.min(240, Number(durationMins) || 60))
    setConferences((prev) =>
      prev.map((c) =>
        c.id === selectedConference.id
          ? {
              ...c,
              title: title.trim(),
              host: host.trim() || 'Instructor',
              date,
              time,
              durationMins: dur,
              location,
              notes: notes.trim() || undefined,
              meetingLink: meetingLink.trim() || undefined,
            }
          : c
      )
    )
    setShowEditDialog(false)
    setSelectedConference(null)
    resetForm()
  }

  const deleteConference = (id: string) => {
    if (confirm('Are you sure you want to delete this conference?')) {
      setConferences((prev) => prev.filter((c) => c.id !== id))
      setSelectedIds((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const duplicateConference = (conf: Conference) => {
    const newConf: Conference = {
      ...conf,
      id: `conf-${Date.now()}`,
      title: `${conf.title} (Copy)`,
      createdAt: new Date().toISOString(),
    }
    setConferences((prev) => [newConf, ...prev])
  }

  const bulkDelete = () => {
    const ids = Object.keys(selectedIds).filter((id) => selectedIds[id])
    if (ids.length === 0) return
    if (confirm(`Delete ${ids.length} conference(s)?`)) {
      setConferences((prev) => prev.filter((c) => !ids.includes(c.id)))
      setSelectedIds({})
    }
  }

  const toggleSelectAll = () => {
    const allSelected = filtered.every((c) => selectedIds[c.id])
    if (allSelected) {
      setSelectedIds({})
    } else {
      const newSelected: Record<string, boolean> = {}
      filtered.forEach((c) => {
        newSelected[c.id] = true
      })
      setSelectedIds(newSelected)
    }
  }

  const openDetails = (conf: Conference) => {
    setSelectedConference(conf)
    setShowDetailsDialog(true)
  }

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

  const copyMeetingLink = (conf: Conference) => {
    const link = conf.meetingLink || `https://${conf.location.toLowerCase().replace(' ', '')}.com/meeting/${conf.id}`
    navigator.clipboard.writeText(link)
    alert('Meeting link copied to clipboard!')
  }

  const exportConferences = () => {
    const csv = [
      ['Title', 'Host', 'Date', 'Time', 'Duration (mins)', 'Location', 'Status'],
      ...filtered.map((c) => {
        const status = getConferenceStatus(c.date, c.time)
        return [
          c.title,
          c.host,
          formatDateDisplay(c.date),
          c.time,
          String(c.durationMins),
          c.location,
          status,
        ]
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

  const selectedCount = Object.values(selectedIds).filter(Boolean).length

  return (
    <MentorLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Conferences (Live sessions)
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Schedule and manage online supervision sessions, group debriefs
              and live teaching.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {conferences.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Conferences</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
            <Card className="p-4 border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.upcoming}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Past</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.past}</p>
                </div>
                <XCircle className="h-8 w-8 text-slate-600" />
              </div>
            </Card>
          </div>
        )}

        <Card className="p-4 space-y-4 border-[#e2e8f0]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md min-w-0">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conferences..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 h-9 text-sm border-[#e2e8f0]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="h-9 w-36 text-xs border-[#e2e8f0]">
                  <SelectValue>
                    <div className="flex items-center gap-1">
                      <ArrowUpDown className="h-3 w-3" />
                      Sort
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                  <SelectItem value="duration">Sort by Duration</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={exportConferences}
                className="h-9 text-xs"
                disabled={filtered.length === 0}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs px-1 pb-4 border-b border-[#e2e8f0]">
            <span className="font-medium text-slate-700 whitespace-nowrap">
              Filters:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 whitespace-nowrap">From</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 w-36 text-xs border-[#e2e8f0] px-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 whitespace-nowrap">To</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 w-36 text-xs border-[#e2e8f0] px-3"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-8 w-32 text-xs border-[#e2e8f0]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Zoom">Zoom</SelectItem>
                <SelectItem value="Google Meet">Google Meet</SelectItem>
                <SelectItem value="In-person">In-person</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-32 text-xs border-[#e2e8f0]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
            {(dateFrom || dateTo || locationFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                  setLocationFilter('all')
                  setStatusFilter('all')
                }}
                className="h-8 text-xs"
              >
                Reset filters
              </Button>
            )}
          </div>

          {conferences.length === 0 ? (
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
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Conferences
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing {filtered.length} of {conferences.length} conference(s)
                    {selectedCount > 0 && ` • ${selectedCount} selected`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={bulkDelete}
                      className="h-8 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete ({selectedCount})
                    </Button>
                  )}
                  <Badge variant="outline" className="text-[11px]">
                    {filtered.length} shown
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="px-3 py-2 text-left font-medium w-10">
                        <input
                          type="checkbox"
                          checked={filtered.length > 0 && filtered.every((c) => selectedIds[c.id])}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300"
                          aria-label="Select all conferences"
                        />
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
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                          No conferences match your filters
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c) => {
                        const status = getConferenceStatus(c.date, c.time)
                        const statusConfig = {
                          upcoming: { label: 'Upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200' },
                          ongoing: { label: 'Ongoing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
                          past: { label: 'Past', className: 'bg-slate-50 text-slate-600 border-slate-200' },
                        }[status]
                        return (
                          <tr
                            key={c.id}
                            className="border-t border-slate-100 hover:bg-slate-50/70 cursor-pointer"
                            onClick={() => openDetails(c)}
                          >
                            <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedIds[c.id] || false}
                                onChange={(e) => {
                                  setSelectedIds((prev) => ({
                                    ...prev,
                                    [c.id]: e.target.checked,
                                  }))
                                }}
                                className="rounded border-slate-300"
                                aria-label={`Select ${c.title}`}
                              />
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-900">
                              {c.title}
                            </td>
                            <td className="px-3 py-2 text-slate-600">{c.host}</td>
                            <td className="px-3 py-2 text-slate-600">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDateDisplay(c.date)}
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Clock className="h-3 w-3" />
                                {c.time}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {c.durationMins} mins
                            </td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className="text-[10px]">
                                <MapPin className="h-3 w-3 mr-1" />
                                {c.location}
                              </Badge>
                            </td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className={`text-[10px] ${statusConfig.className}`}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    aria-label={`More options for ${c.title}`}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openDetails(c)}>
                                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => startEdit(c)}>
                                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => copyMeetingLink(c)}>
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    Copy link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setShowAttendeesDialog(true)}>
                                    <Users className="h-3.5 w-3.5 mr-2" />
                                    View attendees
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => duplicateConference(c)}>
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteConference(c.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
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

          <div className="flex items-center justify-between pt-4">
            <div></div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
              onClick={openForm}
            >
              Add conference
            </Button>
          </div>
        </Card>

        {showForm && (
          <Card className="p-4 border-[#e2e8f0] space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              New conference
            </h2>
            <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="conf-title" className="text-xs text-slate-700">
                  Title
                </Label>
                <Input
                  id="conf-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Group Debrief: Week 3"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="conf-host" className="text-xs text-slate-700">
                  Host
                </Label>
                <Input
                  id="conf-host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="Instructor name"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-700">Location</Label>
                <Select value={location} onValueChange={(v) => setLocation(v as any)}>
                  <SelectTrigger className="h-9 text-xs border-[#e2e8f0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="In-person">In-person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="conf-date" className="text-xs text-slate-700">
                  Date
                </Label>
                <Input
                  id="conf-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="conf-time" className="text-xs text-slate-700">
                  Time
                </Label>
                <Input
                  id="conf-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="conf-duration" className="text-xs text-slate-700">
                  Duration (minutes)
                </Label>
                <Input
                  id="conf-duration"
                  inputMode="numeric"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  placeholder="60"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="conf-meeting-link" className="text-xs text-slate-700">
                  Meeting Link (optional)
                </Label>
                <Input
                  id="conf-meeting-link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="text-sm"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="conf-notes" className="text-xs text-slate-700">
                  Notes (optional)
                </Label>
                <Textarea
                  id="conf-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agenda, link, or facilitation notes…"
                  className="text-sm min-h-[80px]"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  Create conference
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedConference?.title}</DialogTitle>
              <DialogDescription>Conference details</DialogDescription>
            </DialogHeader>
            {selectedConference && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-600">Host</Label>
                    <p className="text-sm font-medium text-slate-900">{selectedConference.host}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Location</Label>
                    <p className="text-sm font-medium text-slate-900">{selectedConference.location}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Date</Label>
                    <p className="text-sm font-medium text-slate-900">
                      {formatDateDisplay(selectedConference.date)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Time</Label>
                    <p className="text-sm font-medium text-slate-900">{selectedConference.time}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Duration</Label>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedConference.durationMins} minutes
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Status</Label>
                    <div className="mt-1">
                      {(() => {
                        const status = getConferenceStatus(selectedConference.date, selectedConference.time)
                        const config = {
                          upcoming: { label: 'Upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200' },
                          ongoing: { label: 'Ongoing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
                          past: { label: 'Past', className: 'bg-slate-50 text-slate-600 border-slate-200' },
                        }[status]
                        return (
                          <Badge variant="outline" className={`text-[10px] ${config.className}`}>
                            {config.label}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                </div>
                {selectedConference.meetingLink && (
                  <div>
                    <Label className="text-xs text-slate-600">Meeting Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={selectedConference.meetingLink}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyMeetingLink(selectedConference)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedConference.meetingLink, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
                {selectedConference.notes && (
                  <div>
                    <Label className="text-xs text-slate-600">Notes</Label>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                      {selectedConference.notes}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDetailsDialog(false)
                      startEdit(selectedConference)
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDetailsDialog(false)
                      setShowAttendeesDialog(true)
                    }}
                  >
                    <Users className="h-3.5 w-3.5 mr-2" />
                    View Attendees
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Conference</DialogTitle>
              <DialogDescription>Update conference details</DialogDescription>
            </DialogHeader>
            <form onSubmit={saveEdit} className="space-y-4 mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="edit-title" className="text-xs text-slate-700">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Group Debrief: Week 3"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-host" className="text-xs text-slate-700">
                    Host
                  </Label>
                  <Input
                    id="edit-host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="Instructor name"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700">Location</Label>
                  <Select value={location} onValueChange={(v) => setLocation(v as any)}>
                    <SelectTrigger className="h-9 text-xs border-[#e2e8f0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="In-person">In-person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-date" className="text-xs text-slate-700">
                    Date
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-time" className="text-xs text-slate-700">
                    Time
                  </Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="edit-duration" className="text-xs text-slate-700">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="edit-duration"
                    inputMode="numeric"
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    placeholder="60"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="edit-meeting-link" className="text-xs text-slate-700">
                    Meeting Link (optional)
                  </Label>
                  <Input
                    id="edit-meeting-link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="edit-notes" className="text-xs text-slate-700">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="edit-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agenda, link, or facilitation notes…"
                    className="text-sm min-h-[80px]"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 justify-end pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      setShowEditDialog(false)
                      setSelectedConference(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Attendees Dialog */}
        <Dialog open={showAttendeesDialog} onOpenChange={setShowAttendeesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Attendees - {selectedConference?.title || 'Conference'}
              </DialogTitle>
              <DialogDescription>View and manage conference attendees</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="text-sm text-slate-600">
                <p>Attendee management will appear here:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Registered attendees</li>
                  <li>Attendance tracking</li>
                  <li>Invite management</li>
                  <li>Waitlist (if applicable)</li>
                </ul>
              </div>
              <div className="border rounded-md p-4 bg-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>No attendees found for this conference yet.</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => alert('Invite attendees flow is not configured yet.')}
              >
                <Users className="h-3.5 w-3.5 mr-2" />
                Invite Attendees
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MentorLayout>
  )
}
