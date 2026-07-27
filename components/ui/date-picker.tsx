'use client'

import { format, parse, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils/cn'

interface DatePickerProps {
  value?: string        // YYYY-MM-DD string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  maxDate?: Date
  minDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  maxDate,
  minDate,
}: DatePickerProps) {
  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const validSelected = selected && isValid(selected) ? selected : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background transition-colors',
            'hover:border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !validSelected && 'text-muted-foreground'
          )}
        >
          <span>{validSelected ? format(validSelected, 'dd MMM yyyy') : placeholder}</span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={validSelected}
          onSelect={(date) => {
            if (date) onChange(format(date, 'yyyy-MM-dd'))
          }}
          disabled={(date) => {
            if (maxDate && date > maxDate) return true
            if (minDate && date < minDate) return true
            return false
          }}
          defaultMonth={validSelected}
          captionLayout="dropdown"
          fromYear={1940}
          toYear={new Date().getFullYear() + 5}
        />
      </PopoverContent>
    </Popover>
  )
}
