'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpenCheck, KeyRound, ShieldCheck, UserRoundCheck, Sparkles, CheckCircle, Mail, CalendarX2 } from 'lucide-react'
import { ApplicationForm } from '@/components/public/ApplicationForm'
import { TopNav } from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function formatRegistrationDate(iso: string) {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

export function PublicHome() {
  const [regStatus, setRegStatus] = useState<'loading' | 'open' | 'closed' | 'not_yet'>('loading')
  const [regMessage, setRegMessage] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/settings/registration')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load registration status: ${res.status}`)
        }
        return res.json()
      })
      .then((data: { opensAt?: string | null; closesAt?: string | null }) => {
        if (cancelled) return
        const today = new Date().toISOString().slice(0, 10)
        const opensAt = data.opensAt?.trim() || null
        const closesAt = data.closesAt?.trim() || null
        if (opensAt && today < opensAt) {
          setRegStatus('not_yet')
          setRegMessage(`Registration opens on ${formatRegistrationDate(opensAt)}.`)
          return
        }
        if (closesAt && today > closesAt) {
          setRegStatus('closed')
          setRegMessage(`Registration closed on ${formatRegistrationDate(closesAt)}. Check back for the next cohort.`)
          return
        }
        setRegStatus('open')
        setRegMessage('')
      })
      .catch(() => {
        if (!cancelled) {
          setRegStatus('closed')
          setRegMessage('Registration status is temporarily unavailable. Please check back soon or contact support.')
        }
      })
    return () => { cancelled = true }
  }, [])

  const registrationClosed = regStatus === 'closed' || regStatus === 'not_yet'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f7f1_0%,#edf7f6_35%,#f8fbfb_65%,#ffffff_100%)] text-slate-900">
      <TopNav />
      <main id="main-content" className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:py-10 pb-0">
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

                  <Link href="/mentor-login" className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 hover:border-teal-300 hover:bg-teal-50/40 transition-colors group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                      <Mail className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Facilitator Login</p>
                      <p className="text-sm text-slate-500">Login with Email Address</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </Link>

                  <Link href="/staff/login" className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 hover:border-teal-300 hover:bg-teal-50/40 transition-colors group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
                      <ShieldCheck className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Admin Login</p>
                      <p className="text-sm text-slate-500">Login with Email Address</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </Link>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  {registrationClosed ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 px-6 py-3 font-semibold text-slate-600 cursor-not-allowed">
                      Application not available
                    </div>
                  ) : (
                    <Link href="#application-form" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 transition-colors">
                      Start Your Application
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
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

        <div id="application-form">
          {regStatus === 'loading' && (
            <Card className="rounded-2xl border-teal-100/80 p-8 text-center text-slate-500">
              Loading...
            </Card>
          )}
          {regStatus === 'open' && <ApplicationForm />}
          {registrationClosed && (
            <Card className="rounded-2xl border-amber-200 bg-amber-50/80 p-8">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                  <CalendarX2 className="h-7 w-7 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registration is not open</h3>
                  <p className="mt-2 text-sm text-slate-600">{regMessage}</p>
                </div>
                <p className="text-xs text-slate-500">
                  Already approved? <Link href="/student/login" className="font-semibold text-teal-700 hover:underline">Student Login</Link>
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>

      <footer className="mt-16 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-700 text-teal-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 overflow-hidden">
                  <Image src="/logo.png" alt="The Helping Tribe" width={36} height={36} className="object-contain p-0.5" />
                </div>
                <span className="font-bold text-white/95">The Helping Tribe</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-teal-100/70">
                Empowering minds through counselling and positive psychology.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white/95">Platform</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link scroll={false} href="/student/login" className="hover:text-white transition-colors text-teal-100/80">Student Login</Link></li>
                <li><Link scroll={false} href="/staff/login" className="hover:text-white transition-colors text-teal-100/80">Staff Login</Link></li>
                <li><Link scroll={false} href="/apply" className="hover:text-white transition-colors text-teal-100/80">Apply Now</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white/95">Support</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link scroll={false} href="/contact" className="hover:text-white transition-colors text-teal-100/80">Contact Us</Link></li>
                <li><Link scroll={false} href="/contact" className="hover:text-white transition-colors text-teal-100/80">Support Guide</Link></li>
                <li><Link scroll={false} href="/contact" className="hover:text-white transition-colors text-teal-100/80">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white/95">Legal</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link scroll={false} href="/privacy" className="hover:text-white transition-colors text-teal-100/80">Privacy Policy</Link></li>
                <li><Link scroll={false} href="/terms" className="hover:text-white transition-colors text-teal-100/80">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-teal-700/60 pt-6 text-sm text-teal-100/50">
            Copyright {new Date().getFullYear()} The Helping Tribe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
