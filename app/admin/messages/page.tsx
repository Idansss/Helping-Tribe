'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageInbox } from '@/components/lms/MessageInbox'
import { createClient } from '@/lib/supabase/client'

function AdminMessagesContent() {
  const searchParams = useSearchParams()
  const toId = searchParams.get('to')
  const supabase = createClient()
  const [recipientOptions, setRecipientOptions] = useState<{ id: string; label: string }[]>([])

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name')
      const opts = (data ?? []).map((p: { id: string; full_name: string | null; role: string }) => ({
        id: p.id,
        label: `${p.full_name || 'Unnamed'} (${p.role})`,
      }))
      setRecipientOptions(opts)
    }
    loadUsers()
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm">
        Message any user (learners, mentors, admins). They will see your messages in their Messages inbox and can reply.
      </p>
      <MessageInbox
        canCompose
        initialToId={toId}
        recipientOptions={recipientOptions}
        title="Messages"
        emptyMessage="No conversations yet. Use &quot;New message&quot; to start a conversation."
      />
    </div>
  )
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 py-6">Loading…</div>}>
      <AdminMessagesContent />
    </Suspense>
  )
}
