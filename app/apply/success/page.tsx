import Link from 'next/link'
import { APPLICATION_REVIEW_DAYS, PROGRAM_FULL_NAME } from '@/lib/brand/program'

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: `Application Submitted | ${PROGRAM_FULL_NAME}`,
}

export default async function ApplySuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const idParam = params.id
  const applicationId = Array.isArray(idParam) ? idParam[0] : idParam

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
        <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Application submitted
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
          Thank you. Your application has been received.
        </h1>

        {applicationId ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="text-slate-500">Application ID</div>
            <div className="mt-1 break-all font-mono text-slate-900">{applicationId}</div>
          </div>
        ) : null}

        <ol className="mt-6 space-y-2 text-sm text-slate-700">
          <li>1. Your application is now under review.</li>
          <li>2. You will receive an update within {APPLICATION_REVIEW_DAYS} working days.</li>
          <li>3. If approved, you will complete payment, receive a set-password link, then log in as a student.</li>
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/student/login" className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">
            Student login
          </Link>
          <Link href="/apply/resume" className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
            Resume another application
          </Link>
          <Link href="/contact" className="text-teal-700 hover:underline">
            Contact support
          </Link>
        </div>
      </section>
    </main>
  )
}
