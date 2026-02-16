'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpenCheck, KeyRound, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { ApplicationForm } from '@/components/public/ApplicationForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PublicHome() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f7f1_0%,#edf7f6_35%,#f8fbfb_65%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:py-10">
        <Card className="overflow-hidden rounded-2xl border-teal-100/80 shadow-[0_10px_30px_rgba(15,118,110,0.12)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-700 px-6 py-7 text-white md:px-10 md:py-10">
            <div className="pointer-events-none absolute -left-24 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <span className="relative h-10 w-10 overflow-hidden rounded-full bg-white/95 ring-1 ring-white/30">
                    <Image
                      src="/logo.png"
                      alt="The Helping Tribe"
                      fill
                      sizes="40px"
                      className="object-contain p-1"
                      priority
                    />
                  </span>
                  <span className="text-xs font-semibold tracking-[0.18em] text-white/90">THE HELPING TRIBE</span>
                </div>

                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                  The Helping Tribe School of Counselling &amp; Positive Psychology
                </h1>

                <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">
                  Start with the application form below. Once approved, use the correct portal to sign in.
                </p>

                <div className="mt-4 grid gap-2 text-sm text-white/95 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <KeyRound className="h-4 w-4 shrink-0" />
                    <span>Students: Matric Number + Password</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Mentors/Admin: Email + Password</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/30 bg-white/10 p-4 backdrop-blur-sm md:p-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-emerald-100">CHOOSE YOUR LOGIN PORTAL</p>
                <div className="mt-3 space-y-3">
                  <Button
                    asChild
                    className="h-auto w-full justify-between rounded-lg border border-white/80 bg-white px-4 py-3 text-left text-teal-900 hover:bg-white/95"
                  >
                    <Link href="/student/login">
                      <span className="flex items-center gap-2">
                        <UserRoundCheck className="h-5 w-5" />
                        <span>
                          <span className="block text-base font-semibold">Student Login</span>
                          <span className="block text-xs font-medium text-teal-700/90">Login with Matric Number</span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-between rounded-lg border-white/60 bg-white/10 px-4 py-3 text-left text-white hover:bg-white/15 hover:text-white"
                  >
                    <Link href="/staff/login">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        <span>
                          <span className="block text-base font-semibold">Mentor/Admin Login</span>
                          <span className="block text-xs font-medium text-white/80">Login with Email Address</span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
                <ol className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-3">
                  <li className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                      <BookOpenCheck className="h-4 w-4" />
                      Step 1
                    </div>
                    <div className="mt-2 font-semibold text-slate-900">Apply</div>
                    <div className="mt-1 text-slate-600">Submit your application below.</div>
                  </li>

                  <li className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                      <ShieldCheck className="h-4 w-4" />
                      Step 2
                    </div>
                    <div className="mt-2 font-semibold text-slate-900">Get approved</div>
                    <div className="mt-1 text-slate-600">An admin reviews and approves applicants.</div>
                  </li>

                  <li className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                      <KeyRound className="h-4 w-4" />
                      Step 3
                    </div>
                    <div className="mt-2 font-semibold text-slate-900">Set password</div>
                    <div className="mt-1 text-slate-600">Use your one-time link to set a password.</div>
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Important</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="leading-relaxed">
                    Students <span className="font-medium">do not</span> sign up publicly and <span className="font-medium">do not</span> use email to log in.
                  </li>
                  <li className="leading-relaxed">
                    Your email on this form is for <span className="font-medium">approval updates only</span>.
                  </li>
                  <li className="leading-relaxed text-teal-800">
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
