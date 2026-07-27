'use client'

import { AlertCircle, CalendarClock, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RegistrationStatus } from './useRegistrationStatus'
import { cn } from '@/lib/utils/cn'

const STATUS_COPY: Record<
  Exclude<RegistrationStatus, 'loading'>,
  { label: string; icon: typeof CheckCircle2; tone: string }
> = {
  open: {
    label: 'Applications open',
    icon: CheckCircle2,
    tone: 'border-emerald-400/35 bg-emerald-500/12 text-emerald-50',
  },
  not_yet: {
    label: 'Not yet open',
    icon: CalendarClock,
    tone: 'border-amber-300/40 bg-amber-400/12 text-amber-50',
  },
  closed: {
    label: 'Applications closed',
    icon: Lock,
    tone: 'border-white/20 bg-white/10 text-white/90',
  },
  error: {
    label: 'Status unavailable',
    icon: AlertCircle,
    tone: 'border-rose-300/35 bg-rose-500/12 text-rose-50',
  },
}

export function RegistrationStatusBadge({
  status,
  message,
  onRetry,
  className,
}: {
  status: RegistrationStatus
  message: string
  onRetry?: () => void
  className?: string
}) {
  if (status === 'loading') {
    return (
      <div
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-sm text-white/80',
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Checking application availability…
      </div>
    )
  }

  const meta = STATUS_COPY[status]
  const Icon = meta.icon

  return (
    <div className={cn('space-y-2', className)} role="status" aria-live="polite">
      <div
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold',
          meta.tone,
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span>{meta.label}</span>
      </div>
      {message ? <p className="max-w-xl text-sm leading-6 text-white/75">{message}</p> : null}
      {status === 'error' && onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-1 min-h-10 rounded-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          Retry status check
        </Button>
      ) : null}
    </div>
  )
}
