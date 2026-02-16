import Link from 'next/link'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'

export const metadata = {
  title: `Privacy Policy | ${PROGRAM_FULL_NAME}`,
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-600">
          Last updated: February 16, 2026
        </p>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            We collect information you submit in the application form, including identity, contact, educational, and
            sensitive readiness information. This data is used only for admissions review, onboarding, payments,
            support, and training delivery.
          </p>
          <p>
            Sensitive disclosures are visible only to authorized staff involved in admissions and student support.
            We do not sell applicant data.
          </p>
          <p>
            We retain submitted applications and onboarding records for compliance, quality assurance, and academic
            records. You may request correction or deletion where legally permitted.
          </p>
          <p>
            If you need access, correction, or deletion assistance, contact us via the support page.
          </p>
        </section>

        <div className="mt-8 flex items-center gap-4 text-sm">
          <Link href="/contact" className="text-teal-700 hover:underline">
            Contact support
          </Link>
          <Link href="/apply" className="text-teal-700 hover:underline">
            Back to application
          </Link>
        </div>
      </article>
    </main>
  )
}
