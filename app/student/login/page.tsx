'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowRight, GraduationCap, Hash, KeyRound, ShieldCheck } from 'lucide-react'

function getSafeRedirectPath(redirectTo: string | null) {
  if (!redirectTo) return '/learner/dashboard'
  if (!redirectTo.startsWith('/')) return '/'
  if (redirectTo.startsWith('//')) return '/'
  return redirectTo
}

export default function StudentLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [matricNumber, setMatricNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirectTo, setRedirectTo] = useState('/learner/dashboard')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    setRedirectTo(getSafeRedirectPath(sp.get('redirectTo')))
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ matricNumber, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Login failed')
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: err?.message || 'Invalid credentials',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-14 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:block">
            <div className="max-w-lg space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
                <GraduationCap className="h-4 w-4" />
                Learner Access
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900">
                Continue your training journey
              </h1>
              <p className="text-base leading-relaxed text-slate-600">
                Sign in with your matric number and password to access courses, journals, quizzes, and your learner dashboard.
              </p>
              <div className="grid gap-3 pt-1 text-sm text-slate-700">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3">
                  <Hash className="h-4 w-4 text-cyan-700" />
                  <span>Use the approved matric number shared by admin.</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3">
                  <KeyRound className="h-4 w-4 text-cyan-700" />
                  <span>Password must be set using your one-time setup link first.</span>
                </div>
              </div>
            </div>
          </section>

          <Card className="w-full border-slate-200 bg-white/95 shadow-xl shadow-slate-300/25 backdrop-blur-sm">
            <CardHeader className="space-y-3 pb-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure learner login
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-semibold tracking-tight">Student Login</CardTitle>
                <p className="text-sm text-slate-600">
                  Use your Matric Number + Password.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="matric" className="text-sm font-medium text-slate-800">Matric Number</Label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="matric"
                      value={matricNumber}
                      onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                      placeholder="HF-CT-2026-0001"
                      autoCapitalize="characters"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 text-[15px] focus-visible:ring-2 focus-visible:ring-cyan-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-800">Password</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 text-[15px] focus-visible:ring-2 focus-visible:ring-cyan-500"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-cyan-700 text-white hover:bg-cyan-800"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 px-3 py-2 text-xs text-cyan-900">
                  If this is your first login, ask admin for your set-password link.
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-600 focus-within:outline-none focus-within:ring-0">
                  <Link
                    href="/apply"
                    className="font-medium hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4 focus-visible:decoration-2"
                  >
                    Back to application
                  </Link>
                  <Link
                    href="/staff/login"
                    className="font-medium hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4 focus-visible:decoration-2"
                  >
                    Mentor/Admin login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
