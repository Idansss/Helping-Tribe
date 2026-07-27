'use client'

import { BookOpen, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { PersonaSelector } from './PersonaSelector'
import type { PersonaKey, PracticePersona } from './personas'
import type { SessionStatus } from './types'

type PracticeToolbarProps = {
  persona: PracticePersona
  personaKey: PersonaKey
  status: SessionStatus
  onPersonaSelect: (key: PersonaKey) => void
  onOpenGuide: () => void
  onReset: () => void
  disabled?: boolean
}

const STATUS_LABEL: Record<SessionStatus, string> = {
  loading: 'Preparing…',
  not_started: 'Simulation ready',
  in_progress: 'In progress',
  ready_for_reflection: 'Ready to reflect',
}

export function PracticeToolbar({
  persona,
  personaKey,
  status,
  onPersonaSelect,
  onOpenGuide,
  onReset,
  disabled,
}: PracticeToolbarProps) {
  const Icon = persona.Icon
  const ready = status === 'not_started' || status === 'in_progress' || status === 'ready_for_reflection'

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-[color-mix(in_srgb,var(--surface)_92%,var(--surface-muted))] px-3 sm:h-16 sm:gap-3 sm:px-4"
      aria-label="Practice session toolbar"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm sm:size-10',
            persona.accent
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-foreground sm:text-[15px]">
            {persona.name}
            <span className="font-normal text-muted-foreground"> · {persona.shortLabel}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
            <span
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                ready ? 'bg-emerald-500' : 'bg-muted-foreground/50',
                status === 'not_started' && 'motion-safe:animate-pulse'
              )}
              aria-hidden="true"
            />
            <span aria-live="polite">{STATUS_LABEL[status]}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto hidden min-w-0 lg:block">
        <PersonaSelector
          activeKey={personaKey}
          onSelect={onPersonaSelect}
          disabled={disabled}
          variant="chips"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
        <div className="lg:hidden">
          <PersonaSelector
            activeKey={personaKey}
            onSelect={onPersonaSelect}
            disabled={disabled}
            variant="dropdown"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5 text-muted-foreground"
          onClick={onOpenGuide}
          aria-label="Open session guide"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Guide</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5 text-muted-foreground"
          onClick={onReset}
          disabled={disabled}
          aria-label="Reset practice session"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </header>
  )
}
