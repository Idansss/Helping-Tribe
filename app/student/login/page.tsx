import Link from 'next/link'
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { BlurBlobs } from '@/components/blur-blobs'
import { StudentLoginForm } from './student-login-form'

function MarketingPanel() {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-8 py-16 lg:px-14 lg:py-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl text-balance">
          Continue your training journey
        </h1>

        <p className="mt-5 text-base leading-relaxed text-teal-100/90">
          Access your personalised dashboard, course materials, and progress
          tracking - all in one place.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {[
            {
              icon: BookOpen,
              text: 'Full access to course modules & resources',
            },
            {
              icon: Award,
              text: 'Track your certification progress',
            },
            {
              icon: Users,
              text: 'Connect with mentors and peers',
            },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <item.icon className="h-4 w-4 text-teal-100" />
              </div>
              <span className="text-sm font-medium text-teal-50/95">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoAlert() {
  return (
    <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 backdrop-blur-sm">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="text-sm leading-relaxed text-amber-800/80">
          <p>
            <strong className="font-semibold text-amber-900">
              Payment is required
            </strong>{' '}
            before you can set your password. Use the one-time setup link sent to
            you after approval.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function StudentLoginPage() {
  return (
    <div className="relative min-h-screen">
      <BlurBlobs />

      <div className="grid min-h-screen lg:grid-cols-2">
        <MarketingPanel />

        <div className="flex flex-col items-center justify-center px-6 py-16 lg:px-12">
          <div className="w-full max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/60 bg-teal-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-700 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure learner login
            </span>

            <h2 className="mt-8 font-display text-3xl font-bold tracking-tight text-foreground">
              Student Login
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your matric number and password to access your dashboard.
            </p>

            <StudentLoginForm />

            <InfoAlert />

            <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <Link
                  href="/apply"
                  className="font-medium transition-colors hover:text-foreground"
                >
                  Back to application
                </Link>
                <span className="text-border">|</span>
                <Link
                  href="/staff/login"
                  className="font-medium transition-colors hover:text-foreground"
                >
                  Mentor / Admin login
                </Link>
              </div>
              <Link
                href="/contact"
                className="font-medium transition-colors hover:text-foreground"
              >
                Need help?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

