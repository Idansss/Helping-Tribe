'use client'

import { useState, useEffect } from 'react'

/**
 * Returns true when the viewport is at least `minWidth` px (default 768 = md).
 * Uses false during SSR to avoid layout flash, then hydrates to actual value.
 */
export function useMediaQuery(minWidth: number = 768): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [minWidth])

  return matches
}
