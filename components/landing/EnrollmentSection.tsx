import Link from 'next/link'
import { ArrowRight, CalendarClock, CheckCircle2, FileCheck2, LockKeyhole, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COHORT, formatCohortDate, formatCohortPrice, hasCohortDetails } from '@/lib/cohort'

const steps = [
  { icon: FileCheck2, title: 'Apply securely', text: 'Complete the application online and save your progress if you need to return.' },
  { icon: CheckCircle2, title: 'Receive a decision', text: 'The admissions team reviews your submission and contacts you through the verified process.' },
  { icon: LockKeyhole, title: 'Pay and onboard', text: 'Approved applicants complete payment before receiving secure learner access.' },
] as const

/** Only the confirmed cohort fields become rows. */
function cohortFacts() {
  const facts: { icon: typeof CalendarClock; label: string; value: string }[] = []

  if (COHORT.startDate) {
    facts.push({ icon: CalendarClock, label: 'Next start date', value: formatCohortDate(COHORT.startDate) })
  }
  if (COHORT.applicationDeadline) {
    facts.push({ icon: CalendarClock, label: 'Applications close', value: formatCohortDate(COHORT.applicationDeadline) })
  }
  if (COHORT.price) {
    facts.push({ icon: Tag, label: 'Programme fee', value: formatCohortPrice(COHORT.price) })
  }

  return facts
}

export function EnrollmentSection() {
  const facts = hasCohortDetails() ? cohortFacts() : []

  return (
    <section id="enrollment" className="bg-[var(--surface-muted)]">
      <div className="section-shell">
        <div className="overflow-hidden rounded-[clamp(1.5rem,4vw,3rem)] border border-white/15 bg-[#0d5e57] text-white shadow-[var(--shadow-soft)]" data-reveal="scale">
          <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_0.9fr] lg:p-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Admissions</p>
              <h2 className="display-lg mt-4 max-w-2xl">
                Ready to build a more grounded helping practice?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-[1.65] text-white/85">
                Start when you are ready. Current cohort dates, registration availability and payment details are shown inside the official application process.
              </p>

              {/* Hidden entirely until lib/cohort.ts carries confirmed values. */}
              {facts.length > 0 ? (
                <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:grid-cols-3">
                  {facts.map((fact) => (
                    <div key={fact.label} className="bg-[#0d5e57] p-4">
                      <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/75">
                        <fact.icon className="size-3.5" aria-hidden="true" />
                        {fact.label}
                      </dt>
                      <dd className="mt-2 font-display text-lg font-medium">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="min-h-12 rounded-full bg-white px-6 text-[#0d5e57] hover:bg-white/90">
                  <Link href="/apply">Start your application <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-h-12 rounded-full border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/apply/resume">Resume an application</Link>
                </Button>
              </div>
            </div>

            {/*
              These three steps are a genuine sequence, so the numbering stays.
              The rail behind them draws downward as the section scrolls in.
            */}
            <ol className="admissions-steps relative" data-reveal>
              <span className="admissions-rail" aria-hidden="true" />
              {steps.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="relative grid grid-cols-[auto_1fr] gap-4 py-5">
                  <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-[#0d5e57] text-white ring-1 ring-white/25">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">Step {index + 1}</p>
                    <h3 className="mt-1 font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/85">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
