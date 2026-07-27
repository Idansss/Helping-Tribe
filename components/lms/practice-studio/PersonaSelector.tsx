'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils/cn'
import { PERSONA_ORDER, PRACTICE_PERSONAS, type PersonaKey, type PracticePersona } from './personas'

type PersonaSelectorProps = {
  activeKey: PersonaKey
  onSelect: (key: PersonaKey) => void
  disabled?: boolean
  /** Compact segmented chips, model-style dropdown, or plain list. */
  variant?: 'chips' | 'dropdown' | 'list'
  className?: string
}

function PersonaDetails({ persona }: { persona: PracticePersona }) {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-semibold text-foreground">
          {persona.name} · {persona.ageLabel}
        </p>
        <p className="mt-0.5 text-muted-foreground">{persona.scenario}</p>
      </div>
      <p className="leading-relaxed text-foreground/90">{persona.description}</p>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Skills to practise
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {persona.focus.map((skill) => (
            <li
              key={skill}
              className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium', persona.accentSoft)}
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PersonaOptionButton({
  persona,
  selected,
  disabled,
  onSelect,
}: {
  persona: PracticePersona
  selected: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  const Icon = persona.Icon
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary/40 bg-primary/8'
          : 'border-transparent hover:bg-accent/60',
        disabled && 'opacity-60'
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white',
          persona.accent
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{persona.name}</span>
          {selected ? <Check className="size-3.5 text-primary" aria-hidden="true" /> : null}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{persona.shortLabel}</span>
      </span>
    </button>
  )
}

export function PersonaSelector({
  activeKey,
  onSelect,
  disabled,
  variant = 'chips',
  className,
}: PersonaSelectorProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const active = PRACTICE_PERSONAS[activeKey]
  const ActiveIcon = active.Icon

  if (variant === 'list') {
    return (
      <div role="listbox" aria-label="Simulated clients" className={cn('space-y-1', className)}>
        {PERSONA_ORDER.map((key) => (
          <PersonaOptionButton
            key={key}
            persona={PRACTICE_PERSONAS[key]}
            selected={key === activeKey}
            disabled={disabled}
            onSelect={() => onSelect(key)}
          />
        ))}
        <div className="mt-3 rounded-xl border border-border/70 bg-muted/30 p-3">
          <PersonaDetails persona={active} />
        </div>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <>
        <Popover open={detailsOpen} onOpenChange={setDetailsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'hidden h-10 items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-2.5 text-left transition-colors hover:bg-accent/50 md:inline-flex',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                disabled && 'opacity-60',
                className
              )}
              aria-label={`Simulated client: ${active.name}. Change client.`}
              aria-haspopup="dialog"
            >
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-lg bg-gradient-to-br text-white',
                  active.accent
                )}
              >
                <ActiveIcon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight text-foreground">
                  {active.name}
                </span>
                <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                  {active.shortLabel}
                </span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-80 border-border bg-popover p-2 text-popover-foreground"
          >
            <p className="px-2 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Change simulated client
            </p>
            <div role="listbox" aria-label="Simulated clients">
              {PERSONA_ORDER.map((key) => (
                <PersonaOptionButton
                  key={key}
                  persona={PRACTICE_PERSONAS[key]}
                  selected={key === activeKey}
                  disabled={disabled}
                  onSelect={() => {
                    onSelect(key)
                    setDetailsOpen(false)
                  }}
                />
              ))}
            </div>
            <div className="mt-1 border-t border-border px-2 py-2">
              <PersonaDetails persona={active} />
            </div>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setMobileOpen(true)}
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-2.5 md:hidden',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            disabled && 'opacity-60',
            className
          )}
          aria-label={`Simulated client: ${active.name}. Change client.`}
        >
          <span
            className={cn(
              'grid size-7 place-items-center rounded-lg bg-gradient-to-br text-white',
              active.accent
            )}
          >
            <ActiveIcon className="size-3.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-semibold leading-tight">{active.name}</span>
            <span className="block truncate text-[11px] leading-tight text-muted-foreground">
              {active.shortLabel}
            </span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Choose a simulated client</SheetTitle>
              <SheetDescription>Switching clients starts a different practice scenario.</SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-2">
              {PERSONA_ORDER.map((key) => (
                <PersonaOptionButton
                  key={key}
                  persona={PRACTICE_PERSONAS[key]}
                  selected={key === activeKey}
                  disabled={disabled}
                  onSelect={() => {
                    onSelect(key)
                    setMobileOpen(false)
                  }}
                />
              ))}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                <PersonaDetails persona={active} />
              </div>
            </SheetBody>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <div
      role="group"
      aria-label="Choose a simulated client"
      className={cn('flex items-center gap-1 rounded-xl border border-border/70 bg-muted/35 p-1', className)}
    >
      {PERSONA_ORDER.map((key) => {
        const persona = PRACTICE_PERSONAS[key]
        const Icon = persona.Icon
        const selected = key === activeKey
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(key)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground',
              disabled && 'opacity-60'
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{persona.name}</span>
            {selected ? <span className="sr-only">(active)</span> : null}
          </button>
        )
      })}
    </div>
  )
}
