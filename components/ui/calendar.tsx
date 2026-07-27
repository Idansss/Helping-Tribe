'use client'

import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4 text-popover-foreground', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'space-y-3',
        caption: 'flex flex-col items-center gap-1',
        month_caption: 'flex items-center justify-center gap-2',
        caption_label: 'sr-only',
        dropdowns: 'flex items-center gap-2',
        dropdown: cn(
          'appearance-none rounded-lg border border-border bg-background px-3 py-1.5',
          'cursor-pointer text-sm font-semibold text-foreground shadow-sm',
          'transition-colors hover:border-primary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30'
        ),
        dropdown_root: 'relative',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          'absolute left-0 flex size-7 cursor-pointer items-center justify-center rounded-lg',
          'border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
        ),
        button_next: cn(
          'absolute right-0 flex size-7 cursor-pointer items-center justify-center rounded-lg',
          'border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 py-1 text-center text-xs font-medium text-muted-foreground',
        week: 'mt-1 flex w-full',
        day: cn(
          'relative size-9 cursor-pointer rounded-lg text-center text-sm transition-colors',
          'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring'
        ),
        day_button: 'flex size-9 items-center justify-center rounded-lg font-normal',
        selected: '!rounded-lg !bg-primary !text-primary-foreground hover:!bg-primary/90',
        today: 'bg-accent font-semibold text-primary',
        outside: 'text-muted-foreground/50',
        disabled: 'cursor-not-allowed text-muted-foreground/40 hover:bg-transparent',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4" aria-hidden="true" />
          ),
      }}
      {...props}
    />
  )
}
