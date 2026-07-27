'use client'

import { ConversationListSkeleton } from '@/components/lms/LoadingSkeletons'
import type { Conversation } from './messaging-types'
import type { MessagingRoleVariant } from './messaging-types'
import { ConversationListItem } from './ConversationListItem'
import { MessagingEmptyState, MessagingErrorState } from './MessagingEmptyState'

type ConversationListProps = {
  conversations: Conversation[]
  selectedId: string | null
  loading: boolean
  error: boolean
  searchTerm: string
  roleVariant: MessagingRoleVariant
  emptyMessage?: string
  canCompose?: boolean
  onSelect: (conversation: Conversation) => void
  onRetry: () => void
  onCompose?: () => void
  onClearSearch?: () => void
}

export function ConversationList({
  conversations,
  selectedId,
  loading,
  error,
  searchTerm,
  roleVariant,
  emptyMessage,
  canCompose,
  onSelect,
  onRetry,
  onCompose,
  onClearSearch,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <MessagingErrorState
        title="Conversations unavailable"
        description="We could not load your conversations. Try again."
        onRetry={onRetry}
      />
    )
  }

  if (conversations.length === 0 && searchTerm.trim()) {
    return (
      <MessagingEmptyState
        variant="search"
        searchTerm={searchTerm.trim()}
        onClearSearch={onClearSearch}
      />
    )
  }

  if (conversations.length === 0) {
    return (
      <MessagingEmptyState
        variant="inbox"
        roleVariant={roleVariant}
        emptyMessage={emptyMessage}
        canCompose={canCompose}
        onCompose={onCompose}
      />
    )
  }

  return (
    <ul
      className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto overscroll-contain"
      aria-label="Conversations"
    >
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.otherId}
          conversation={conversation}
          selected={selectedId === conversation.otherId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
