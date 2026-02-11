'use client'

import Link from 'next/link'
import { ApplicationForm } from '@/components/public/ApplicationForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PublicHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-slate-50 to-white text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-600 px-6 py-6 md:px-8 md:py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-wide text-white/90">Helping Tribe</div>
                <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">The Helping Tribe School of Counselling &amp; Positive Psychology</h1>
                <p className="mt-2 text-sm md:text-base text-white/90 max-w-2xl">
                  Start with the application form. Approved students will log in with Matric Number + Password. Mentors/Admin use Email + Password.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="bg-white text-teal-800 hover:bg-white/90">
                  <Link href="/student/login">Student Login</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                >
                  <Link href="/staff/login">Mentor/Admin Login</Link>
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-base font-semibold text-slate-900">How it works</h2>
                <ol className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-700">
                  <li className="rounded-lg border bg-white p-3">
                    <div className="text-xs font-semibold text-teal-700">Step 1</div>
                    <div className="mt-1 font-medium text-slate-900">Apply</div>
                    <div className="mt-1 text-slate-600">Submit your application below.</div>
                  </li>
                  <li className="rounded-lg border bg-white p-3">
                    <div className="text-xs font-semibold text-teal-700">Step 2</div>
                    <div className="mt-1 font-medium text-slate-900">Get approved</div>
                    <div className="mt-1 text-slate-600">An admin reviews and approves applicants.</div>
                  </li>
                  <li className="rounded-lg border bg-white p-3">
                    <div className="text-xs font-semibold text-teal-700">Step 3</div>
                    <div className="mt-1 font-medium text-slate-900">Set password</div>
                    <div className="mt-1 text-slate-600">Use your one-time link to set a password.</div>
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Important</div>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  <li className="leading-relaxed">
                    Students <span className="font-medium">do not</span> sign up publicly and <span className="font-medium">do not</span> use email to log in.
                  </li>
                  <li className="leading-relaxed">
                    Your email on this form is for <span className="font-medium">approval updates only</span>.
                  </li>
                  <li className="leading-relaxed">
                    Already approved? Use <Link className="font-medium text-teal-700 hover:underline" href="/student/login">Student Login</Link>.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <ApplicationForm />
      </div>
    </div>
  )
}
