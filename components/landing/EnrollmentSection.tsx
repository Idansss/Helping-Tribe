'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const included = [
  'Full access to 9-week online LMS platform',
  'All course materials and resources',
  'Peer Learning Circle membership',
  'Faculty mentorship and feedback',
  'Certificate of Completion upon graduation',
  'Lifetime access to resource directory',
]

export function EnrollmentSection() {
  return (
    <section id="enrollment" className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4c1d95] mb-4">
            Join the Next Cohort
          </h2>
          <p className="text-lg text-gray-700">
            Invest in your skills. Transform your community.
          </p>
        </div>

        <Card className="border-2 border-[#4c1d95] bg-gradient-to-br from-white to-[#f3e8ff]/30">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-[#4c1d95] mb-2">
              Course Fee
            </CardTitle>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl md:text-6xl font-bold text-[#4c1d95]">
                ₦
              </span>
              <span className="text-5xl md:text-6xl font-bold text-[#4c1d95]">
                45,000
              </span>
            </div>
            <CardDescription className="text-base text-gray-600 mt-2">
              One-time payment for full program access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-[#4c1d95] mb-3">What's Included:</h3>
              {included.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#4c1d95] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t">
              <Button
                size="lg"
                className="w-full bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-lg py-6"
                asChild
              >
                <Link href="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Limited spots available. Applications close soon.
              </p>
              <p className="text-center text-xs text-gray-500 mt-1">
                Prefer a quick form? Join the Tribe via our interest form:&nbsp;
                <a
                  href="https://forms.gle/KwDLsxydSBo51ng8A"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline text-[#4c1d95]"
                >
                  https://forms.gle/KwDLsxydSBo51ng8A
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
