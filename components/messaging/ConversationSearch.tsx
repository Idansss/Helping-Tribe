'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

type ConversationSearchProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ConversationSearch({
  value,
  onChange,
  className,
}: ConversationSearchProps) {
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">Search conversations</span>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search name, role, or message"
        className="h-10 rounded-xl border-border/80 bg-background/80 pl-9"
      />
    </label>
  )
}
