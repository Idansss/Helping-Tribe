'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { BlurBlobs } from '@/components/blur-blobs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <BlurBlobs />
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Reset your password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 text-sm text-teal-800">
                  <p className="font-semibold">Check your email</p>
                  <p className="mt-1 text-teal-700">
                    A password reset link has been sent to <span className="font-medium">{email}</span>. Click the link in the email to set a new password.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/mentor-login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 rounded-xl pl-10 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/mentor-login" className="font-medium hover:text-foreground transition-colors">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
