'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpenCheck, KeyRound, ShieldCheck, UserRoundCheck, Sparkles, CheckCircle, Mail } from 'lucide-react'
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

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <span className="relative h-12 w-12 overflow-hidden rounded-full bg-white/95 ring-1 ring-white/30">
                    <Image
                      src="/logo.png"
                      alt="The Helping Tribe"
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                      priority
                    />
                  </span>
                  <span className="text-sm font-semibold tracking-[0.18em] text-white/90">THE HELPING TRIBE</span>
                </div>

                <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  The Helping Tribe School of Counselling &amp; Positive Psychology
                </h1>

                <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
                  Start with the application form below. Once approved, use the correct portal to sign in.
                </p>

                <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Students</p>
                    <p className="mt-1.5 flex items-center gap-2 text-base font-bold text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                      Matric + Password
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Staff</p>
                    <p className="mt-1.5 flex items-center gap-2 text-base font-bold text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                      Email + Password
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900">Choose Your Portal</h3>
                <p className="mt-1 text-sm text-slate-500">Select how you'd like to access your account</p>

                <div className="mt-5 space-y-3">
                  <Link href="/student/login" className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 hover:border-teal-300 hover:bg-teal-50/40 transition-colors group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                      <UserRoundCheck className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Student Login</p>
                      <p className="text-sm text-slate-500">Login with Matric Number</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </Link>

                  <Link href="/staff/login" className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 hover:border-teal-300 hover:bg-teal-50/40 transition-colors group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                      <Mail className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Mentor/Admin Login</p>
                      <p className="text-sm text-slate-500">Login with Email Address</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </Link>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <Link href="#application-form" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 transition-colors">
                    Start Your Application
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
