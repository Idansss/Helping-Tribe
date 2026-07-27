'use client'

import { useEffect, useRef } from 'react'
import { Loader2, SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import { useMediaQuery } from '@/hooks/use-media-query'

const MAX_COMPOSER_HEIGHT = 160

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  sending?: boolean
  recipientName?: string
  error?: string | null
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  disabled,
  sending,
  recipientName,
  error,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isDesktop = useMediaQuery(1024)
  const canSend = Boolean(value.trim()) && !disabled && !sending

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT)}px`
  }, [value])

  return (
    <div className="shrink-0 border-t border-border/70 bg-[color-mix(in_srgb,var(--surface)_96%,var(--surface-muted))] px-3 py-3 sm:px-4 dark:bg-card/80">
      {error ? (
        <p className="mb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border border-border/80 bg-background p-2 shadow-[var(--shadow-soft)]',
          'focus-within:ring-2 focus-within:ring-ring/40'
        )}
      >
        <div className="min-w-0 flex-1">
          <Label htmlFor="messaging-composer" className="sr-only">
            Message{recipientName ? ` to ${recipientName}` : ''}
          </Label>
          <Textarea
            ref={textareaRef}
            id="messaging-composer"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              // Desktop: Enter sends, Shift+Enter newline. Mobile: Enter inserts newline.
              if (isDesktop && !event.shiftKey) {
                event.preventDefault()
                if (canSend) onSend()
              }
            }}
            placeholder="Write a message…"
            disabled={disabled || sending}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[160px] resize-none border-0 bg-transparent px-2 py-2.5 shadow-none focus-visible:ring-0',
              'placeholder:text-muted-foreground/70'
            )}
            aria-describedby="messaging-composer-hint"
          />
          <p id="messaging-composer-hint" className="sr-only">
            {isDesktop
              ? 'Press Enter to send. Press Shift Enter for a new line.'
              : 'Press Enter for a new line. Use the send button to send.'}
          </p>
        </div>

        <Button
          type="button"
          size="icon"
          className="size-11 shrink-0 rounded-xl"
          disabled={!canSend}
          aria-label={sending ? 'Sending message' : 'Send message'}
          onClick={() => {
            if (canSend) onSend()
          }}
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <SendHorizontal className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  )
}
