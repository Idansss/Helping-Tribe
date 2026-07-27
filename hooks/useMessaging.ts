'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Conversation,
  MessageRecipientOption,
  MessageRow,
  MessagingRoleVariant,
  ThreadMessage,
} from '@/components/messaging/messaging-types'
import {
  aggregateConversations,
  createOptimisticId,
  displayName,
  reconcileOptimisticMessage,
  upsertRealtimeMessage,
} from '@/components/messaging/messaging-utils'
import { useMessagingRealtime } from '@/hooks/useMessagingRealtime'
import { useToast } from '@/hooks/use-toast'

type UseMessagingOptions = {
  canCompose?: boolean
  initialToId?: string | null
  recipientOptions?: MessageRecipientOption[]
  roleVariant?: MessagingRoleVariant
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function useMessaging({
  canCompose = false,
  initialToId = null,
  recipientOptions = [],
  roleVariant = 'learner',
}: UseMessagingOptions) {
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  const [userId, setUserId] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsState, setConversationsState] = useState<LoadState>('loading')
  const [thread, setThread] = useState<ThreadMessage[]>([])
  const [threadState, setThreadState] = useState<LoadState>('idle')
  const [otherId, setOtherId] = useState<string | null>(initialToId || null)
  const [otherName, setOtherName] = useState('')
  const [otherRole, setOtherRole] = useState<string | null>(null)
  const [otherAvatarUrl, setOtherAvatarUrl] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<
    'connecting' | 'subscribed' | 'unavailable' | 'error' | 'idle'
  >('idle')

  const sendingLock = useRef(false)
  const otherIdRef = useRef(otherId)
  otherIdRef.current = otherId

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!active) return
      if (error || !user) {
        setAuthError(true)
        setUserId(null)
        setConversationsState('error')
        return
      }
      setUserId(user.id)
    })
    return () => {
      active = false
    }
  }, [supabase])

  useEffect(() => {
    if (!initialToId) return
    setOtherId(initialToId)
    const option = recipientOptions.find((entry) => entry.id === initialToId)
    if (option) {
      setOtherName(displayName(option.name, option.label || 'Unknown'))
      setOtherRole(option.role ?? null)
      setOtherAvatarUrl(option.avatarUrl ?? null)
    }
  }, [initialToId, recipientOptions])

  const loadConversations = useCallback(async () => {
    if (!userId) return
    setConversationsState((prev) => (prev === 'ready' ? 'ready' : 'loading'))
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, body, read_at, created_at')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const list = (messages ?? []) as MessageRow[]
      const otherIds = new Set<string>()
      for (const message of list) {
        otherIds.add(
          message.sender_id === userId ? message.recipient_id : message.sender_id
        )
      }

      if (otherIds.size === 0) {
        setConversations([])
        setConversationsState('ready')
        return
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .in('id', Array.from(otherIds))

      if (profileError) throw profileError

      const profileMap: Record<
        string,
        { full_name?: string | null; role?: string | null; avatar_url?: string | null }
      > = {}
      for (const profile of profiles ?? []) {
        profileMap[profile.id] = profile
      }

      const next = aggregateConversations(list, userId, profileMap)
      setConversations(next)

      if (otherIdRef.current) {
        const active = next.find((entry) => entry.otherId === otherIdRef.current)
        if (active) {
          setOtherName(active.otherName)
          setOtherRole(active.otherRole)
          setOtherAvatarUrl(active.otherAvatarUrl)
        }
      }

      setConversationsState('ready')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[messaging] conversations failed', error)
      }
      setConversationsState('error')
    }
  }, [supabase, userId])

  const loadThread = useCallback(
    async (targetId: string, options?: { quiet?: boolean }) => {
      if (!userId || !targetId) return
      if (!options?.quiet) setThreadState('loading')
      try {
        const [outbound, inbound] = await Promise.all([
          supabase
            .from('messages')
            .select('id, sender_id, recipient_id, body, read_at, created_at')
            .eq('sender_id', userId)
            .eq('recipient_id', targetId)
            .order('created_at', { ascending: true }),
          supabase
            .from('messages')
            .select('id, sender_id, recipient_id, body, read_at, created_at')
            .eq('sender_id', targetId)
            .eq('recipient_id', userId)
            .order('created_at', { ascending: true }),
        ])

        if (outbound.error) throw outbound.error
        if (inbound.error) throw inbound.error

        const merged = [
          ...((outbound.data ?? []) as MessageRow[]),
          ...((inbound.data ?? []) as MessageRow[]),
        ].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        setThread(merged)
        setThreadState('ready')

        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('recipient_id', userId)
          .eq('sender_id', targetId)
          .is('read_at', null)

        void loadConversations()
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[messaging] thread failed', error)
        }
        if (!options?.quiet) {
          setThread([])
          setThreadState('error')
        }
      }
    },
    [loadConversations, supabase, userId]
  )

  useEffect(() => {
    if (!userId) return
    void loadConversations()
  }, [loadConversations, userId])

  useEffect(() => {
    if (!userId) return
    if (!otherId) {
      setThread([])
      setThreadState('idle')
      return
    }
    void loadThread(otherId)
  }, [loadThread, otherId, userId])

  const selectConversation = useCallback(
    (conversation: Conversation) => {
      setOtherId(conversation.otherId)
      setOtherName(conversation.otherName)
      setOtherRole(conversation.otherRole)
      setOtherAvatarUrl(conversation.otherAvatarUrl)
    },
    []
  )

  const openRecipient = useCallback((option: MessageRecipientOption) => {
    setOtherId(option.id)
    setOtherName(displayName(option.name, option.label || 'Unknown'))
    setOtherRole(option.role ?? null)
    setOtherAvatarUrl(option.avatarUrl ?? null)
  }, [])

  const clearConversation = useCallback(() => {
    setOtherId(null)
    setOtherName('')
    setOtherRole(null)
    setOtherAvatarUrl(null)
    setThread([])
    setThreadState('idle')
  }, [])

  const sendMessage = useCallback(
    async (recipientId: string, body: string, clientKey?: string) => {
      if (!userId || !body.trim() || sendingLock.current) return false
      sendingLock.current = true
      setSending(true)

      const trimmed = body.trim()
      const key = clientKey || createOptimisticId()
      const optimistic: ThreadMessage = {
        id: key,
        clientKey: key,
        sender_id: userId,
        recipient_id: recipientId,
        body: trimmed,
        read_at: null,
        created_at: new Date().toISOString(),
        optimisticStatus: 'sending',
      }

      if (otherIdRef.current === recipientId) {
        setThread((prev) => [...prev.filter((m) => m.clientKey !== key), optimistic])
      } else {
        setOtherId(recipientId)
        const option = recipientOptions.find((entry) => entry.id === recipientId)
        if (option) {
          setOtherName(displayName(option.name, option.label || 'Unknown'))
          setOtherRole(option.role ?? null)
          setOtherAvatarUrl(option.avatarUrl ?? null)
        }
        setThread([optimistic])
        setThreadState('ready')
      }

      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            sender_id: userId,
            recipient_id: recipientId,
            body: trimmed,
          })
          .select('id, sender_id, recipient_id, body, read_at, created_at')
          .single()

        if (error) throw error

        const confirmed = data as MessageRow
        setThread((prev) => reconcileOptimisticMessage(prev, key, confirmed))

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single()
        const senderName =
          (profile as { full_name?: string } | null)?.full_name?.trim() || 'Someone'

        await supabase.from('notifications').insert({
          user_id: recipientId,
          type: 'message',
          title: `New message from ${senderName}`,
          body: trimmed.slice(0, 120),
          link: null,
        })

        void loadConversations()
        return true
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[messaging] send failed', error)
        }
        setThread((prev) =>
          prev.map((message) =>
            message.clientKey === key
              ? { ...message, optimisticStatus: 'failed' as const }
              : message
          )
        )
        toast({
          title: 'Message not sent',
          description: 'Your message was kept so you can retry.',
          variant: 'destructive',
        })
        return false
      } finally {
        sendingLock.current = false
        setSending(false)
      }
    },
    [loadConversations, recipientOptions, supabase, toast, userId]
  )

  const retryMessage = useCallback(
    async (message: ThreadMessage) => {
      if (!message.clientKey || message.optimisticStatus !== 'failed') return
      setThread((prev) => prev.filter((entry) => entry.clientKey !== message.clientKey))
      await sendMessage(message.recipient_id, message.body, message.clientKey)
    },
    [sendMessage]
  )

  const handleRealtimeMessage = useCallback(
    (incoming: MessageRow) => {
      if (!userId) return

      const involvesUser =
        incoming.sender_id === userId || incoming.recipient_id === userId
      if (!involvesUser) return

      const activeOther = otherIdRef.current
      const isActiveThread =
        activeOther &&
        ((incoming.sender_id === userId && incoming.recipient_id === activeOther) ||
          (incoming.recipient_id === userId && incoming.sender_id === activeOther))

      if (isActiveThread) {
        setThread((prev) => upsertRealtimeMessage(prev, incoming))
        if (incoming.recipient_id === userId && !incoming.read_at) {
          void supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', incoming.id)
        }
      }

      void loadConversations()
    },
    [loadConversations, supabase, userId]
  )

  useMessagingRealtime({
    supabase,
    userId,
    enabled: Boolean(userId),
    onMessage: handleRealtimeMessage,
    onStatusChange: setRealtimeStatus,
  })

  return {
    userId,
    authError,
    conversations,
    conversationsState,
    thread,
    threadState,
    otherId,
    otherName,
    otherRole,
    otherAvatarUrl,
    sending,
    realtimeStatus,
    canCompose,
    roleVariant,
    recipientOptions,
    selectConversation,
    openRecipient,
    clearConversation,
    sendMessage,
    retryMessage,
    reloadConversations: loadConversations,
    reloadThread: () => (otherId ? loadThread(otherId) : Promise.resolve()),
  }
}
