import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, Lock, ShieldCheck, Users2 } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  APPLICATION_ESTIMATED_MINUTES,
  APPLICATION_REVIEW_DAYS,
  ORGANIZATION_NAME,
  PROGRAM_FULL_NAME,
  PROGRAM_NAME,
  SCHOOL_NAME,
} from '@/lib/brand/program'
import { HELP_FOUNDATIONAL_COURSE } from '@/lib/payments/helpFoundationalCourse'

type UnifiedHomepageProps = {
  portalHref?: string | null
}

const faqItems = [
  {
    question: 'Who can apply?',
    answer:
      'The program is open to aspiring and practicing helpers in education, health, ministry, NGOs, and community leadership.',
  },
  {
    question: 'How long does the application take?',
    answer: `Most applicants complete the form in about ${APPLICATION_ESTIMATED_MINUTES} minutes.`,
  },
  {
    question: 'How soon will I hear back?',
    answer: `Applications are typically reviewed within ${APPLICATION_REVIEW_DAYS} working days.`,
  },
  {
    question: 'When do I pay?',
    answer: 'Payment happens after approval. Once payment is verified, you receive a one-time set-password link.',
  },
]

export function UnifiedHomepage({ portalHref }: UnifiedHomepageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f7f1_0%,#ebf8f5_36%,#f8fbfb_66%,#ffffff_100%)] text-slate-900">
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:py-10">
        <section className="overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-700 p-6 text-white shadow-[0_16px_40px_rgba(15,118,110,0.2)] md:p-10">
          <p className="text-xs font-semibold tracking-[0.18em] text-emerald-100">{ORGANIZATION_NAME}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
            {SCHOOL_NAME}
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-emerald-50 md:text-base">
            {PROGRAM_FULL_NAME} equips you with practical counselling and positive psychology tools you can apply in real
            community settings.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="bg-white text-teal-900 hover:bg-white/95">
              <Link href="/apply">
                Apply now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/15 hover:text-white">
              <Link href="/student/login">Student login</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/15 hover:text-white">
              <Link href="/staff/login">Staff login</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/15 hover:text-white">
              <Link href="/apply/resume">Resume application</Link>
            </Button>
            {portalHref ? (
              <Button asChild variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                <Link href={portalHref}>Go to my portal</Link>
              </Button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-white/25 bg-white/10 p-3">
              <p className="font-semibold">Application time</p>
              <p className="text-emerald-50">{APPLICATION_ESTIMATED_MINUTES} minutes</p>
            </div>
            <div className="rounded-lg border border-white/25 bg-white/10 p-3">
              <p className="font-semibold">Review timeline</p>
              <p className="text-emerald-50">{APPLICATION_REVIEW_DAYS} working days</p>
            </div>
            <div className="rounded-lg border border-white/25 bg-white/10 p-3">
              <p className="font-semibold">Program start</p>
              <p className="text-emerald-50">{HELP_FOUNDATIONAL_COURSE.classBeginsLabel}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Step 1</p>
            <h2 className="mt-1 text-lg font-semibold">Apply</h2>
            <p className="mt-1 text-sm text-slate-600">Submit your application and consent details online.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Step 2</p>
            <h2 className="mt-1 text-lg font-semibold">Get reviewed</h2>
            <p className="mt-1 text-sm text-slate-600">Staff review submissions and communicate your decision.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Step 3</p>
            <h2 className="mt-1 text-lg font-semibold">Pay and onboard</h2>
            <p className="mt-1 text-sm text-slate-600">Approved applicants pay, set password, then access learner portal.</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Program snapshot</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 text-teal-700" /> 9-week guided training</li>
              <li className="flex items-start gap-2"><Users2 className="mt-0.5 h-4 w-4 text-teal-700" /> Online with peer learning circles</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-teal-700" /> Ethics, supervision, and readiness-focused</li>
              <li className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 text-teal-700" /> Admissions + payment-gated access</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Curriculum highlights</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-700" /> Foundations of helping relationships</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-700" /> Counselling process and ethical practice</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-700" /> Trauma-informed care and crisis response</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-700" /> Practicum, supervision, and reflection</li>
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Who this is for</h3>
          <p className="mt-2 text-sm text-slate-700">
            Community helpers, educators, caregivers, health workers, ministry leaders, and aspiring counsellors who
            want structured skills training and supervised growth.
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Minimum eligibility: valid contact information, readiness for reflective learning, and commitment to ethical
            practice.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-lg font-semibold text-amber-900">Trust signals</h3>
            <p className="mt-2 text-sm text-amber-900/90">
              Testimonials and instructor bios are currently placeholders.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-amber-900/90">
              <li>TODO: Add real alumni testimonial quotes with names/photos.</li>
              <li>TODO: Add verified instructor profiles and credentials.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">FAQ</h3>
            <Accordion type="single" collapsible className="mt-3 space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`} className="rounded-lg border border-slate-200 px-3">
                  <AccordionTrigger className="text-left text-sm font-medium">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="rounded-xl border border-teal-200 bg-teal-50 p-5 text-center">
          <h3 className="text-xl font-semibold text-teal-900">{PROGRAM_NAME} application</h3>
          <p className="mt-2 text-sm text-teal-900/90">
            Start your application now, save your progress, and complete submission when ready.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-teal-700 text-white hover:bg-teal-800">
              <Link href="/apply">Start application</Link>
            </Button>
            <Button asChild variant="outline" className="border-teal-400 text-teal-800 hover:bg-teal-100">
              <Link href="/apply/resume">Resume draft</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} {ORGANIZATION_NAME}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-900 hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 hover:underline">Terms</Link>
            <Link href="/contact" className="hover:text-slate-900 hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
