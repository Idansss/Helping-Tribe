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
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-muted/55 p-8 text-center',
        className
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-md">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actionLabel && (
        <Button
          size="sm"
          className="mt-1 rounded-full"
          onClick={onActionClick}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

