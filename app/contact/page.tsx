import Link from 'next/link'
import { Mail, Phone, Clock, ArrowLeft } from 'lucide-react'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'

export const metadata = {
  title: `Contact Support | ${PROGRAM_FULL_NAME}`,
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 md:flex-row md:items-stretch">
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-emerald-900 px-6 py-8 text-emerald-50 shadow-xl md:px-8">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-700/40 blur-3xl" />
          <div className="absolute -bottom-16 -right-8 h-40 w-40 rounded-full bg-emerald-500/40 blur-3xl" />

          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            We’re here to help
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Contact Support
          </h1>
          <p className="mt-3 max-w-md text-sm text-emerald-100/90">
            For admissions help, payment verification, or password setup support for your
            {` ${PROGRAM_FULL_NAME.toLowerCase() }`} journey.
          </p>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-emerald-200" />
              <div>
                <p className="text-emerald-100/90 font-medium">Email</p>
                <p>
                  <a
                    href="mailto:helpingtribe@blakmoh.com"
                    className="font-medium text-emerald-50 underline-offset-4 hover:underline"
                  >
                    helpingtribe@blakmoh.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-emerald-200" />
              <div>
                <p className="text-emerald-100/90 font-medium">Phone / WhatsApp</p>
                <p>
                  <a
                    href="tel:+2347030052021"
                    className="font-medium text-emerald-50 underline-offset-4 hover:underline"
                  >
                    +234 703 0052 021
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-emerald-200" />
              <div>
                <p className="text-emerald-100/90 font-medium">Support hours</p>
                <p>Monday – Friday, 9:00 AM – 5:00 PM (WAT)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur md:p-8">
          <h2 className="text-base font-semibold text-slate-900">Before you contact us</h2>
          <p className="text-sm text-slate-600">
            To help us respond quickly, please include your full name, the email you used
            for your application, and any relevant payment reference or screenshot.
          </p>

          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>For admission questions, mention the cohort you&apos;re applying to.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>For payment verification, share your transaction reference or receipt.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>For password issues, confirm if you are a student or staff/mentor.</span>
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-600 px-4 py-1.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 hover:border-emerald-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to application
            </Link>
            <Link
              href="/privacy"
              className="text-xs font-medium text-slate-600 underline-offset-4 hover:text-emerald-700 hover:underline"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
