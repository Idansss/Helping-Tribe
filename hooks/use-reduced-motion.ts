'use client'

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * True when the visitor has asked their system for reduced motion.
 *
 * Deliberately starts `true`. The first client render then matches the static
 * server HTML, and motion can only ever begin *after* the preference has been
 * read — a visitor who asked for stillness never catches a frame of animation.
 * This is a trauma-informed brand; motion sensitivity is on-message here, not
 * just a compliance checkbox.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const query = window.matchMedia(QUERY)
    const sync = () => setReduced(query.matches)

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return reduced
}
