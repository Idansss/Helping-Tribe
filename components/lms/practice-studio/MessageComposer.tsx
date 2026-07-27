'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronDown,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  SendHorizontal,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import { MAX_MESSAGE_LENGTH } from './personas'
import {
  REASONING_OPTIONS,
  labelForReasoning,
  type ReasoningEffort,
} from './types'

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  sending?: boolean
  personaName: string
  reasoningEffort: ReasoningEffort
  onReasoningChange: (effort: ReasoningEffort) => void
  reasoningEnabled: boolean
  onOpenPersonaPicker: () => void
  onOpenGuide: () => void
  onOpenScenario: () => void
  onReset: () => void
}

function ReasoningMenu({
  value,
  onChange,
  onClose,
}: {
  value: ReasoningEffort
  onChange: (effort: ReasoningEffort) => void
  onClose: () => void
}) {
  return (
    <div role="listbox" aria-label="Reasoning level">
      {REASONING_OPTIONS.map((option) => {
        const selected = option.effort === value
        return (
          <button
            key={option.effort}
            type="button"
            role="option"
            aria-selected={selected}
            aria-describedby={`reasoning-desc-${option.effort}`}
            onClick={() => {
              onChange(option.effort)
              onClose()
            }}
            className={cn(
              'flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors',
              'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected && 'bg-primary/8'
            )}
          >
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center">
              {selected ? <Check className="size-3.5 text-primary" aria-hidden="true" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{option.label}</span>
              <span
                id={`reasoning-desc-${option.effort}`}
                className="mt-0.5 block text-xs text-muted-foreground"
              >
                {option.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  disabled,
  sending,
  personaName,
  reasoningEffort,
  onReasoningChange,
  reasoningEnabled,
  onOpenPersonaPicker,
  onOpenGuide,
  onOpenScenario,
  onReset,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const plusButtonRef = useRef<HTMLButtonElement>(null)
  const [plusOpen, setPlusOpen] = useState(false)
  const [plusSheetOpen, setPlusSheetOpen] = useState(false)
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const [reasoningSheetOpen, setReasoningSheetOpen] = useState(false)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const remaining = MAX_MESSAGE_LENGTH - value.length
  const overLimit = remaining < 0
  const canSend = Boolean(value.trim()) && !disabled && !sending && !overLimit

  const openPlusMobile = () => setPlusSheetOpen(true)
  const openPlusDesktop = (open: boolean) => setPlusOpen(open)

  const menuActions = (
    <div className="space-y-0.5">
      <button
        type="button"
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-foreground hover:bg-accent"
        onClick={() => {
          setPlusOpen(false)
          setPlusSheetOpen(false)
          onOpenPersonaPicker()
        }}
      >
        <Users className="size-4 text-muted-foreground" aria-hidden="true" />
        Change client
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-foreground hover:bg-accent"
        onClick={() => {
          setPlusOpen(false)
          setPlusSheetOpen(false)
          onOpenGuide()
        }}
      >
        <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
        Session guide
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-foreground hover:bg-accent"
        onClick={() => {
          setPlusOpen(false)
          setPlusSheetOpen(false)
          onOpenScenario()
        }}
      >
        <Info className="size-4 text-muted-foreground" aria-hidden="true" />
        Scenario details
      </button>

      {reasoningEnabled ? (
        <div className="border-t border-border pt-1.5">
          <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Reasoning
          </p>
          <ReasoningMenu
            value={reasoningEffort}
            onChange={onReasoningChange}
            onClose={() => {
              setPlusOpen(false)
              setPlusSheetOpen(false)
            }}
          />
        </div>
      ) : null}

      <div className="border-t border-border pt-1.5">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-destructive hover:bg-destructive/10"
          onClick={() => {
            setPlusOpen(false)
            setPlusSheetOpen(false)
            onReset()
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset conversation
        </button>
      </div>
    </div>
  )

  return (
    <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-4">
      <div className="mx-auto w-full max-w-[52rem]">
        <div
          className={cn(
            'rounded-[1.5rem] border border-border/80 bg-[color-mix(in_srgb,var(--surface)_96%,var(--surface-muted))] p-3 shadow-[var(--shadow-soft)]',
            'dark:bg-card dark:shadow-[0_12px_40px_rgb(0_0_0/0.35)]'
          )}
        >
          <Label htmlFor="practice-composer" className="sr-only">
            Your response to {personaName}
          </Label>
          <Textarea
            ref={textareaRef}
            id="practice-composer"
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH + 50))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canSend) onSend()
              }
            }}
            placeholder={`Ask or respond to ${personaName}…`}
            disabled={disabled || sending}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[160px] resize-none border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0',
              'placeholder:text-muted-foreground/65'
            )}
            aria-describedby="practice-composer-hint practice-composer-count"
          />

          <div className="mt-1 flex items-center gap-1.5 px-0.5">
            {/* Desktop plus popover */}
            <Popover
              open={plusOpen}
              onOpenChange={(open) => {
                openPlusDesktop(open)
                if (!open) plusButtonRef.current?.focus()
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  ref={plusButtonRef}
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="hidden size-9 rounded-full border border-border/70 bg-background/70 md:inline-flex"
                  aria-label="Open session controls"
                  aria-haspopup="menu"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                sideOffset={10}
                className="w-72 border-border bg-popover p-1.5 text-popover-foreground"
                onEscapeKeyDown={() => plusButtonRef.current?.focus()}
              >
                {menuActions}
              </PopoverContent>
            </Popover>

            {/* Mobile plus sheet */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="inline-flex size-9 rounded-full border border-border/70 bg-background/70 md:hidden"
              aria-label="Open session controls"
              onClick={openPlusMobile}
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
            <Sheet open={plusSheetOpen} onOpenChange={setPlusSheetOpen}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Session controls</SheetTitle>
                  <SheetDescription>Tools for this practice conversation.</SheetDescription>
                </SheetHeader>
                <SheetBody>{menuActions}</SheetBody>
              </SheetContent>
            </Sheet>

            {reasoningEnabled ? (
              <>
                <Popover open={reasoningOpen} onOpenChange={setReasoningOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="hidden h-9 items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
                      aria-label={`Reasoning level: ${labelForReasoning(reasoningEffort)}. Change reasoning level.`}
                      aria-haspopup="listbox"
                    >
                      <span className="text-muted-foreground/80">Reasoning</span>
                      <span className="text-foreground">{labelForReasoning(reasoningEffort)}</span>
                      <ChevronDown className="size-3 opacity-70" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="top"
                    sideOffset={10}
                    className="w-72 border-border bg-popover p-1.5 text-popover-foreground"
                  >
                    <ReasoningMenu
                      value={reasoningEffort}
                      onChange={onReasoningChange}
                      onClose={() => setReasoningOpen(false)}
                    />
                  </PopoverContent>
                </Popover>

                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2.5 text-xs font-medium text-muted-foreground md:hidden"
                  aria-label={`Reasoning level: ${labelForReasoning(reasoningEffort)}. Change reasoning level.`}
                  onClick={() => setReasoningSheetOpen(true)}
                >
                  {labelForReasoning(reasoningEffort)}
                  <ChevronDown className="size-3 opacity-70" aria-hidden="true" />
                </button>
                <Sheet open={reasoningSheetOpen} onOpenChange={setReasoningSheetOpen}>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Reasoning level</SheetTitle>
                      <SheetDescription>
                        Controls model compute effort only. Hidden reasoning is never shown.
                      </SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                      <ReasoningMenu
                        value={reasoningEffort}
                        onChange={onReasoningChange}
                        onClose={() => setReasoningSheetOpen(false)}
                      />
                    </SheetBody>
                  </SheetContent>
                </Sheet>
              </>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
              <p
                id="practice-composer-count"
                className={cn(
                  'hidden text-[11px] tabular-nums sm:block',
                  overLimit ? 'font-semibold text-destructive' : 'text-muted-foreground'
                )}
              >
                {Math.max(0, remaining)}
              </p>
              <Button
                type="button"
                size="icon"
                onClick={onSend}
                disabled={!canSend}
                className="size-9 shrink-0 rounded-full"
                aria-label={sending ? 'Sending response' : 'Send response'}
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <SendHorizontal className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <p id="practice-composer-hint" className="mt-1.5 px-1 text-center text-[11px] text-muted-foreground">
          <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line · </span>
          Simulated practice only
        </p>
        <div aria-live="polite" className="sr-only">
          {sending ? 'Sending your response to the simulated client.' : ''}
        </div>
      </div>
    </div>
  )
}
