'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { Conversation, ConversationFilter, MessagingRoleVariant } from './messaging-types'
import { ConversationList } from './ConversationList'
import { ConversationSearch } from './ConversationSearch'

type ConversationSidebarProps = {
  conversations: Conversation[]
  selectedId: string | null
  loading: boolean
  error: boolean
  search: string
  filter: ConversationFilter
  roleVariant: MessagingRoleVariant
  emptyMessage?: string
  canCompose?: boolean
  className?: string
  onSearchChange: (value: string) => void
  onFilterChange: (filter: ConversationFilter) => void
  onSelect: (conversation: Conversation) => void
  onRetry: () => void
  onCompose?: () => void
}

export function ConversationSidebar({
  conversations,
  selectedId,
  loading,
  error,
  search,
  filter,
  roleVariant,
  emptyMessage,
  canCompose,
  className,
  onSearchChange,
  onFilterChange,
  onSelect,
  onRetry,
  onCompose,
}: ConversationSidebarProps) {
  return (
    <aside
      className={cn(
        'flex min-h-0 w-full flex-col border-border/80 bg-[color-mix(in_srgb,var(--surface)_92%,var(--surface-muted))]',
        'dark:bg-card/60 lg:w-[min(100%,22.5rem)] lg:shrink-0 lg:border-r',
        className
      )}
      aria-label="Conversation list"
    >
      <div className="shrink-0 space-y-3 border-b border-border/70 px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Messages</h2>
            <p className="text-xs text-muted-foreground">Direct conversations</p>
          </div>
          {canCompose ? (
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 rounded-xl"
              onClick={onCompose}
            >
              <Plus className="size-4" aria-hidden="true" />
              New
            </Button>
          ) : null}
        </div>

        <ConversationSearch value={search} onChange={onSearchChange} />

        <div
          className="grid grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1"
          role="tablist"
          aria-label="Conversation filters"
        >
          {([
            ['all', 'All'],
            ['unread', 'Unread'],
          ] as const).map(([value, label]) => {
            const active = filter === value
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(value)}
                className={cn(
                  'h-8 rounded-lg text-xs font-semibold transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        loading={loading}
        error={error}
        searchTerm={search}
        roleVariant={roleVariant}
        emptyMessage={emptyMessage}
        canCompose={canCompose}
        onSelect={onSelect}
        onRetry={onRetry}
        onCompose={onCompose}
        onClearSearch={() => onSearchChange('')}
      />
    </aside>
  )
}
