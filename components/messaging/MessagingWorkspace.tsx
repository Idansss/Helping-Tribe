'use client'

import { useMemo, useState } from 'react'
import { useMessaging } from '@/hooks/useMessaging'
import { cn } from '@/lib/utils/cn'
import type {
  ConversationFilter,
  MessagingWorkspaceProps,
} from './messaging-types'
import { filterConversations } from './messaging-utils'
import { ConversationHeader } from './ConversationHeader'
import { ConversationSidebar } from './ConversationSidebar'
import { MessageComposer } from './MessageComposer'
import { MessageThread } from './MessageThread'
import { MessagingEmptyState, MessagingErrorState } from './MessagingEmptyState'
import { NewMessageDialog } from './NewMessageDialog'

export function MessagingWorkspace({
  canCompose = false,
  initialToId = null,
  recipientOptions = [],
  roleVariant = 'learner',
  emptyMessage,
}: MessagingWorkspaceProps) {
  const messaging = useMessaging({
    canCompose,
    initialToId,
    recipientOptions,
    roleVariant,
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ConversationFilter>('all')
  const [draft, setDraft] = useState('')
  const [newOpen, setNewOpen] = useState(false)

  const visibleConversations = useMemo(
    () => filterConversations(messaging.conversations, search, filter),
    [filter, messaging.conversations, search]
  )

  const showCompose = canCompose && recipientOptions.length > 0
  const threadOpen = Boolean(messaging.otherId)

  if (messaging.authError) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <MessagingErrorState
          title="Session expired"
          description="Sign in again to access your messages."
        />
      </div>
    )
  }

  if (!messaging.userId) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading messages…
      </div>
    )
  }

  return (
    <div
      className={cn(
        'messaging-workspace flex min-h-0 flex-1 overflow-hidden',
        'bg-[color-mix(in_srgb,var(--canvas)_90%,var(--surface-muted))] dark:bg-background'
      )}
    >
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <ConversationSidebar
          className={cn(threadOpen ? 'hidden lg:flex' : 'flex')}
          conversations={visibleConversations}
          selectedId={messaging.otherId}
          loading={messaging.conversationsState === 'loading'}
          error={messaging.conversationsState === 'error'}
          search={search}
          filter={filter}
          roleVariant={roleVariant}
          emptyMessage={emptyMessage}
          canCompose={showCompose}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onSelect={messaging.selectConversation}
          onRetry={() => void messaging.reloadConversations()}
          onCompose={() => setNewOpen(true)}
        />

        <section
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] dark:bg-background',
            threadOpen ? 'flex' : 'hidden lg:flex'
          )}
          aria-label="Active conversation"
        >
          {!messaging.otherId ? (
            <MessagingEmptyState
              variant="thread"
              canCompose={showCompose}
              onCompose={() => setNewOpen(true)}
            />
          ) : (
            <>
              <ConversationHeader
                name={messaging.otherName}
                role={messaging.otherRole}
                avatarUrl={messaging.otherAvatarUrl}
                showBack
                onBack={messaging.clearConversation}
              />

              <MessageThread
                messages={messaging.thread}
                userId={messaging.userId}
                otherName={messaging.otherName}
                otherAvatarUrl={messaging.otherAvatarUrl}
                loading={messaging.threadState === 'loading'}
                error={messaging.threadState === 'error'}
                threadKey={messaging.otherId}
                onRetryLoad={() => void messaging.reloadThread()}
                onRetrySend={(message) => void messaging.retryMessage(message)}
              />

              <MessageComposer
                value={draft}
                onChange={setDraft}
                recipientName={messaging.otherName}
                sending={messaging.sending}
                onSend={() => {
                  const body = draft
                  if (!body.trim() || !messaging.otherId) return
                  setDraft('')
                  void messaging.sendMessage(messaging.otherId, body).then((ok) => {
                    // Failed sends remain in the thread with Retry; restore draft only if
                    // the optimistic bubble could not be created.
                    if (!ok) {
                      setDraft((current) => (current.trim() ? current : body))
                    }
                  })
                }}
              />
            </>
          )}
        </section>
      </div>

      {showCompose ? (
        <NewMessageDialog
          open={newOpen}
          onOpenChange={setNewOpen}
          recipients={recipientOptions}
          onSelect={(recipient) => {
            messaging.openRecipient(recipient)
            setDraft('')
          }}
        />
      ) : null}
    </div>
  )
}
