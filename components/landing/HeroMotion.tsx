'use client'

import { useEffect } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { loadGsap } from '@/lib/gsap-lazy'
import { dur, easeGsap } from '@/lib/motion'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const MAGNET_MAX_PX = 6

/**
 * Hero enhancements that are safe to arrive late.
 *
 * The headline and sub-paragraph reveals are pure CSS and start on the first
 * painted frame — deliberately not handled here. An earlier revision animated
 * the headline with GSAP SplitText and hid it until the library loaded, which
 * pushed mobile LCP from 4.0s to 6.6s because the largest element on the page
 * was waiting on a network fetch. Nothing in this file may gate paint.
 */
export function HeroMotion() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero]')
    if (!hero) return

    // Pause the drifting background while the tab is in the background.
    const syncVisibility = () => {
      hero.dataset.paused = document.hidden ? 'true' : 'false'
    }
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)

    const cleanup = () => document.removeEventListener('visibilitychange', syncVisibility)

    const magnet = hero.querySelector<HTMLElement>('[data-hero-magnet]')
    if (reducedMotion || !magnet || !window.matchMedia(FINE_POINTER).matches) {
      return cleanup
    }

    let cancelled = false
    let context: gsap.Context | undefined
    let detach: (() => void) | undefined

    loadGsap().then(({ gsap }) => {
      if (cancelled) return

      context = gsap.context(() => {
        const onMove = (event: PointerEvent) => {
          const rect = magnet.getBoundingClientRect()
          const dx = event.clientX - (rect.left + rect.width / 2)
          const dy = event.clientY - (rect.top + rect.height / 2)
          const pull = (MAGNET_MAX_PX * 2) / Math.max(rect.width, rect.height)

          gsap.to(magnet, {
            x: dx * pull,
            y: dy * pull,
            duration: dur.fast,
            ease: easeGsap.out,
            overwrite: 'auto',
          })
        }

        const onLeave = () => {
          gsap.to(magnet, {
            x: 0,
            y: 0,
            duration: dur.slow,
            ease: 'elastic.out(1, 0.45)',
            overwrite: 'auto',
          })
        }

        magnet.addEventListener('pointermove', onMove)
        magnet.addEventListener('pointerleave', onLeave)
        detach = () => {
          magnet.removeEventListener('pointermove', onMove)
          magnet.removeEventListener('pointerleave', onLeave)
        }
      }, hero)
    })

    return () => {
      cancelled = true
      detach?.()
      context?.revert()
      cleanup()
    }
  }, [reducedMotion])

  return null
}
