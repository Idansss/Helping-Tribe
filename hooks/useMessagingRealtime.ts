'use client'

import { useEffect, useRef } from 'react'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import type { MessageRow } from '@/components/messaging/messaging-types'

type UseMessagingRealtimeOptions = {
  supabase: SupabaseClient
  userId: string | null
  enabled?: boolean
  onMessage: (message: MessageRow) => void
  onStatusChange?: (status: 'connecting' | 'subscribed' | 'unavailable' | 'error') => void
}

/**
 * Subscribes to messages involving the current user.
 * Requires the `messages` table to be part of the Supabase Realtime publication.
 * Falls back silently when Realtime is unavailable — callers should keep manual refresh.
 */
export function useMessagingRealtime({
  supabase,
  userId,
  enabled = true,
  onMessage,
  onStatusChange,
}: UseMessagingRealtimeOptions) {
  const onMessageRef = useRef(onMessage)
  const onStatusRef = useRef(onStatusChange)
  onMessageRef.current = onMessage
  onStatusRef.current = onStatusChange

  useEffect(() => {
    if (!enabled || !userId) return

    let channel: RealtimeChannel | null = null
    let cleaned = false

    onStatusRef.current?.('connecting')

    try {
      channel = supabase
        .channel(`dm:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as MessageRow | null
            if (row?.id) onMessageRef.current(row)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as MessageRow | null
            if (row?.id) onMessageRef.current(row)
          }
        )
        .subscribe((status) => {
          if (cleaned) return
          if (status === 'SUBSCRIBED') {
            onStatusRef.current?.('subscribed')
            return
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            onStatusRef.current?.('unavailable')
          }
        })
    } catch {
      onStatusRef.current?.('unavailable')
    }

    return () => {
      cleaned = true
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [enabled, supabase, userId])
}
