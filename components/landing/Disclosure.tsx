import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type DisclosureProps = {
  summary: ReactNode
  children: ReactNode
  className?: string
  summaryClassName?: string
  contentClassName?: string
}

/**
 * Server-rendered disclosure built on native <details>.
 *
 * Radix's Accordion.Content unmounts while closed, so its body never reaches
 * the initial HTML and is not indexable. (Its `forceMount` escape hatch is not
 * a fix — it pins the panel permanently open.) <details> keeps the body in the
 * server response, stays interactive without JavaScript, and preserves correct
 * expanded/collapsed semantics for assistive tech.
 */
export function Disclosure({
  summary,
  children,
  className,
  summaryClassName,
  contentClassName,
}: DisclosureProps) {
  return (
    <details className={cn('disclosure group', className)}>
      <summary
        className={cn(
          'flex min-w-0 cursor-pointer list-none items-center justify-between gap-4 rounded-sm',
          summaryClassName,
        )}
      >
        {summary}
        <ChevronDown
          className="disclosure-chevron size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  )
}
