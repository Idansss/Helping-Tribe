'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HELP_FOUNDATIONAL_COURSE, computeHelpFoundationalCoursePricing } from '@/lib/payments/helpFoundationalCourse'
import { useToast } from '@/hooks/use-toast'

type PaymentOption = 'FULL' | 'HALF'

export default function PayClient() {
  const sp = useSearchParams()
  const { toast } = useToast()
  const applicantId = sp.get('applicantId') || undefined
  const studentId = sp.get('studentId') || undefined
  const [loading, setLoading] = useState(false)
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('FULL')

  const pricing = useMemo(() => computeHelpFoundationalCoursePricing(), [])
  const closed = pricing.phase === 'CLOSED'
  const halfAmountNgn = Math.ceil(pricing.amountNgn / 2)

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
        body: JSON.stringify({ applicantId, studentId, paymentOption }),
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
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6">
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
                    NGN {pricing.amountNgn.toLocaleString()}
                    {pricing.discountApplied && (
                      <span className="ml-2 text-sm font-medium text-slate-500 line-through">
                        NGN {pricing.baseFeeNgn.toLocaleString()}
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

            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-900">Choose payment option</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentOption('FULL')}
                  className={`rounded-lg border p-4 text-left transition ${
                    paymentOption === 'FULL'
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-semibold">Full payment</div>
                  <div className="mt-1 text-sm text-slate-600">Pay the entire course fee now.</div>
                  <div className="mt-3 text-lg font-semibold">NGN {pricing.amountNgn.toLocaleString()}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('HALF')}
                  className={`rounded-lg border p-4 text-left transition ${
                    paymentOption === 'HALF'
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-semibold">Half payment</div>
                  <div className="mt-1 text-sm text-slate-600">Pay the first installment now and clear the balance later.</div>
                  <div className="mt-3 text-lg font-semibold">NGN {halfAmountNgn.toLocaleString()}</div>
                </button>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Students who start with a half payment can continue training, but the remaining balance must be paid before certificate release.
              </div>
            </div>

            <Button
              onClick={startPayment}
              disabled={loading || closed}
              className="w-full bg-teal-700 text-white hover:bg-teal-800"
            >
              {loading ? 'Redirecting to Paystack...' : `Pay ${paymentOption === 'HALF' ? 'half' : 'full'} amount with Paystack`}
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
