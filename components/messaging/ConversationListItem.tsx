'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import type { Conversation } from './messaging-types'
import { roleLabel } from './messaging-utils'
import { MessagingAvatar } from './MessagingAvatar'

type ConversationListItemProps = {
  conversation: Conversation
  selected: boolean
  onSelect: (conversation: Conversation) => void
}

export function ConversationListItem({
  conversation,
  selected,
  onSelect,
}: ConversationListItemProps) {
  const unread = conversation.unreadCount > 0
  const relativeTime = (() => {
    try {
      return formatDistanceToNow(new Date(conversation.lastAt), { addSuffix: true })
    } catch {
      return ''
    }
  })()

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation)}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'group relative flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-150 motion-reduce:transition-none',
          'hover:bg-[color-mix(in_srgb,var(--brand-primary)_6%,transparent)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
          selected
            ? 'bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] dark:bg-[color-mix(in_srgb,var(--brand-primary)_18%,transparent)]'
            : unread
              ? 'bg-[color-mix(in_srgb,var(--surface-muted)_70%,transparent)]'
              : 'bg-transparent'
        )}
      >
        {selected ? (
          <span
            aria-hidden="true"
            className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary"
          />
        ) : null}

        <MessagingAvatar
          name={conversation.otherName}
          avatarUrl={conversation.otherAvatarUrl}
        />

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span
              className={cn(
                'truncate text-sm text-foreground',
                unread ? 'font-semibold' : 'font-medium'
              )}
            >
              {conversation.otherName}
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {relativeTime}
            </span>
          </span>

          <span className="mt-0.5 flex items-center gap-2">
            <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {roleLabel(conversation.otherRole)}
            </span>
            {unread ? (
              <span
                className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground"
                aria-label={`${conversation.unreadCount} unread messages`}
              >
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            ) : null}
          </span>

          <span
            className={cn(
              'mt-1 line-clamp-2 break-words text-xs leading-relaxed',
              unread ? 'text-foreground/80' : 'text-muted-foreground'
            )}
          >
            {conversation.lastMessage}
          </span>
        </span>
      </button>
    </li>
  )
}
