'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function SetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [token, setToken] = useState<string | null>(null)
  const [matricNumber, setMatricNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalidReason, setInvalidReason] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const t = sp.get('token')
    setToken(t)
    if (!t) {
      setLoading(false)
      return
    }

    fetch(`/api/set-password/validate?token=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.valid) {
          setMatricNumber(json?.matricNumber ?? null)
          setInvalidReason(null)
        } else {
          setInvalidReason(json?.reason ?? null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Password too short', description: 'Use at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token,
          matricNumber: matricNumber ?? undefined,
          newPassword,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to set password')

      toast({ title: 'Password set', description: 'You can now log in with Matric Number + Password.' })
      router.push('/student/login')
      router.refresh()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e?.message || 'Error' })
    } finally {
      setSaving(false)
    }
  }

  const invalid = !loading && (!token || !matricNumber)
  const paymentRequired = invalidReason === 'PAYMENT_REQUIRED'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Set your password</CardTitle>
          <p className="text-sm text-slate-600">
            {loading
              ? 'Validating link…'
              : invalid
                ? paymentRequired
                  ? 'Payment required before you can set your password.'
                  : 'This link is invalid or has expired.'
                : `Matric Number: ${matricNumber}`}
          </p>
        </CardHeader>
        <CardContent>
          {invalid ? (
            <div className="space-y-3 text-sm">
              <p>
                {paymentRequired
                  ? 'Please complete payment first. If you have already paid, contact the admin to verify your payment and request a new set-password link.'
                  : 'Please contact the admin to request a new set-password link.'}
              </p>
              <Link href="/apply" className="text-teal-700 hover:underline">
                Back to application
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving…' : 'Set password'}
              </Button>
              <div className="text-xs text-slate-600 flex items-center justify-between">
                <Link href="/student/login" className="hover:underline">
                  Student login
                </Link>
                <Link href="/apply" className="hover:underline">
                  Back to application
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
