'use client'

import { cn } from '@/lib/utils/cn'
import {
  REFLECTION_PROMPTS,
  SESSION_GUIDANCE,
  SKILLS_TO_PRACTISE,
  type PracticePersona,
} from './personas'
import type { SessionStatus } from './types'

type GuidancePanelProps = {
  persona: PracticePersona
  status: SessionStatus
  messageCount: number
  maxMessages: number
  className?: string
}

const STATUS_COPY: Record<SessionStatus, { label: string; hint: string }> = {
  loading: { label: 'Preparing', hint: 'Loading your practice session…' },
  not_started: { label: 'Not started', hint: 'Choose a starter prompt or write your opening response.' },
  in_progress: { label: 'In progress', hint: 'Stay curious. Listen before advising.' },
  ready_for_reflection: {
    label: 'Ready for reflection',
    hint: 'Pause and notice what you practised before continuing.',
  },
}

export function GuidancePanel({
  persona,
  status,
  messageCount,
  maxMessages,
  className,
}: GuidancePanelProps) {
  const statusCopy = STATUS_COPY[status]
  const progress = Math.min(100, Math.round((messageCount / maxMessages) * 100))

  return (
    <div className={cn('space-y-5 text-sm', className)} aria-label="Session guide">
      <section>
        <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Current scenario
        </h3>
        <p className="font-semibold text-foreground">{persona.name}</p>
        <p className="mt-0.5 text-muted-foreground">{persona.scenario}</p>
        <p className="mt-2 text-foreground/90">{persona.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">{persona.ageLabel}</p>
      </section>

      <section>
        <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Skills to practise
        </h3>
        <ul className="space-y-1">
          {SKILLS_TO_PRACTISE.map((skill) => (
            <li key={skill} className="flex items-center gap-2 text-foreground/90">
              <span className="size-1.5 rounded-full bg-primary/70" aria-hidden="true" />
              {skill}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Focus for this client: {persona.focus.join(' · ')}
        </p>
      </section>

      <section>
        <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Ethical reminder
        </h3>
        <ul className="space-y-1.5">
          {SESSION_GUIDANCE.map((item) => (
            <li key={item} className="rounded-lg bg-muted/40 px-3 py-2 text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Session status
        </h3>
        <div className="rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-foreground">{statusCopy.label}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {messageCount}/{maxMessages}
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxMessages}
            aria-valuenow={messageCount}
            aria-label="Session message progress"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-[var(--motion-panel)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-muted-foreground">{statusCopy.hint}</p>
        </div>
      </section>

      {status === 'ready_for_reflection' || messageCount >= 6 ? (
        <section>
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Reflection prompts
          </h3>
          <ul className="space-y-1.5">
            {REFLECTION_PROMPTS.map((prompt) => (
              <li
                key={prompt}
                className="rounded-lg border border-dashed border-border px-3 py-2 text-muted-foreground"
              >
                {prompt}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        This is a simulated learning exercise and is not a substitute for professional supervision,
        clinical judgement, or emergency support.
      </p>
    </div>
  )
}
