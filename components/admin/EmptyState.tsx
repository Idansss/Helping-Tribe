import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onActionClick?: () => void
  icon?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onActionClick,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border border-dashed rounded-xl bg-slate-50/60 p-8 flex flex-col items-center justify-center text-center gap-3',
        className
      )}
    >
      {icon && (
        <div className="h-10 w-10 rounded-full bg-[color-mix(in_srgb,var(--talent-primary)_12%,transparent)] text-[var(--talent-primary-dark)] flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-md">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {actionLabel && (
        <Button
          size="sm"
          className="mt-1 rounded-full bg-[var(--talent-primary)] text-white hover:bg-[var(--talent-primary-dark)]"
          onClick={onActionClick}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

