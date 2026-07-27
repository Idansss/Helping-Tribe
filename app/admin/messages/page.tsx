'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessagingWorkspace } from '@/components/messaging'
import type { MessageRecipientOption } from '@/components/messaging'
import { createClient } from '@/lib/supabase/client'

function AdminMessagesContent() {
  const searchParams = useSearchParams()
  const toId = searchParams.get('to')
  const [recipientOptions, setRecipientOptions] = useState<MessageRecipientOption[]>([])

  useEffect(() => {
    let active = true
    const supabase = createClient()
    async function loadUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .order('full_name')
      if (!active) return
      const opts = (data ?? []).map(
        (profile: {
          id: string
          full_name: string | null
          role: string
          avatar_url: string | null
        }) => ({
          id: profile.id,
          name: profile.full_name || 'Unnamed',
          role: profile.role,
          avatarUrl: profile.avatar_url,
          label: `${profile.full_name || 'Unnamed'} (${profile.role})`,
        })
      )
      setRecipientOptions(opts)
    }
    void loadUsers()
    return () => {
      active = false
    }
  }, [])

  return (
    <MessagingWorkspace
      canCompose
      initialToId={toId}
      recipientOptions={recipientOptions}
      roleVariant="admin"
      emptyMessage="No conversations yet. Start a message with a learner or staff member."
    />
  )
}

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading messages…
        </div>
      }
    >
      <AdminMessagesContent />
    </Suspense>
  )
}
