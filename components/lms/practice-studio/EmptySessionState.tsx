'use client'

import { cn } from '@/lib/utils/cn'
import type { PracticePersona } from './personas'

type EmptySessionStateProps = {
  persona: PracticePersona
  onBegin: (prompt?: string) => void
  onInsertPrompt?: (prompt: string) => void
  disabled?: boolean
}

export function EmptySessionState({
  persona,
  onBegin,
  onInsertPrompt,
  disabled,
}: EmptySessionStateProps) {
  const Icon = persona.Icon

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 text-center">
      <div
        className={cn(
          'grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm',
          persona.accent
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </div>

      <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        Begin with {persona.name}
      </h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        {persona.emptyIntro}
      </p>

      <div
        className="mt-5 flex w-full max-w-xl flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Starter prompts"
      >
        {persona.starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (onInsertPrompt) onInsertPrompt(prompt)
              else onBegin(prompt)
            }}
            className={cn(
              'rounded-full border border-border/80 bg-background/90 px-3.5 py-2 text-left text-xs text-foreground shadow-sm transition-colors sm:text-sm',
              'hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
