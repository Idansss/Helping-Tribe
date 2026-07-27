'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConversationScroll } from '@/hooks/useConversationScroll'
import { cn } from '@/lib/utils/cn'
import type { ThreadMessage } from './messaging-types'
import { groupMessagesByDate, shouldShowAvatar } from './messaging-utils'
import { MessageBubble } from './MessageBubble'
import { MessagingErrorState } from './MessagingEmptyState'

type MessageThreadProps = {
  messages: ThreadMessage[]
  userId: string
  otherName: string
  otherAvatarUrl?: string | null
  loading: boolean
  error: boolean
  threadKey: string | null
  onRetryLoad: () => void
  onRetrySend: (message: ThreadMessage) => void
}

export function MessageThread({
  messages,
  userId,
  otherName,
  otherAvatarUrl,
  loading,
  error,
  threadKey,
  onRetryLoad,
  onRetrySend,
}: MessageThreadProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const { scrollRef, endRef, showJump, jumpToLatest } = useConversationScroll({
    messageCount: messages.length,
    reducedMotion,
    threadKey,
  })

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Loading conversation</span>
      </div>
    )
  }

  if (error) {
    return (
      <MessagingErrorState
        title="Conversation unavailable"
        description="We could not load this conversation. Try again."
        onRetry={onRetryLoad}
      />
    )
  }

  const groups = groupMessagesByDate(messages)

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 sm:px-5"
        role="log"
        aria-label={`Conversation with ${otherName}`}
        aria-relevant="additions"
      >
        <div className="mx-auto flex w-full max-w-[52rem] flex-col">
          {(() => {
            let runningIndex = 0
            return groups.map((group) => (
              <section key={group.key} aria-label={group.label} className="space-y-1">
                <div className="sticky top-0 z-[1] flex justify-center py-2">
                  <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
                    {group.label}
                  </span>
                </div>
                {group.messages.map((message) => {
                  const index = runningIndex
                  runningIndex += 1
                  const isOutgoing = message.sender_id === userId
                  return (
                    <MessageBubble
                      key={message.clientKey || message.id}
                      message={message}
                      isOutgoing={isOutgoing}
                      showAvatar={shouldShowAvatar(messages, index, userId)}
                      otherName={otherName}
                      otherAvatarUrl={otherAvatarUrl}
                      onRetry={onRetrySend}
                    />
                  )
                })}
              </section>
            ))
          })()}
          <div ref={endRef} />
        </div>
      </div>

      {showJump ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className={cn(
              'pointer-events-auto h-8 gap-1.5 rounded-full border border-border bg-background/95 shadow-md backdrop-blur-sm',
              'duration-200 motion-reduce:transition-none'
            )}
            onClick={jumpToLatest}
          >
            <ArrowDown className="size-3.5" aria-hidden="true" />
            Jump to latest
          </Button>
        </div>
      ) : null}
    </div>
  )
}
