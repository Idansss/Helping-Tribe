'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CalendarDays, Download, ChevronLeft, ChevronRight, Plus, Video, Clipboard, Users, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { WeeklyCalendar } from '@/components/lms/WeeklyCalendar'

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  type: 'conference' | 'grading' | 'peer-circle' | 'supervision' | 'other'
  description?: string
}

const STORAGE_KEY = 'mentor-calendar-events'

export default function MentorCalendarPage() {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  // Form state
  const [eventForm, setEventForm] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    type: 'conference',
    description: '',
  })

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEY)
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents) as CalendarEvent[]
        setEvents(parsedEvents)
      }
    } catch (error) {
      console.error('Failed to load events from localStorage:', error)
    }
  }, [])

  // Save events to localStorage whenever events change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (error) {
      console.error('Failed to save events to localStorage:', error)
      toast({
        title: 'Save failed',
        description: 'Failed to save events. They may not persist after reload.',
        variant: 'destructive',
      })
    }
  }, [events, toast])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleAddEvent = () => {
    if (!eventForm.title.trim()) {
      toast({
        title: 'Validation error',
        description: 'Please enter an event title.',
        variant: 'destructive',
      })
      return
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      ...eventForm,
    }

    setEvents([...events, newEvent])
    setIsDialogOpen(false)
    
    // Reset form
    setEventForm({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      type: 'conference',
      description: '',
    })

    toast({
      title: 'Event added',
      description: `${eventForm.title} has been added to your calendar.`,
    })
  }

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    setSelectedDate(dateStr)
    setEventForm(prev => ({ ...prev, date: dateStr }))
    setIsDialogOpen(true)
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter(event => event.date === dateStr)
  }

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'conference':
        return <Video className="h-3 w-3" />
      case 'grading':
        return <Clipboard className="h-3 w-3" />
      case 'peer-circle':
        return <Users className="h-3 w-3" />
      case 'supervision':
        return <Clock className="h-3 w-3" />
      default:
        return <CalendarDays className="h-3 w-3" />
    }
  }

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'conference':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'grading':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'peer-circle':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'supervision':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const weeks: Date[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <>
      <Toaster />
      <div className="space-y-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Training schedule (shared with learners)</CardTitle>
            <CardDescription>
              Weekly events managed by admins. Same view as learners see on their Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyCalendar />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your personal events
              </h2>
              <p className="text-sm text-slate-600 max-w-xl">
                Conferences, grading windows, peer circles and supervision sessions (saved in this browser).
              </p>
            </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs border-[#e2e8f0]"
              onClick={goToToday}
            >
              Today
            </Button>
            <div className="flex items-center gap-0 border border-[#e2e8f0] rounded-md overflow-hidden">
              <button 
                type="button" 
                className="p-1.5 hover:bg-slate-50 border-[#e2e8f0]" 
                aria-label="Previous month"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <button 
                type="button" 
                className="p-1.5 hover:bg-slate-50 border-l border-[#e2e8f0]" 
                aria-label="Next month"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="h-8 w-32 text-xs border-[#e2e8f0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs border-[#e2e8f0]"
              onClick={() => {
                const calendarData = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Helping Tribe//EN\nEND:VCALENDAR`
                const blob = new Blob([calendarData], { type: 'text/calendar' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `calendar-${format(currentDate, 'yyyy-MM')}.ics`
                a.click()
              }}
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  onClick={() => {
                    setEventForm(prev => ({
                      ...prev,
                      date: selectedDate || format(new Date(), 'yyyy-MM-dd'),
                    }))
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>
                    Create a new event for conferences, grading windows, peer circles, or supervision sessions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Weekly Supervision Session"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Event Type *</Label>
                      <Select
                        value={eventForm.type}
                        onValueChange={(value: CalendarEvent['type']) =>
                          setEventForm(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="grading">Grading Window</SelectItem>
                          <SelectItem value="peer-circle">Peer Circle</SelectItem>
                          <SelectItem value="supervision">Supervision Session</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional details about this event..."
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEventForm({
                        title: '',
                        date: format(new Date(), 'yyyy-MM-dd'),
                        startTime: '09:00',
                        endTime: '10:00',
                        type: 'conference',
                        description: '',
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent} className="bg-purple-600 hover:bg-purple-700">
                    Add Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="p-4 space-y-4 border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">
                {format(currentDate, 'MMMM yyyy')}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <th
                      key={day}
                      className="py-2 px-2 text-center font-medium text-slate-600"
                    >
                      {day.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIdx) => (
                  <tr key={weekIdx}>
                    {week.map((day, dayIdx) => {
                      const isCurrentMonth = isSameMonth(day, currentDate)
                      const isTodayDate = isToday(day)
                      const dayEvents = getEventsForDate(day)
                      return (
                        <td
                          key={dayIdx}
                          onClick={() => handleDateClick(day)}
                          className={`border border-dashed border-[#e2e8f0] h-20 align-top p-2 text-[11px] cursor-pointer hover:bg-purple-50 transition-colors ${
                            isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                          } ${isTodayDate ? 'bg-purple-50 font-semibold' : ''}`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className={`${isTodayDate ? 'text-purple-600' : ''}`}>
                              {format(day, 'd')}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-[9px] px-1 py-0.5 rounded border truncate ${getEventTypeColor(event.type)}`}
                                  title={`${event.title} (${event.startTime} - ${event.endTime})`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Could open edit dialog here
                                  }}
                                >
                                  <div className="flex items-center gap-1">
                                    {getEventTypeIcon(event.type)}
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-[9px] text-slate-500 px-1">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500">
            Personal events are saved in this browser. Admins manage the training schedule above from Admin → Calendar.
          </p>
        </Card>
        </div>
      </div>
    </>
  )
}

