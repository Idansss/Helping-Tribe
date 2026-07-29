import type React from 'react'
import { Fragment } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GrowthOrbitVisual } from '@/components/landing/GrowthOrbitVisual'
import { HeroMotion } from '@/components/landing/HeroMotion'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/brand/site-config'

/*
  Proof row content.

  These are the only programme facts verifiable from the codebase. There are no
  enrolment counts, completion rates or graduate numbers anywhere in the repo or
  config, so none are invented here — see the content blockers in the handover
  notes. If this array is ever emptied the row disappears rather than rendering
  placeholders.
*/
const HEADLINE = 'Learn to help with skill, care and confidence.'
const HEADLINE_WORDS = HEADLINE.split(' ')

const proofPoints = [
  { value: String(SITE_CONFIG.programme.durationWeeks.value), label: 'guided weeks' },
  { value: '9', label: 'practice-led modules' },
  { value: 'Online', label: 'facilitated cohort' },
] as const

export function HeroSection() {
  return (
    <section
      data-hero
      className="hero relative overflow-hidden bg-[#0b1320] pt-[calc(var(--nav-height)+2rem)] text-white md:pt-[calc(var(--nav-height)+2.5rem)]"
    >
      <HeroMotion />

      {/* Slow-drifting blurred gradients. Transform only — no canvas, no WebGL. */}
      <div className="hero-aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-[var(--page-gutter)] pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-12 lg:pb-24">
        <div className="max-w-3xl py-2 lg:py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9de2d8]">
            Counselling · positive psychology · supported practice
          </p>

          {/*
            Words are split on the server and revealed with a CSS stagger that
            starts on the first painted frame. This element is the LCP
            candidate, so the animation is transform-only — the text is opaque
            from frame one and never waits on a script to become visible.
          */}
          <h1 className="hero-headline display-xl mt-4">
            {HEADLINE_WORDS.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                {/*
                  The separating space must sit outside the span: a trailing
                  space inside an inline-block is collapsed, which runs the
                  words together.
                */}
                <span className="hero-word" style={{ '--i': index } as React.CSSProperties}>
                  {word}
                </span>
                {index < HEADLINE_WORDS.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </h1>

          <p className="hero-sub mt-7 max-w-2xl text-base leading-[1.65] text-slate-300 sm:text-lg">
            {SITE_CONFIG.organisation.schoolName} is a guided learning community for people building ethical, practical helping skills in Nigerian and African contexts.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              data-hero-magnet
              className="min-h-12 rounded-full bg-[#68c4b8] px-6 text-[#0b1320] hover:bg-[#8bd8ce]"
            >
              <Link href="/apply">
                Start your application <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
              <Link href="#curriculum">Explore the programme</Link>
            </Button>
          </div>

          <Link href="/student/login" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline">
            Already learning with us? Open your portal.
          </Link>
        </div>

        <div data-reveal="scale">
          <GrowthOrbitVisual />
        </div>

        {proofPoints.length > 0 ? (
          <ul className="hero-proof lg:col-start-1 lg:row-start-2" data-reveal>
            {proofPoints.map((point) => (
              <li key={point.label}>
                <span className="hero-proof-value">{point.value}</span>
                <span className="hero-proof-label">{point.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
