'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Use light appearance' : 'Use dark appearance'}
      title={isDark ? 'Use light appearance' : 'Use dark appearance'}
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  )
}
