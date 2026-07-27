import { ClipboardCheck, CreditCard, FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  {
    number: '01',
    title: 'Apply',
    description: 'Submit your application securely.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Review',
    description: 'The admissions team reviews your information.',
    icon: ClipboardCheck,
  },
  {
    number: '03',
    title: 'Onboard',
    description: 'Approved learners complete payment and receive access.',
    icon: CreditCard,
  },
] as const

export function ApplicationJourney({ className }: { className?: string }) {
  return (
    <section className={cn('space-y-6', className)} aria-labelledby="application-journey-heading">
      <div className="max-w-2xl">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">Applicant journey</p>
        <h2 id="application-journey-heading" className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          How it works
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
          A clear three-stage path from application to learner access. Approval is not guaranteed.
        </p>
      </div>

      <ol className="relative grid gap-4 md:grid-cols-3 md:gap-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] right-[12%] top-[2.15rem] hidden h-px bg-gradient-to-r from-primary/10 via-primary/35 to-primary/10 md:block"
        />
        {STEPS.map(({ number, title, description, icon: Icon }, index) => (
          <li
            key={title}
            className="relative rounded-[1.35rem] border border-border/80 bg-card/90 p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full border border-primary/20 bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_20px_rgb(13_94_87/0.22)]">
                {index + 1}
              </span>
              <span className="grid size-10 place-items-center rounded-xl border border-border bg-muted/70 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="ml-auto text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {number}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
