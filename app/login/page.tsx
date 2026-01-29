'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: 'student',
            full_name: fullName || email.split('@')[0],
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      setSuccess('Account created successfully! Please check your email to verify your account, or sign in if email verification is disabled.')
      
      // Auto sign in after signup if email confirmation is disabled
      if (data.session) {
        router.push('/')
        router.refresh()
      } else {
        // Wait a moment then switch to sign in mode
        setTimeout(() => {
          setIsSignUp(false)
          setSuccess('Account created! You can now sign in.')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-10 items-center">
        {/* Brand column */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2 border border-slate-200">
            <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white border border-slate-200">
              <Image
                src="/logo.png"
                alt="The Helping Tribe"
                fill
                className="object-contain p-0.5"
                sizes="40px"
                priority
              />
            </span>
            <div className="text-xs leading-tight">
              <p className="font-semibold tracking-wide text-slate-900">
                The Helping Tribe
              </p>
              <p className="text-slate-500">
                School of Counselling &amp; Positive Psychology
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Your counseling training home base.
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-md">
              Sign in to continue your 9‑week journey, access live sessions,
              complete practicum tasks and stay connected to your peer circle.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-slate-800 font-semibold flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  9
                </span>
                Weeks of structured growth
              </p>
              <p className="text-slate-600">
                Foundations, ethics, skills labs and practice‑ready supervision.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-slate-800 font-semibold flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs">
                  ●
                </span>
                Built for helping professionals
              </p>
              <p className="text-slate-600">
                Join a safe, supportive space for counselors, coaches and caregivers.
              </p>
            </div>
          </div>

          <p className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 pt-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Secure login powered by Supabase Auth.
          </p>
        </div>

        {/* Auth card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-white border border-slate-200 shadow-xl">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {isSignUp
                      ? 'Start your journey with The Helping Tribe.'
                      : 'Sign in to your Helping Tribe portal.'}
                  </CardDescription>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] uppercase tracking-wide text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Secure
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <form
                onSubmit={isSignUp ? handleSignUp : handleLogin}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-md text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {success}
                  </div>
                )}

                {isSignUp && (
                  <div className="space-y-1.5">
                    <Label htmlFor="full-name" className="text-xs text-slate-700">
                      Full name
                    </Label>
                    <div className="relative">
                      <Input
                        id="full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                        className="pl-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                        placeholder="Abass Ibrahim"
                      />
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      placeholder="you@example.com"
                    />
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {isSignUp && (
                    <p className="text-[11px] text-slate-500">
                      Use at least 6 characters. You can change this later from your
                      profile.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full justify-center gap-2 bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      {isSignUp ? 'Creating account…' : 'Signing in…'}
                    </span>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    By continuing you agree to our community guidelines.
                  </span>
                </div>

                <div className="pt-2 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setError(null)
                      setSuccess(null)
                    }}
                    className="text-teal-600 hover:text-teal-700 hover:underline underline-offset-4"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
