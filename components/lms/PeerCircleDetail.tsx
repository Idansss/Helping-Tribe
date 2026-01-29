'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Users, Calendar, Plus, User, Clock, Video, FileText } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
  profile: {
    full_name: string
    email: string
  }
}

interface Session {
  id: string
  session_date: string
  title: string
  description: string | null
  agenda: any
  meeting_link: string | null
  recording_url: string | null
  notes: string | null
}

interface PeerCircleDetailProps {
  circleId: string
}

export function PeerCircleDetail({ circleId }: PeerCircleDetailProps) {
  const [circle, setCircle] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [newSessionDate, setNewSessionDate] = useState('')
  const [newSessionDescription, setNewSessionDescription] = useState('')
  const [creatingSession, setCreatingSession] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadCircleData()
  }, [circleId])

  async function loadCircleData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load circle
      const { data: circleData, error: circleError } = await supabase
        .from('peer_circles')
        .select(`
          *,
          module:modules(week_number, title)
        `)
        .eq('id', circleId)
        .single()

      if (circleError) throw circleError
      setCircle(circleData)

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('peer_circle_members')
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .eq('circle_id', circleId)
        .order('joined_at', { ascending: true })

      if (membersError) throw membersError
      setMembers(membersData as Member[])

      // Check if current user is a member
      const isUserMember = membersData?.some(m => m.user_id === user.id) || false
      setIsMember(isUserMember)

      // Load sessions (only if member)
      if (isUserMember) {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('peer_circle_sessions')
          .select('*')
          .eq('circle_id', circleId)
          .order('session_date', { ascending: true })

        if (sessionsError) throw sessionsError
        setSessions(sessionsData as Session[] || [])
      }
    } catch (error) {
      console.error('Error loading circle data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateSession() {
    if (!newSessionTitle.trim() || !newSessionDate) {
      alert('Please fill in all required fields')
      return
    }

    setCreatingSession(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { error } = await supabase
        .from('peer_circle_sessions')
        .insert({
          circle_id: circleId,
          session_date: newSessionDate,
          title: newSessionTitle,
          description: newSessionDescription || null,
          created_by: profile.id
        })

      if (error) throw error

      setNewSessionTitle('')
      setNewSessionDate('')
      setNewSessionDescription('')
      setShowSessionForm(false)
      loadCircleData()
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Please try again.')
    } finally {
      setCreatingSession(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading circle...</p>
        </div>
      </div>
    )
  }

  if (!circle) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Circle not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{circle.name}</h1>
        {circle.description && (
          <p className="text-muted-foreground mt-2">{circle.description}</p>
        )}
        {circle.module && (
          <Badge variant="outline" className="mt-2">
            Week {circle.module.week_number}: {circle.module.title}
          </Badge>
        )}
      </div>

      {!isMember && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              You are not a member of this circle. Join to view sessions and participate.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length} / {circle.max_members})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{member.profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{member.profile.email}</p>
                    </div>
                  </div>
                  {member.role !== 'member' && (
                    <Badge variant="outline">{member.role}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sessions Section */}
        {isMember && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sessions
                </CardTitle>
                <Button size="sm" onClick={() => setShowSessionForm(!showSessionForm)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showSessionForm && (
                <div className="mb-4 p-4 border rounded space-y-3">
                  <div>
                    <label htmlFor="session-title" className="text-sm font-medium">Session Title *</label>
                    <input
                      id="session-title"
                      type="text"
                      value={newSessionTitle}
                      onChange={(e) => setNewSessionTitle(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="e.g., Module 1 Discussion"
                    />
                  </div>
                  <div>
                    <label htmlFor="session-date" className="text-sm font-medium">Date & Time *</label>
                    <input
                      id="session-date"
                      type="datetime-local"
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      aria-label="Session date and time"
                      title="Session date and time"
                    />
                  </div>
                  <div>
                    <label htmlFor="session-description" className="text-sm font-medium">Description</label>
                    <textarea
                      id="session-description"
                      value={newSessionDescription}
                      onChange={(e) => setNewSessionDescription(e.target.value)}
                      rows={2}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Optional session description"
                      aria-label="Session description"
                      title="Session description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateSession} disabled={creatingSession} size="sm">
                      {creatingSession ? 'Creating...' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowSessionForm(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sessions scheduled yet
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="p-3 border rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{session.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(session.session_date), 'MMM d, yyyy h:mm a')}
                          </div>
                          {session.description && (
                            <p className="text-sm mt-1">{session.description}</p>
                          )}
                        </div>
                      </div>
                      {session.meeting_link && (
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Video className="h-3 w-3 mr-1" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
