'use client'

import { MessagingWorkspace } from '@/components/messaging'

export default function LearnerMessagesPage() {
  return (
    <MessagingWorkspace
      roleVariant="learner"
      emptyMessage="No messages yet. Messages from your facilitators and permitted contacts will appear here."
    />
  )
}
