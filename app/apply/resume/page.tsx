'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  APPLICATION_DRAFT_ID_STORAGE_KEY,
  APPLICATION_DRAFT_TOKEN_STORAGE_KEY,
  buildDraftResumePath,
} from '@/lib/applications/draft-resume'

export default function ApplyResumePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null)
  const [savedDraftToken, setSavedDraftToken] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem(APPLICATION_DRAFT_ID_STORAGE_KEY)
    const token = localStorage.getItem(APPLICATION_DRAFT_TOKEN_STORAGE_KEY)
    if (existing) setSavedDraftId(existing)
    if (token) setSavedDraftToken(token)
  }, [])

  function continueWithDraftId(draftId: string, draftToken: string) {
    router.push(buildDraftResumePath(draftId, draftToken))
  }

  async function lookupByEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/apply/resume', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to find application')

      toast({
        title: 'Check your email',
        description: json?.message || 'If we found a saved application, we sent the next steps to your email.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Resume failed',
        description: error?.message || 'Unable to resume application',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-xl space-y-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Resume application</CardTitle>
            <p className="text-sm text-slate-600">
              Continue a previously saved draft with a secure resume link.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {savedDraftId && savedDraftToken ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="text-slate-600">Saved draft found on this device</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">{savedDraftId}</p>
                <Button
                  className="mt-3 w-full bg-teal-700 text-white hover:bg-teal-800"
                  onClick={() => continueWithDraftId(savedDraftId, savedDraftToken)}
                >
                  Continue saved draft
                </Button>
              </div>
            ) : savedDraftId ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                This saved draft needs a fresh secure resume link. Use your email below and we&apos;ll send it.
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                No local draft found on this device.
              </div>
            )}

            <form className="space-y-3" onSubmit={lookupByEmail}>
              <Label htmlFor="email">Resume using email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
              <Button type="submit" variant="outline" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Email me a secure resume link'}
              </Button>
            </form>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <Link href="/apply" className="hover:underline">
                Start new application
              </Link>
              <Link href="/contact" className="hover:underline">
                Need help?
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
