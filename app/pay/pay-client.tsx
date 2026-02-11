'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HELP_FOUNDATIONAL_COURSE, computeHelpFoundationalCoursePricing } from '@/lib/payments/helpFoundationalCourse'
import { useToast } from '@/hooks/use-toast'

export default function PayClient() {
  const sp = useSearchParams()
  const { toast } = useToast()
  const applicantId = sp.get('applicantId') || undefined
  const studentId = sp.get('studentId') || undefined
  const [loading, setLoading] = useState(false)

  const pricing = useMemo(() => computeHelpFoundationalCoursePricing(), [])
  const closed = pricing.phase === 'CLOSED'

  async function startPayment() {
    if (!applicantId && !studentId) {
      toast({
        variant: 'destructive',
        title: 'Missing student/applicant',
        description: 'Open this page with ?applicantId=... or ?studentId=...',
      })
      return
    }

    if (closed) {
      toast({
        variant: 'destructive',
        title: 'Registration closed',
        description: `Registration closed ${HELP_FOUNDATIONAL_COURSE.registrationClosesLabel}`,
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId, studentId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to initialize payment')

      window.location.href = json.authorizationUrl
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Payment failed', description: e?.message || 'Error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Course payment</h1>
          <Link href="/apply" className="text-sm text-slate-600 hover:underline">
            Back to application
          </Link>
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">{HELP_FOUNDATIONAL_COURSE.title}</CardTitle>
            <div className="text-sm text-slate-600">
              <div>Early bird discount closes {HELP_FOUNDATIONAL_COURSE.earlyBirdClosesLabel} (15% off)</div>
              <div>Registration closes {HELP_FOUNDATIONAL_COURSE.registrationClosesLabel}</div>
              <div>Class begins {HELP_FOUNDATIONAL_COURSE.classBeginsLabel}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-600">Course fee</div>
                  <div className="text-2xl font-semibold text-slate-900">
                    ₦{pricing.amountNgn.toLocaleString()}
                    {pricing.discountApplied && (
                      <span className="ml-2 text-sm font-medium text-slate-500 line-through">
                        ₦{pricing.baseFeeNgn.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {pricing.discountApplied && (
                    <div className="text-sm text-emerald-700">
                      Early bird discount applied ({pricing.discountPercent}% off)
                    </div>
                  )}
                </div>
                <Badge variant={pricing.discountApplied ? 'default' : 'secondary'}>
                  {pricing.phase === 'EARLY_BIRD' ? 'Early bird' : pricing.phase === 'REGULAR' ? 'Regular' : 'Closed'}
                </Badge>
              </div>
            </div>

            {closed && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Registration closed {HELP_FOUNDATIONAL_COURSE.registrationClosesLabel}.
              </div>
            )}

            <Button onClick={startPayment} disabled={loading || closed} className="w-full bg-teal-700 hover:bg-teal-800 text-white">
              {loading ? 'Redirecting to Paystack…' : 'Pay with Paystack'}
            </Button>

            <div className="text-xs text-slate-500">
              Payment is verified on the server. Do not share your payment reference publicly.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

