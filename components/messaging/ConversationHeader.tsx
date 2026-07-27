'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { roleLabel } from './messaging-utils'
import { MessagingAvatar } from './MessagingAvatar'

type ConversationHeaderProps = {
  name: string
  role?: string | null
  avatarUrl?: string | null
  showBack?: boolean
  onBack?: () => void
  className?: string
}

export function ConversationHeader({
  name,
  role,
  avatarUrl,
  showBack,
  onBack,
  className,
}: ConversationHeaderProps) {
  return (
    <header
      className={cn(
        'flex shrink-0 items-center gap-2 border-b border-border/70 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-2 py-2.5 sm:px-4',
        'dark:bg-card/70',
        className
      )}
    >
      {showBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 rounded-xl lg:hidden"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>
      ) : null}

      <MessagingAvatar name={name} avatarUrl={avatarUrl} size="sm" />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-foreground">{name}</h2>
        <p className="truncate text-xs text-muted-foreground">{roleLabel(role)}</p>
      </div>
    </header>
  )
}
