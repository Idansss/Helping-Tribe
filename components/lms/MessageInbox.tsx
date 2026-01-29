'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Send, Loader2, MessageSquare, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ConversationListSkeleton } from '@/components/lms/LoadingSkeletons'

export type MessageRow = {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  read_at: string | null
  created_at: string
}

export type Conversation = {
  otherId: string
  otherName: string
  lastMessage: string
  lastAt: string
  unreadCount: number
}

interface MessageInboxProps {
  /** Show "New message" and allow composing to a selected user (mentor/admin) */
  canCompose?: boolean
  /** Pre-selected user id to open thread (e.g. from ?to=) */
  initialToId?: string | null
  /** For mentor/admin: list of users that can be chosen for "New message" */
  recipientOptions?: { id: string; label: string }[]
  /** Inbox title */
  title?: string
  /** Empty state when no conversations */
  emptyMessage?: string
}

export function MessageInbox({
  canCompose = false,
  initialToId = null,
  recipientOptions = [],
  title = 'Messages',
  emptyMessage = 'No messages yet. When someone sends you a message, it will appear here.',
}: MessageInboxProps) {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [thread, setThread] = useState<MessageRow[]>([])
  const [otherId, setOtherId] = useState<string | null>(initialToId || null)
  const [otherName, setOtherName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedNewId, setSelectedNewId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })
  }, [supabase])

  useEffect(() => {
    if (initialToId) {
      setOtherId(initialToId)
      const opt = recipientOptions.find((o) => o.id === initialToId)
      if (opt) setOtherName(opt.label)
    }
  }, [initialToId, recipientOptions])

  useEffect(() => {
    if (!userId) return
    loadConversations()
  }, [userId])

  useEffect(() => {
    if (!userId || !otherId) {
      setThread([])
      return
    }
    loadThread()
  }, [userId, otherId])

  async function loadConversations() {
    if (!userId) return
    setLoading(true)
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, body, read_at, created_at')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const list = (messages ?? []) as MessageRow[]
      const otherIds = new Set<string>()
      list.forEach((m) => {
        const other = m.sender_id === userId ? m.recipient_id : m.sender_id
        otherIds.add(other)
      })

      if (otherIds.size === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(otherIds))

      const nameById: Record<string, string> = {}
      ;(profiles ?? []).forEach((p: any) => {
        nameById[p.id] = p.full_name || 'Unknown'
      })

      const convMap = new Map<string, { last: MessageRow; unread: number }>()
      list.forEach((m) => {
        const other = m.sender_id === userId ? m.recipient_id : m.sender_id
        if (!convMap.has(other)) {
          convMap.set(other, {
            last: m,
            unread: m.recipient_id === userId && !m.read_at ? 1 : 0,
          })
        } else {
          const cur = convMap.get(other)!
          if (m.recipient_id === userId && !m.read_at) cur.unread += 1
        }
      })

      const convs: Conversation[] = Array.from(convMap.entries()).map(
        ([otherId, { last, unread }]) => ({
          otherId,
          otherName: nameById[otherId] ?? 'Unknown',
          lastMessage: last.body,
          lastAt: last.created_at,
          unreadCount: unread,
        })
      )
      convs.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
      setConversations(convs)
    } catch (e) {
      console.error(e)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  async function loadThread() {
    if (!userId || !otherId) return
    setThreadLoading(true)
    try {
      const [out, back] = await Promise.all([
        supabase
          .from('messages')
          .select('id, sender_id, recipient_id, body, read_at, created_at')
          .eq('sender_id', userId)
          .eq('recipient_id', otherId)
          .order('created_at', { ascending: true }),
        supabase
          .from('messages')
          .select('id, sender_id, recipient_id, body, read_at, created_at')
          .eq('sender_id', otherId)
          .eq('recipient_id', userId)
          .order('created_at', { ascending: true }),
      ])
      const outList = (out.data ?? []) as MessageRow[]
      const backList = (back.data ?? []) as MessageRow[]
      const merged = [...outList, ...backList].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      setThread(merged)

      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .eq('sender_id', otherId)
        .is('read_at', null)
      loadConversations()
    } catch (e) {
      console.error(e)
      setThread([])
    } finally {
      setThreadLoading(false)
    }
  }

  async function sendMessage(recipientId: string, body: string) {
    if (!userId || !body.trim()) return
    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: userId,
        recipient_id: recipientId,
        body: body.trim(),
      })
      if (error) throw error

      // Notify recipient (bell dropdown)
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
      const senderName = (profile as { full_name?: string } | null)?.full_name?.trim() || 'Someone'
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'message',
        title: `New message from ${senderName}`,
        body: body.trim().slice(0, 120),
        link: null,
      })

      setReplyBody('')
      if (otherId === recipientId) {
        loadThread()
      } else {
        setOtherId(recipientId)
        const opt = recipientOptions.find((o) => o.id === recipientId)
        setOtherName(opt?.label ?? 'Unknown')
      }
      loadConversations()
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  if (!userId) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-12 text-center text-slate-500">
          Loading…
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-teal-600" />
          {title}
        </h1>
        {canCompose && recipientOptions.length > 0 && (
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => setShowNewDialog(true)}
          >
            New message
          </Button>
        )}
      </div>

      <Card className="border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row md:min-h-[400px]">
          {/* Conversation list */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-slate-700">
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {loading ? (
                <ConversationListSkeleton />
              ) : conversations.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  {emptyMessage}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {conversations.map((c) => (
                    <li key={c.otherId}>
                      <button
                        type="button"
                        onClick={() => {
                          setOtherId(c.otherId)
                          setOtherName(c.otherName)
                        }}
                        className={`
                          w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors
                          ${otherId === c.otherId ? 'bg-teal-50 border-l-2 border-teal-600' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-900 truncate">
                            {c.otherName}
                          </span>
                          {c.unreadCount > 0 && (
                            <span className="shrink-0 rounded-full bg-teal-600 text-white text-xs px-1.5 py-0.5">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {c.lastMessage}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(c.lastAt), { addSuffix: true })}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </div>

          {/* Thread view */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            {!otherId ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 p-6">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Select a conversation or start a new message.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setOtherId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium text-slate-900">{otherName}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {threadLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    thread.map((m) => {
                      const isMe = m.sender_id === userId
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                              isMe
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.body}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isMe ? 'text-teal-200' : 'text-slate-400'
                              }`}
                            >
                              {formatDistanceToNow(new Date(m.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="border-t border-slate-200 p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      sendMessage(otherId, replyBody)
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Type a message…"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={sending || !replyBody.trim()}
                      className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* New message dialog (mentor/admin) */}
      {showNewDialog && canCompose && recipientOptions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">New message</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewDialog(false)
                  setSelectedNewId(null)
                }}
              >
                Cancel
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">Choose a recipient:</p>
              <ul className="max-h-60 overflow-y-auto space-y-1 border rounded-lg p-2">
                {recipientOptions.map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNewId(opt.id)
                        setOtherId(opt.id)
                        setOtherName(opt.label)
                        setShowNewDialog(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 text-sm"
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
