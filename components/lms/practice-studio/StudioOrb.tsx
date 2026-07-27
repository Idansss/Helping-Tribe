'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

type StudioOrbProps = {
  className?: string
  label?: string
  reducedMotion?: boolean
}

/**
 * Calm abstract conversation mark — not a robot.
 * CSS/SVG only; pauses when the tab is hidden.
 */
export function StudioOrb({ className, label = 'Guided conversation', reducedMotion }: StudioOrbProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const animate = !reducedMotion && visible

  return (
    <div
      className={cn('relative mx-auto grid size-28 place-items-center sm:size-32', className)}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 128 128" className="size-full" aria-hidden="true">
        <defs>
          <radialGradient id="studio-orb-core" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="rgb(104 196 184 / 0.95)" />
            <stop offset="55%" stopColor="rgb(13 94 87 / 0.92)" />
            <stop offset="100%" stopColor="rgb(11 37 42 / 0.96)" />
          </radialGradient>
          <linearGradient id="studio-orb-wave" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgb(157 226 216 / 0.15)" />
            <stop offset="50%" stopColor="rgb(157 226 216 / 0.95)" />
            <stop offset="100%" stopColor="rgb(157 226 216 / 0.15)" />
          </linearGradient>
        </defs>

        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke="rgb(13 94 87 / 0.22)"
          strokeWidth="1"
          className={cn(animate && 'origin-center animate-[studio-orbit_12s_linear_infinite]')}
        />
        <circle
          cx="64"
          cy="64"
          r="42"
          fill="none"
          stroke="rgb(91 42 134 / 0.18)"
          strokeWidth="1"
          strokeDasharray="4 6"
          className={cn(animate && 'origin-center animate-[studio-orbit_18s_linear_infinite] [animation-direction:reverse]')}
        />
        <circle cx="64" cy="64" r="30" fill="url(#studio-orb-core)" />
        <path
          d="M38 64 C44 52, 50 76, 56 64 S68 52, 74 64 S86 76, 92 64"
          fill="none"
          stroke="url(#studio-orb-wave)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={cn(animate && 'animate-[studio-wave_2.8s_ease-in-out_infinite]')}
        />
        <circle cx="98" cy="36" r="3.5" fill="rgb(198 163 101 / 0.85)" className={cn(animate && 'animate-[studio-pulse_3.2s_ease-in-out_infinite]')} />
        <circle cx="30" cy="88" r="2.5" fill="rgb(104 196 184 / 0.75)" className={cn(animate && 'animate-[studio-pulse_3.2s_ease-in-out_infinite] [animation-delay:1s]')} />
      </svg>
    </div>
  )
}
