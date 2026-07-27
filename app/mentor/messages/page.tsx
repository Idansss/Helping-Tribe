'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessagingWorkspace } from '@/components/messaging'
import type { MessageRecipientOption } from '@/components/messaging'
import { createClient } from '@/lib/supabase/client'

function MentorMessagesContent() {
  const searchParams = useSearchParams()
  const toId = searchParams.get('to')
  const [recipientOptions, setRecipientOptions] = useState<MessageRecipientOption[]>([])

  useEffect(() => {
    let active = true
    const supabase = createClient()
    async function loadStudents() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('role', 'student')
        .order('full_name')
      if (!active) return
      const opts = (data ?? []).map(
        (profile: {
          id: string
          full_name: string | null
          role: string | null
          avatar_url: string | null
        }) => ({
          id: profile.id,
          name: profile.full_name || 'Unnamed learner',
          role: profile.role || 'student',
          avatarUrl: profile.avatar_url,
        })
      )
      setRecipientOptions(opts)
    }
    void loadStudents()
    return () => {
      active = false
    }
  }, [])

  return (
    <MessagingWorkspace
      canCompose
      initialToId={toId}
      recipientOptions={recipientOptions}
      roleVariant="mentor"
      emptyMessage="No learner conversations yet. Start a message when support or follow-up is needed."
    />
  )
}

export default function MentorMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading messages…
        </div>
      }
    >
      <MentorMessagesContent />
    </Suspense>
  )
}
