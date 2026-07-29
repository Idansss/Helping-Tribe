'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { loadGsap } from '@/lib/gsap-lazy'
import { CURRICULUM_MODULES } from '@/lib/brand/site-config'

// Desktop-only garnish, so it stays out of the initial bundle.
const NumberFlow = dynamic(() => import('@number-flow/react'), { ssr: false })

const DESKTOP_QUERY = '(min-width: 1024px)'
const TOTAL_WEEKS = CURRICULUM_MODULES.length

/**
 * The nine-week curriculum.
 *
 * Renders as a vertical stepped timeline by default — that is the markup in the
 * server HTML, so every week title and description is indexable and the section
 * works with JavaScript disabled. On viewports of 1024px and up, and only when
 * the visitor has not asked for reduced motion, it upgrades to a scroll-pinned
 * horizontal track. Pinned horizontal scroll is hostile on touch devices, so
 * phones and tablets keep the vertical timeline.
 */
export function CurriculumSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)

  const reducedMotion = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [week, setWeek] = useState(1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const sync = () => setIsDesktop(query.matches)

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reducedMotion || !isDesktop) return

    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    let context: gsap.Context | undefined
    let cancelled = false

    /** Back out to the vertical timeline so all nine weeks stay reachable. */
    const revertToVertical = () => {
      delete section.dataset.mode
      setPinned(false)
      setProgress(0)
      setWeek(1)
    }

    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return

        // Switch to the horizontal layout, then force a synchronous layout read
        // so scrollWidth reflects the real track. Deliberately not deferred to
        // requestAnimationFrame: rAF does not fire in a background tab, which
        // would leave the horizontal CSS applied with no pin to scroll it and
        // weeks 5–9 unreachable behind `overflow: hidden`.
        section.dataset.mode = 'horizontal'
        void track.scrollWidth

        const distance = () => Math.max(0, track.scrollWidth - section.clientWidth)

        if (distance() <= 0) {
          revertToVertical()
          return
        }

        setPinned(true)

        context = gsap.context(() => {
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setProgress(self.progress)
                setWeek(Math.min(TOTAL_WEEKS, Math.floor(self.progress * TOTAL_WEEKS) + 1))
              },
            },
          })
        }, section)

        ScrollTrigger.refresh()
      })
      .catch(revertToVertical)

    return () => {
      cancelled = true
      context?.revert()
      revertToVertical()
    }
  }, [reducedMotion, isDesktop])

  return (
    <section id="curriculum" ref={sectionRef} className="curriculum bg-[var(--surface-muted)]">
      <div className="curriculum-inner">
        <div className="curriculum-heading" data-reveal="heading">
          <p className="eyebrow">The learning journey</p>
          <h2 className="display-lg mt-4 text-foreground">Nine weeks. One connected practice.</h2>
          <p className="prose-measure mt-5 text-base text-muted-foreground">
            Each week builds on the last, moving from ethical foundations to supported application and reflection.
          </p>
        </div>

        <div className="curriculum-viewport">
          <ol className="curriculum-track" ref={trackRef}>
            {CURRICULUM_MODULES.map((module) => (
              <li key={module.week} className="curriculum-card" data-reveal>
                <span className="curriculum-numeral" aria-hidden="true">
                  {String(module.week).padStart(2, '0')}
                </span>
                <div className="curriculum-body">
                  <p className="curriculum-kicker">Week {module.week}</p>
                  <h3 className="curriculum-title">{module.title}</h3>
                  <p className="curriculum-detail">{module.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Progress rail belongs to the pinned experience only. */}
        {pinned ? (
          <div className="curriculum-progress">
            <div className="curriculum-rail" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className="curriculum-counter" aria-live="off">
              <span className="curriculum-counter-label">Week</span>
              <NumberFlow value={week} className="curriculum-counter-value" />
              <span className="curriculum-counter-label">of {TOTAL_WEEKS}</span>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
