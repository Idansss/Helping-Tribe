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
        'rounded-xl border bg-white/80 backdrop-blur-sm p-4 flex items-start gap-3',
        className
      )}
    >
      {icon && (
        <div className="h-9 w-9 rounded-lg bg-[color-mix(in_srgb,var(--talent-primary)_12%,transparent)] text-[var(--talent-primary-dark)] flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
        {sublabel && (
          <div className="text-xs text-slate-500 leading-snug">{sublabel}</div>
        )}
        {trend && (
          <div className="text-[11px] text-emerald-600 font-medium">
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

