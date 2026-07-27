'use client'

import { AlertCircle, Inbox, MessageSquare, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { MessagingRoleVariant } from './messaging-types'
import { emptyInboxCopy } from './messaging-utils'

type MessagingEmptyStateProps = {
  variant: 'inbox' | 'thread' | 'search'
  roleVariant?: MessagingRoleVariant
  emptyMessage?: string
  searchTerm?: string
  canCompose?: boolean
  onCompose?: () => void
  onClearSearch?: () => void
  className?: string
}

export function MessagingEmptyState({
  variant,
  roleVariant = 'learner',
  emptyMessage,
  searchTerm,
  canCompose,
  onCompose,
  onClearSearch,
  className,
}: MessagingEmptyStateProps) {
  if (variant === 'search') {
    return (
      <div
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center',
          className
        )}
      >
        <SearchX className="size-8 text-muted-foreground/70" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No matches</p>
          <p className="text-sm text-muted-foreground">
            Nothing matched{searchTerm ? ` “${searchTerm}”` : ''}.
          </p>
        </div>
        {onClearSearch ? (
          <Button type="button" variant="outline" size="sm" onClick={onClearSearch}>
            Clear search
          </Button>
        ) : null}
      </div>
    )
  }

  if (variant === 'thread') {
    return (
      <div
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center',
          className
        )}
        role="status"
      >
        <MessageSquare className="size-10 text-muted-foreground/55" aria-hidden="true" />
        <div className="max-w-sm space-y-1.5">
          <p className="text-base font-semibold text-foreground">Select a conversation</p>
          <p className="text-sm text-muted-foreground">
            Choose someone from the list to read messages and reply.
          </p>
        </div>
        {canCompose && onCompose ? (
          <Button type="button" size="sm" onClick={onCompose}>
            New message
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center',
        className
      )}
      role="status"
    >
      <Inbox className="size-9 text-muted-foreground/60" aria-hidden="true" />
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {emptyInboxCopy(roleVariant, emptyMessage)}
      </p>
      {canCompose && onCompose ? (
        <Button type="button" size="sm" onClick={onCompose}>
          New message
        </Button>
      ) : null}
    </div>
  )
}

type MessagingErrorStateProps = {
  title: string
  description: string
  onRetry?: () => void
  className?: string
}

export function MessagingErrorState({
  title,
  description,
  onRetry,
  className,
}: MessagingErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center',
        className
      )}
      role="alert"
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
