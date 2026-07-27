import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface StatsCardProps {
  label: string
  value: string
  sublabel?: string
  trend?: string
  icon?: ReactNode
  className?: string
}

export function StatsCard({
  label,
  value,
  sublabel,
  trend,
  icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm',
        className
      )}
    >
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {sublabel && (
          <div className="text-xs leading-snug text-muted-foreground">{sublabel}</div>
        )}
        {trend && (
          <div className="text-[11px] font-medium text-success">
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

