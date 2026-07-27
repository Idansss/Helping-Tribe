const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
})

export function formatNaira(amountNgn: number) {
  return nairaFormatter.format(amountNgn).replace('NGN', '₦').replace(/\s/g, '')
}

export function formatProgrammeDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00+01:00`)
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed'
  return dateFormatter.format(date)
}
