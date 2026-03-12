import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Users, AlertTriangle } from 'lucide-react'
import { BlurBlobs } from '@/components/blur-blobs'
import { StaffLoginForm } from '@/app/staff/login/staff-login-form'

function MarketingPanel() {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-teal-800 px-8 py-16 lg:px-14 lg:py-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -left-10 bottom-16 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden">
          <Image src="/logo.png" alt="The Helping Tribe" width={56} height={56} className="object-contain" />
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl text-balance">
          Facilitator portal sign in
        </h1>

        <p className="mt-5 text-base leading-relaxed text-white/80">
          Track learner progress, run sessions, grade submissions and support
          your counseling trainees.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3.5">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
              <div>
                <p className="text-sm font-semibold text-white">Facilitators &amp; Faculty only</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">
                  This login is exclusively for mentors and faculty. Admins must
                  use the Admin login page.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="flex items-start gap-3.5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="text-sm font-semibold text-white">Authorised access only</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">
                  Non-facilitator accounts will be rejected automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MentorLoginPage() {
  return (
    <div className="relative min-h-screen">
      <BlurBlobs />

      <div className="grid min-h-screen lg:grid-cols-2">
        <MarketingPanel />

        <div className="flex flex-col items-center justify-center px-6 py-16 lg:px-12">
          <div className="w-full max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-700 backdrop-blur-sm">
              <BookOpen className="h-3.5 w-3.5" />
              Facilitator login
            </span>

            <h2 className="mt-8 font-display text-3xl font-bold tracking-tight text-foreground">
              Facilitator Login
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your facilitator account to access the facilitator portal.
            </p>

            <StaffLoginForm portal="mentor" />

            <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <Link href="/staff/login" className="font-medium transition-colors hover:text-foreground">
                  Admin login
                </Link>
                <span className="text-border">|</span>
                <Link href="/student/login" className="font-medium transition-colors hover:text-foreground">
                  Student login
                </Link>
              </div>
              <Link href="/forgot-password" className="font-medium transition-colors hover:text-foreground">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
