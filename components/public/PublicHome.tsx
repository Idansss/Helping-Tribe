'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpenCheck, KeyRound, ShieldCheck, UserRoundCheck, Sparkles, CheckCircle } from 'lucide-react'
import { ApplicationForm } from '@/components/public/ApplicationForm'
import { TopNav } from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PublicHome() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f7f1_0%,#edf7f6_35%,#f8fbfb_65%,#ffffff_100%)] text-slate-900">
      <TopNav />
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
                <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
                <ol className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <li className="rounded-2xl bg-blue-50 p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl font-bold shadow-md">
                      1
                    </div>
                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-blue-600">Step 1</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">Apply</div>
                    <div className="mt-1 text-slate-600">Submit your application below.</div>
                  </li>

                  <li className="rounded-2xl bg-purple-50 p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xl font-bold shadow-md">
                      2
                    </div>
                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-purple-600">Step 2</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">Get approved</div>
                    <div className="mt-1 text-slate-600">An admin reviews and approves applicants.</div>
                  </li>

                  <li className="rounded-2xl bg-emerald-50 p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xl font-bold shadow-md">
                      3
                    </div>
                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600">Step 3</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">Set password</div>
                    <div className="mt-1 text-slate-600">Use your one-time link to set a password.</div>
                  </li>
                </ol>
              </div>

              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm flex-shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-base font-bold text-slate-900">Important</span>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>Students <span className="font-medium">do not</span> sign up publicly and <span className="font-medium">do not</span> use email to log in.</span>
                  </li>
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>Your email on this form is for <span className="font-bold">approval updates only</span>.</span>
                  </li>
                </ul>
                <div className="mt-4 border-t border-amber-200 pt-4 text-sm text-slate-600">
                  Already approved?{' '}
                  <Link className="font-bold text-teal-700 hover:underline" href="/student/login">
                    Use Student Login
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ApplicationForm />
      </div>
    </div>
  )
}
