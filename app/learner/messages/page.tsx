'use client'

import { MessageInbox } from '@/components/lms/MessageInbox'

export default function LearnerMessagesPage() {
  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm">
        Your inbox for messages from facilitators and peers. Use Discussions for module-based conversations.
      </p>
      <MessageInbox
        title="Messages"
        emptyMessage="No messages yet. When a facilitator or peer sends you a message, it will appear here. You can reply from this page."
      />
    </div>
  )
}
