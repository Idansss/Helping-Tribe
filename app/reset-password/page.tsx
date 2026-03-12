'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { BlurBlobs } from '@/components/blur-blobs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type State = 'loading' | 'ready' | 'invalid' | 'done'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) {
      setState('invalid')
      return
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setState('invalid')
      } else {
        setState('ready')
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setState('done')
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <BlurBlobs />
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Set new password</CardTitle>
          </CardHeader>
          <CardContent>
            {state === 'loading' && (
              <p className="text-sm text-muted-foreground">Verifying reset link…</p>
            )}

            {state === 'invalid' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  <p className="font-semibold">Link invalid or expired</p>
                  <p className="mt-1 text-red-700">This reset link has expired or already been used. Please request a new one.</p>
                </div>
                <Button asChild className="w-full bg-teal-600 text-white hover:bg-teal-700">
                  <Link href="/forgot-password">Request new link</Link>
                </Button>
              </div>
            )}

            {state === 'ready' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">New password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="h-12 rounded-xl pr-10 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="h-12 rounded-xl text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    required
                    minLength={8}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {saving ? 'Saving…' : 'Update password'}
                </Button>
              </form>
            )}

            {state === 'done' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 text-sm text-teal-800">
                  <p className="font-semibold">Password updated!</p>
                  <p className="mt-1 text-teal-700">Your password has been changed. You can now log in.</p>
                </div>
                <Button asChild className="w-full bg-teal-600 text-white hover:bg-teal-700">
                  <Link href="/mentor-login">Go to login</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
