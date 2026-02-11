import { Suspense } from 'react'
import PayClient from './pay-client'

export const dynamic = 'force-dynamic'

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

