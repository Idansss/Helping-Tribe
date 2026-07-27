'use client'

import { format } from 'date-fns'
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ThreadMessage } from './messaging-types'
import { MessagingAvatar } from './MessagingAvatar'

type MessageBubbleProps = {
  message: ThreadMessage
  isOutgoing: boolean
  showAvatar: boolean
  otherName: string
  otherAvatarUrl?: string | null
  onRetry?: (message: ThreadMessage) => void
}

function formatMessageTime(iso: string) {
  try {
    return format(new Date(iso), 'HH:mm')
  } catch {
    return ''
  }
}

export function MessageBubble({
  message,
  isOutgoing,
  showAvatar,
  otherName,
  otherAvatarUrl,
  onRetry,
}: MessageBubbleProps) {
  const time = formatMessageTime(message.created_at)
  const failed = message.optimisticStatus === 'failed'
  const sending = message.optimisticStatus === 'sending'

  return (
    <div
      className={cn(
        'flex min-w-0 items-end gap-2',
        isOutgoing ? 'justify-end' : 'justify-start',
        showAvatar ? 'mt-3' : 'mt-1'
      )}
    >
      {!isOutgoing ? (
        showAvatar ? (
          <MessagingAvatar
            name={otherName}
            avatarUrl={otherAvatarUrl}
            size="sm"
            className="mb-0.5"
          />
        ) : (
          <span className="size-8 shrink-0" aria-hidden="true" />
        )
      ) : null}

      <div
        className={cn(
          'min-w-0 max-w-[min(100%,34rem)] lg:max-w-[min(100%,40rem)]',
          isOutgoing && 'items-end'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
            isOutgoing
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md bg-[color-mix(in_srgb,var(--surface-muted)_88%,var(--surface))] text-foreground ring-1 ring-border/70 dark:bg-muted dark:ring-border/50',
            failed && 'ring-2 ring-destructive/50'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
          <div
            className={cn(
              'mt-1.5 flex items-center gap-1.5 text-[11px] tabular-nums',
              isOutgoing
                ? 'justify-end text-primary-foreground/75'
                : 'justify-start text-muted-foreground'
            )}
          >
            {sending ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                Sending
              </span>
            ) : failed ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  isOutgoing ? 'text-primary-foreground/90' : 'text-destructive'
                )}
              >
                <AlertCircle className="size-3" aria-hidden="true" />
                Not sent
              </span>
            ) : (
              <span>{time}</span>
            )}
          </div>
        </div>

        {failed && onRetry ? (
          <div className={cn('mt-1.5', isOutgoing && 'flex justify-end')}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 rounded-lg"
              onClick={() => onRetry(message)}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
