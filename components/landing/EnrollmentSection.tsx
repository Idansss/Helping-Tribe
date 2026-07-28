import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileCheck2, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  { icon: FileCheck2, title: 'Apply securely', text: 'Complete the application online and save your progress if you need to return.' },
  { icon: CheckCircle2, title: 'Receive a decision', text: 'The admissions team reviews your submission and contacts you through the verified process.' },
  { icon: LockKeyhole, title: 'Pay and onboard', text: 'Approved applicants complete payment before receiving secure learner access.' },
] as const

export function EnrollmentSection() {
  return (
    <section id="enrollment" className="bg-[var(--surface-muted)]">
      <div className="section-shell">
        <div className="overflow-hidden rounded-[clamp(1.5rem,4vw,3rem)] border border-white/15 bg-[#0d5e57] text-white shadow-[var(--shadow-soft)]" data-reveal="scale">
          <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_0.9fr] lg:p-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Admissions</p>
              <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.5rem,5vw,4.8rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                Ready to build a more grounded helping practice?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
                Start when you are ready. Current cohort dates, registration availability and payment details are shown inside the official application process.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="min-h-12 rounded-full bg-white px-6 text-[#0d5e57] hover:bg-white/90">
                  <Link href="/apply">Start your application <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-h-12 rounded-full border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/apply/resume">Resume an application</Link>
                </Button>
              </div>
            </div>
            <ol className="divide-y divide-white/15 border-y border-white/15">
              {steps.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="grid grid-cols-[auto_1fr] gap-4 py-5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white"><Icon className="size-4" aria-hidden="true" /></span>
                  <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">Step {index + 1}</p><h3 className="mt-1 font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-white/85">{text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
