'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video, MessageSquare, FileText, Users, GraduationCap, AlertCircle, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns'
import Link from 'next/link'

interface WeeklyEvent {
  id: string
  module_id: string | null
  event_type: string
  scheduled_date: string | null
  title: string
  description: string | null
  meeting_link: string | null
  recording_url: string | null
  week_number: number | null
  module?: {
    week_number: number
    title: string
  }
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  discussion_prompt: { label: 'Discussion', icon: MessageSquare, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  peer_circle: { label: 'Peer Circle', icon: Users, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  facilitator_session: { label: 'Facilitator Session', icon: Video, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  wrap_up: { label: 'Wrap-Up', icon: CalendarIcon, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  quiz: { label: 'Quiz', icon: FileText, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  assignment_due: { label: 'Assignment Due', icon: AlertCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  info_session: { label: 'Info Session', icon: CalendarIcon, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  orientation: { label: 'Orientation', icon: GraduationCap, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
}

export function WeeklyCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState<WeeklyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from('weekly_events')
          .select('*')
          .order('scheduled_date', { ascending: true, nullsFirst: false })

        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
            setTableMissing(true)
            setEvents([])
            setLoading(false)
            return
          }
          throw error
        }
        setEvents((data ?? []) as WeeklyEvent[])
      } catch (error) {
        console.error('Error loading events:', error)
        setTableMissing(true)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [supabase])

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      if (!event.scheduled_date) return false
      return isSameDay(new Date(event.scheduled_date), day)
    })
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500 text-sm">Loading calendar…</p>
      </div>
    )
  }

  if (tableMissing) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Calendar is not set up yet.</p>
        <p className="mt-1 text-amber-800">
          An admin needs to run the setup script in Supabase. After that, admins and mentors can add events from their portals.
        </p>
        <p className="mt-2 text-xs text-amber-700">
          Run <code className="rounded bg-amber-100 px-1">supabase/scripts/create_weekly_events_and_admin_policies.sql</code> in Supabase Dashboard → SQL Editor.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-center font-medium text-xs text-slate-600 pb-2">
            {format(day, 'EEE')}
            <div className="mt-0.5">{format(day, 'd')}</div>
          </div>
        ))}
        {weekDays.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={dayIdx}
              className={`min-h-[320px] rounded-lg border p-2 ${
                isToday ? 'bg-teal-50 border-teal-200' : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const config = EVENT_TYPE_CONFIG[event.event_type] || {
                    label: event.event_type,
                    icon: CalendarDays,
                    color: 'bg-slate-100 text-slate-800',
                  }
                  const Icon = config.icon

                  return (
                    <Card key={event.id} className="p-2 border-slate-200 hover:shadow-sm transition-shadow">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Icon className="h-3 w-3 shrink-0" />
                          <Badge className={`${config.color} text-[10px]`}>{config.label}</Badge>
                        </div>
                        <p className="text-xs font-semibold line-clamp-2">{event.title}</p>
                        {event.scheduled_date && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="h-3 w-3 shrink-0" />
                            {format(new Date(event.scheduled_date), 'h:mm a')}
                          </div>
                        )}
                        {event.week_number != null && (
                          <p className="text-[11px] text-slate-500">Week {event.week_number}</p>
                        )}
                        {event.meeting_link && (
                          <a
                            href={event.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-[11px] text-teal-700 hover:underline"
                          >
                            Join
                          </a>
                        )}
                        {event.module_id && event.event_type === 'discussion_prompt' && (
                          <Link href={`/discussions/${event.module_id}`} className="inline-block text-[11px] text-teal-700 hover:underline">
                            View
                          </Link>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
        {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
          const Icon = config.icon
          return (
            <Badge key={type} variant="secondary" className={`text-[10px] ${config.color}`}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
