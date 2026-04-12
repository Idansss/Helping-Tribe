import type { Metadata } from 'next'
import { Suspense } from 'react'
import PayClient from './pay-client'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: `Payment | ${PROGRAM_FULL_NAME}`,
  description:
    'Complete approved applicant payment and continue onboarding into the learner portal.',
  alternates: {
    canonical: '/pay',
  },
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Loading payment…
            </div>
          </div>
        </div>
      }
    >
      <PayClient />
    </Suspense>
  )
}
