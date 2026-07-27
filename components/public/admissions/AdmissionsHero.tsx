'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookmarkPlus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/brand/site-config'
import { PortalAccessPanel } from './PortalAccessPanel'
import { RegistrationStatusBadge } from './RegistrationStatusBadge'
import type { RegistrationStatus } from './useRegistrationStatus'

export function AdmissionsHero({
  status,
  message,
  onRetry,
}: {
  status: RegistrationStatus
  message: string
  onRetry: () => void
}) {
  const canApply = status === 'open'

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#0b1320] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_18%,rgb(13_94_87/0.45),transparent_55%),radial-gradient(ellipse_55%_45%_at_88%_12%,rgb(91_42_134/0.28),transparent_50%),radial-gradient(circle_at_70%_90%,rgb(15_118_110/0.18),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0b1320] to-transparent"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-10 hidden h-[28rem] w-[28rem] opacity-30 lg:block"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="150" stroke="rgb(157 226 216 / 0.25)" strokeWidth="1" />
        <circle cx="200" cy="200" r="110" stroke="rgb(196 181 253 / 0.2)" strokeWidth="1" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="70" stroke="rgb(104 196 184 / 0.35)" strokeWidth="1.25" />
        <circle cx="310" cy="130" r="3" fill="rgb(157 226 216 / 0.7)" />
        <circle cx="120" cy="270" r="2.5" fill="rgb(196 181 253 / 0.65)" />
      </svg>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-[var(--page-gutter)] pb-20 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12 lg:pb-24 lg:pt-14">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="relative size-12 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-white/25">
              <Image src="/logo.png" alt="" fill sizes="48px" className="object-contain p-0.5" priority />
            </span>
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9de2d8]">
                The Helping Tribe
              </p>
              <p className="mt-1 text-xs font-medium text-white/65">{SITE_CONFIG.organisation.shortName}</p>
            </div>
          </div>

          <h1 className="mt-7 font-display text-[clamp(2.35rem,5.5vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.04em] text-balance">
            Begin your journey into skilled, ethical helping.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Apply to {SITE_CONFIG.organisation.schoolName}, then access the appropriate learner or staff portal once
            approved.
          </p>

          <div className="mt-7">
            <RegistrationStatusBadge status={status} message={message} onRetry={onRetry} />
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {canApply ? (
              <Button
                asChild
                size="lg"
                className="min-h-12 rounded-full bg-[#68c4b8] px-6 text-[#0b1320] hover:bg-[#8bd8ce]"
              >
                <Link href="#application-form">
                  Start your application
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : status === 'loading' ? (
              <Button
                size="lg"
                disabled
                className="min-h-12 rounded-full bg-white/15 px-6 text-white/70"
              >
                Checking availability…
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="min-h-12 cursor-not-allowed rounded-full bg-white/12 px-6 text-white/70"
              >
                Application not available
              </Button>
            )}

            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/student/login">Learner login</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65">
            <Link
              href="/apply/resume"
              className="inline-flex min-h-10 items-center gap-2 font-semibold text-[#9de2d8] underline-offset-4 hover:text-white hover:underline"
            >
              <BookmarkPlus className="size-4" aria-hidden="true" />
              Resume a saved application
            </Link>
            <span className="hidden text-white/25 sm:inline" aria-hidden="true">
              ·
            </span>
            <Link href="/contact" className="inline-flex min-h-10 items-center underline-offset-4 hover:text-white hover:underline">
              Contact support
            </Link>
          </div>
        </div>

        <PortalAccessPanel className="lg:mt-2" />
      </div>

      <div className="relative z-10 flex justify-center pb-5 pt-1">
        <Link
          href="#applicant-journey"
          className="group inline-flex min-h-11 flex-col items-center gap-1.5 rounded-full px-4 py-2 text-[#9de2d8]/85 transition-colors hover:text-[#9de2d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9de2d8]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1320]"
        >
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em]">Scroll</span>
          <span className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-colors group-hover:border-[#9de2d8]/40 group-hover:bg-white/10">
            <ChevronDown
              className="size-4 motion-safe:animate-[admissions-scroll-nudge_1.8s_ease-in-out_infinite]"
              aria-hidden="true"
            />
          </span>
          <span className="sr-only">Scroll down to the applicant journey</span>
        </Link>
      </div>
    </section>
  )
}
