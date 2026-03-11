'use client'

import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'space-y-3',
        caption: 'flex flex-col gap-1',
        month_caption: 'flex flex-col items-center gap-2 relative',
        caption_label: 'sr-only',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          'absolute left-0 h-7 w-7 flex items-center justify-center rounded-lg',
          'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600',
          'transition-colors cursor-pointer'
        ),
        button_next: cn(
          'absolute right-0 h-7 w-7 flex items-center justify-center rounded-lg',
          'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600',
          'transition-colors cursor-pointer'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-slate-400 text-xs font-medium w-9 text-center py-1',
        week: 'flex w-full mt-1',
        day: cn(
          'h-9 w-9 text-center text-sm relative rounded-lg',
          'hover:bg-slate-100 transition-colors cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-teal-500'
        ),
        day_button: 'h-9 w-9 flex items-center justify-center rounded-lg font-normal',
        selected: '!bg-teal-600 !text-white hover:!bg-teal-700 rounded-lg',
        today: 'bg-slate-100 font-semibold text-teal-700',
        outside: 'text-slate-300',
        disabled: 'text-slate-300 cursor-not-allowed hover:bg-transparent',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
