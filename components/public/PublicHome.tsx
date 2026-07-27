'use client'

import Link from 'next/link'
import { CalendarX2, Shield } from 'lucide-react'
import { ApplicationForm } from '@/components/public/ApplicationForm'
import { AdmissionsHero } from '@/components/public/admissions/AdmissionsHero'
import { AdmissionGuidance } from '@/components/public/admissions/AdmissionGuidance'
import { ApplicationJourney } from '@/components/public/admissions/ApplicationJourney'
import { useRegistrationStatus } from '@/components/public/admissions/useRegistrationStatus'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { TopNav } from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import { APPLICATION_ESTIMATED_MINUTES, APPLICATION_REVIEW_DAYS } from '@/lib/brand/program'
import { SITE_CONFIG } from '@/lib/brand/site-config'

export function PublicHome() {
  const { status, message, retry } = useRegistrationStatus()
  const registrationClosed = status === 'closed' || status === 'not_yet'
  const showForm = status === 'open'

  return (
    <div className="public-shell min-h-screen bg-[var(--canvas)] text-foreground">
      <TopNav />
      <main id="main-content">
        <AdmissionsHero status={status} message={message} onRetry={retry} />

        <section
          id="applicant-journey"
          className="relative scroll-mt-24 border-b border-border/70 bg-[linear-gradient(180deg,rgb(250_248_244)_0%,rgb(244_248_246)_100%)] dark:bg-[linear-gradient(180deg,rgb(11_19_32)_0%,rgb(14_24_36)_100%)]"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-[var(--page-gutter)] py-12 lg:grid-cols-[1.35fr_0.85fr] lg:gap-10 lg:py-16">
            <ApplicationJourney />
            <div className="space-y-4">
              <AdmissionGuidance />
              <div className="rounded-[1.35rem] border border-border/80 bg-card/90 p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/8 text-primary">
                    <Shield className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-foreground">Application notes</h2>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                      <li>Estimated completion time: {APPLICATION_ESTIMATED_MINUTES} minutes.</li>
                      <li>Applications are reviewed within {APPLICATION_REVIEW_DAYS} working days.</li>
                      <li>You can save your progress and resume later with a secure link.</li>
                      <li>
                        Your information is used for admissions purposes.{' '}
                        <Link href="/privacy" className="font-semibold text-primary underline-offset-4 hover:underline">
                          Privacy policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="application-form"
          className="scroll-mt-24 bg-[var(--canvas)] px-[var(--page-gutter)] py-12 lg:py-16"
          aria-labelledby="application-form-heading"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-7 max-w-2xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">Application</p>
              <h2
                id="application-form-heading"
                className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                Complete your application
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
                Apply to {SITE_CONFIG.organisation.schoolName}. Approved learners receive the correct access process.
              </p>
            </div>

            {status === 'loading' && (
              <div
                className="rounded-[1.5rem] border border-border/80 bg-card p-8 shadow-[var(--shadow-soft)]"
                role="status"
                aria-live="polite"
              >
                <div className="space-y-3">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
                  <div className="mt-6 h-28 animate-pulse rounded-xl bg-muted" />
                </div>
                <p className="sr-only">Loading application availability…</p>
              </div>
            )}

            {showForm && <ApplicationForm />}

            {registrationClosed && (
              <div className="rounded-[1.5rem] border border-amber-500/25 bg-card p-8 text-center shadow-[var(--shadow-soft)] sm:p-10">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-700 dark:text-amber-300">
                  <CalendarX2 className="size-7" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground">
                  {status === 'not_yet' ? 'Applications are not open yet' : 'Applications are currently closed'}
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">{message}</p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild className="min-h-11 rounded-full px-5">
                    <Link href="/student/login">Student Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="min-h-11 rounded-full px-5">
                    <Link href="/contact">Contact support</Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-[1.5rem] border border-destructive/25 bg-card p-8 text-center shadow-[var(--shadow-soft)] sm:p-10">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Registration status temporarily unavailable
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">{message}</p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button type="button" onClick={retry} className="min-h-11 rounded-full px-5">
                    Try again
                  </Button>
                  <Button asChild variant="outline" className="min-h-11 rounded-full px-5">
                    <Link href={`mailto:${SITE_CONFIG.contact.email.value}`}>Email support</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
