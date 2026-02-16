'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Hash, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

function getSafeRedirectPath(redirectTo: string | null) {
  if (!redirectTo) return '/learner/dashboard'
  if (!redirectTo.startsWith('/')) return '/apply'
  if (redirectTo.startsWith('//')) return '/apply'
  return redirectTo
}

export function StudentLoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
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

      if (!res.ok) {
        const code = String(json?.code ?? '')
        if (code === 'PAYMENT_REQUIRED') {
          throw new Error(
            'Payment required. Please pay with the Paystack link from admin, then set your password using the one-time link.'
          )
        }
        if (code === 'PASSWORD_SETUP_REQUIRED') {
          throw new Error('Password setup required. Ask admin for your one-time set-password link.')
        }
        if (code === 'PAYMENTS_NOT_CONFIGURED') {
          throw new Error('Payments are not configured yet. Admin must run the payments database migration.')
        }
        throw new Error(json?.error || 'Login failed')
      }

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
    <form className="mt-10 flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="matric" className="text-sm font-medium text-foreground">
          Matric Number
        </Label>
        <div className="relative">
          <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="matric"
            value={matricNumber}
            onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
            placeholder="Enter your matric number"
            className="h-12 rounded-xl border-border/60 bg-background/60 pl-10 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            autoCapitalize="characters"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-teal-600 transition-colors hover:text-teal-700"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-12 rounded-xl border-border/60 bg-background/60 pl-10 pr-10 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-900/25 active:scale-[0.98]"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
