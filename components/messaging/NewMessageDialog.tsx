'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils/cn'
import type { MessageRecipientOption } from './messaging-types'
import {
  filterRecipients,
  recipientDisplayLabel,
  roleLabel,
} from './messaging-utils'
import { MessagingAvatar } from './MessagingAvatar'

type NewMessageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipients: MessageRecipientOption[]
  onSelect: (recipient: MessageRecipientOption) => void
  loading?: boolean
  error?: boolean
}

function RecipientPickerBody({
  recipients,
  query,
  onQueryChange,
  onSelect,
  loading,
  error,
}: {
  recipients: MessageRecipientOption[]
  query: string
  onQueryChange: (value: string) => void
  onSelect: (recipient: MessageRecipientOption) => void
  loading?: boolean
  error?: boolean
}) {
  const filtered = useMemo(
    () => filterRecipients(recipients, query),
    [query, recipients]
  )

  const grouped = useMemo(() => {
    const map = new Map<string, MessageRecipientOption[]>()
    for (const recipient of filtered) {
      const key = roleLabel(recipient.role)
      const list = map.get(key) ?? []
      list.push(recipient)
      map.set(key, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <label className="relative block shrink-0">
        <span className="sr-only">Search recipients</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by name or role"
          className="h-11 rounded-xl pl-9"
          autoFocus
        />
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border border-border/70">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading recipients…
          </p>
        ) : error ? (
          <p className="px-4 py-8 text-center text-sm text-destructive" role="alert">
            We could not load recipients. Close and try again.
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {query.trim()
              ? `No recipients matched “${query.trim()}”.`
              : 'No permitted recipients available.'}
          </p>
        ) : (
          grouped.map(([group, people]) => (
            <div key={group} className="border-b border-border/50 last:border-b-0">
              <p className="sticky top-0 bg-muted/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                {group}
              </p>
              <ul>
                {people.map((recipient) => (
                  <li key={recipient.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(recipient)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors',
                        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
                      )}
                    >
                      <MessagingAvatar
                        name={recipient.name || recipientDisplayLabel(recipient)}
                        avatarUrl={recipient.avatarUrl}
                        size="sm"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {recipient.name || 'Unnamed'}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {roleLabel(recipient.role)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function NewMessageDialog({
  open,
  onOpenChange,
  recipients,
  onSelect,
  loading,
  error,
}: NewMessageDialogProps) {
  const isDesktop = useMediaQuery(768)
  const [query, setQuery] = useState('')

  const handleOpenChange = (next: boolean) => {
    if (!next) setQuery('')
    onOpenChange(next)
  }

  const handleSelect = (recipient: MessageRecipientOption) => {
    onSelect(recipient)
    setQuery('')
    onOpenChange(false)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-[min(36rem,85dvh)] flex-col gap-4 overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>
              Choose someone you are permitted to message.
            </DialogDescription>
          </DialogHeader>
          <RecipientPickerBody
            recipients={recipients}
            query={query}
            onQueryChange={setQuery}
            onSelect={handleSelect}
            loading={loading}
            error={error}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[min(88dvh,40rem)] p-0">
        <SheetHeader className="px-5 pb-2 pt-5 text-left">
          <SheetTitle>New message</SheetTitle>
          <SheetDescription>
            Choose someone you are permitted to message.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-5">
          <RecipientPickerBody
            recipients={recipients}
            query={query}
            onQueryChange={setQuery}
            onSelect={handleSelect}
            loading={loading}
            error={error}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
