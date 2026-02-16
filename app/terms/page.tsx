import Link from 'next/link'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'

export const metadata = {
  title: `Terms of Service | ${PROGRAM_FULL_NAME}`,
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-slate-600">
          Last updated: February 16, 2026
        </p>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            By applying to the program, you confirm that all information submitted is accurate and complete.
          </p>
          <p>
            Admission decisions are made after review and may include approval, rejection, or request for additional
            information.
          </p>
          <p>
            Approved applicants must complete required payment and password setup before learner portal access is
            granted.
          </p>
          <p>
            Misuse of this platform, impersonation, or fraudulent submissions may result in disqualification and
            account restriction.
          </p>
        </section>

        <div className="mt-8 flex items-center gap-4 text-sm">
          <Link href="/privacy" className="text-teal-700 hover:underline">
            Privacy policy
          </Link>
          <Link href="/apply" className="text-teal-700 hover:underline">
            Back to application
          </Link>
        </div>
      </article>
    </main>
  )
}
