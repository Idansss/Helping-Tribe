'use client'

import { useEffect } from 'react'

const REVEAL_SELECTOR = '[data-reveal]'

export function LandingMotion() {
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.public-shell')
    if (!shell) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const revealItems = Array.from(shell.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
    let observer: IntersectionObserver | undefined
    let frame = 0

    const updateProgress = () => {
      frame = 0
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0
      shell.style.setProperty('--landing-scroll-progress', progress.toFixed(4))
    }

    const requestProgressUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress)
    }

    const revealEverything = () => {
      revealItems.forEach((item) => item.setAttribute('data-visible', 'true'))
    }

    shell.setAttribute('data-motion-ready', 'true')
    updateProgress()

    if (motionQuery.matches || !('IntersectionObserver' in window)) {
      revealEverything()
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const item = entry.target as HTMLElement
            item.setAttribute('data-visible', 'true')
            observer?.unobserve(item)
          })
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
      )
      revealItems.forEach((item) => observer?.observe(item))
    }

    const handleMotionPreference = () => {
      if (motionQuery.matches) revealEverything()
    }

    window.addEventListener('scroll', requestProgressUpdate, { passive: true })
    window.addEventListener('resize', requestProgressUpdate, { passive: true })
    motionQuery.addEventListener('change', handleMotionPreference)

    return () => {
      observer?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestProgressUpdate)
      window.removeEventListener('resize', requestProgressUpdate)
      motionQuery.removeEventListener('change', handleMotionPreference)
      shell.removeAttribute('data-motion-ready')
      shell.style.removeProperty('--landing-scroll-progress')
    }
  }, [])

  return (
    <div className="landing-progress" aria-hidden="true">
      <span />
    </div>
  )
}
