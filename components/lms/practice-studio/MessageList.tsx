'use client'

import { memo, useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { PracticePersona } from './personas'
import type { PracticeMessage } from './types'

type MessageListProps = {
  messages: PracticeMessage[]
  persona: PracticePersona
  isTyping: boolean
  endRef?: RefObject<HTMLDivElement | null>
  reducedMotion?: boolean
}

function formatTime(value: Date) {
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const MessageRow = memo(function MessageRow({
  message,
  persona,
}: {
  message: PracticeMessage
  persona: PracticePersona
}) {
  const isLearner = message.role === 'user'
  const time = formatTime(message.timestamp)
  const Icon = persona.Icon

  return (
    <div
      className={cn(
        'flex min-w-0 gap-3',
        isLearner ? 'justify-end' : 'justify-start'
      )}
    >
      {!isLearner ? (
        <div
          className={cn(
            'mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white',
            persona.accent
          )}
          aria-hidden="true"
        >
          <Icon className="size-3.5" />
        </div>
      ) : null}

      <div className={cn('min-w-0 max-w-[min(100%,42rem)]', isLearner && 'max-w-[min(100%,36rem)]')}>
        <div className={cn('mb-1 flex items-baseline gap-2', isLearner && 'justify-end')}>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {isLearner ? 'You' : persona.name}
          </span>
          {time ? (
            <span className="text-[11px] tabular-nums text-muted-foreground/70">{time}</span>
          ) : null}
        </div>
        <div
          className={cn(
            'text-sm leading-relaxed',
            isLearner
              ? 'rounded-2xl rounded-br-md bg-[color-mix(in_srgb,var(--brand-primary)_12%,var(--surface))] px-3.5 py-2.5 text-foreground ring-1 ring-[color-mix(in_srgb,var(--brand-primary)_22%,transparent)] dark:bg-[color-mix(in_srgb,var(--brand-primary)_22%,transparent)] dark:ring-primary/30'
              : 'text-foreground'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {!isLearner ? (
          <p className="mt-1 text-[11px] text-muted-foreground">Simulated client</p>
        ) : null}
      </div>
    </div>
  )
})

export function MessageList({
  messages,
  persona,
  isTyping,
  endRef,
  reducedMotion,
}: MessageListProps) {
  const Icon = persona.Icon
  const scrollRef = useRef<HTMLDivElement>(null)
  const [stickToBottom, setStickToBottom] = useState(true)
  const [showJump, setShowJump] = useState(false)

  const updateStickiness = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    const nearBottom = distance < 80
    setStickToBottom(nearBottom)
    setShowJump(!nearBottom && messages.length > 0)
  }, [messages.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateStickiness, { passive: true })
    updateStickiness()
    return () => el.removeEventListener('scroll', updateStickiness)
  }, [updateStickiness])

  useEffect(() => {
    if (!stickToBottom) return
    endRef?.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [messages, isTyping, stickToBottom, endRef, reducedMotion])

  const jumpToLatest = () => {
    setStickToBottom(true)
    endRef?.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Practice conversation"
      >
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-5">
          {messages.map((message, index) => (
            <MessageRow
              key={`${message.role}-${index}-${typeof message.timestamp === 'string' ? message.timestamp : message.timestamp?.valueOf?.() ?? index}`}
              message={message}
              persona={persona}
            />
          ))}

          {isTyping ? (
            <div className="flex gap-3" aria-live="polite" aria-label={`${persona.name} is responding`}>
              <div
                className={cn(
                  'mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white',
                  persona.accent
                )}
                aria-hidden="true"
              >
                <Icon className="size-3.5" />
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-[studio-typing_1.2s_ease-in-out_infinite] motion-reduce:animate-none" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-[studio-typing_1.2s_ease-in-out_infinite] [animation-delay:0.15s] motion-reduce:animate-none" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-[studio-typing_1.2s_ease-in-out_infinite] [animation-delay:0.3s] motion-reduce:animate-none" />
                </div>
                <span className="sr-only">{persona.name} is composing a response</span>
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      {showJump ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto h-8 gap-1.5 rounded-full border border-border bg-background/95 shadow-md backdrop-blur-sm"
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
