import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, UserCog, AlertTriangle } from 'lucide-react'
import { BlurBlobs } from '@/components/blur-blobs'
import { StaffLoginForm } from './staff-login-form'

function MarketingPanel() {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 px-8 py-16 lg:px-14 lg:py-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/5 blur-2xl" />
        <div className="absolute -left-10 bottom-16 h-48 w-48 rounded-full bg-slate-500/10 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden">
          <Image src="/logo.png" alt="The Helping Tribe" width={56} height={56} className="object-contain" />
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl text-balance">
          Admin portal sign in
        </h1>

        <p className="mt-5 text-base leading-relaxed text-slate-300/90">
          Manage learner progress, review applications, and oversee all course
          operations from the admin dashboard.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3.5">
              <UserCog className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
              <div>
                <p className="text-sm font-semibold text-white">Admin accounts only</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300/80">
                  This login is exclusively for admins. Facilitators must use the
                  Facilitator login page.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="text-sm font-semibold text-white">Authorised access only</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300/80">
                  Non-admin accounts will be rejected automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen">
      <BlurBlobs />

      <div className="grid min-h-screen lg:grid-cols-2">
        <MarketingPanel />

        <div className="flex flex-col items-center justify-center px-6 py-16 lg:px-12">
          <div className="w-full max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin login
            </span>

            <h2 className="mt-8 font-display text-3xl font-bold tracking-tight text-foreground">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your admin account to access the administration portal.
            </p>

            <StaffLoginForm portal="admin" />

            <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <Link href="/mentor-login" className="font-medium transition-colors hover:text-foreground">
                  Facilitator login
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
