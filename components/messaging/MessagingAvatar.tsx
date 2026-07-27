'use client'

import { cn } from '@/lib/utils/cn'
import { initialsFromName } from './messaging-utils'

type MessagingAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function MessagingAvatar({
  name,
  avatarUrl,
  size = 'md',
  className,
}: MessagingAvatarProps) {
  const dimension = size === 'sm' ? 'size-8 text-[11px]' : 'size-10 text-xs'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn(
          'shrink-0 rounded-full object-cover ring-1 ring-border/70',
          dimension,
          className
        )}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_14%,var(--surface-muted))] font-semibold text-primary ring-1 ring-border/60',
        'dark:bg-[color-mix(in_srgb,var(--brand-primary)_22%,transparent)] dark:text-primary',
        dimension,
        className
      )}
    >
      {initialsFromName(name)}
    </span>
  )
}
