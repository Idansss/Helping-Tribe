'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function getSafeRedirectPath(redirectTo: string | null) {
  if (!redirectTo) return '/mentor'
  if (!redirectTo.startsWith('/')) return '/'
  if (redirectTo.startsWith('//')) return '/'
  return redirectTo
}

export default function StaffLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirectTo, setRedirectTo] = useState('/mentor')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    setRedirectTo(getSafeRedirectPath(sp.get('redirectTo')))
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Mentor/Admin Login</CardTitle>
          <p className="text-sm text-slate-600">
            Staff accounts are provisioned by admin.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="text-xs text-slate-600 flex items-center justify-between">
              <Link href="/apply" className="hover:underline">
                Back to application
              </Link>
              <Link href="/student/login" className="hover:underline">
                Student login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
