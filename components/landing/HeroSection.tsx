'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ArrowRight, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-[#f3e8ff] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4c1d95] leading-tight">
              School of Counselling &amp; Positive Psychology
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              The Helping Tribe is more than a school—it&apos;s a movement. Here, you&apos;ll
              find knowledge beyond textbooks, a tribe that uplifts you, and tools to
              build a fulfilling practice.
            </p>
            <p className="text-sm md:text-base text-gray-600 italic">
              Let&apos;s nurture excellence—together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!loading && (
                <>
                  {isLoggedIn ? (
                    <Button
                      size="lg"
                      className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-lg px-8 py-6"
                      asChild
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-5 w-5" />
                        Go to Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-lg px-8 py-6"
                      asChild
                    >
                      <Link href="#enrollment">
                        Join the Tribe
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                </>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[var(--talent-primary-dark)] text-[var(--talent-primary-dark)] bg-white hover:bg-[var(--talent-primary-dark)] hover:text-white transition-colors text-lg px-8 py-6"
                asChild
              >
                <Link href="/contact">
                  <Download className="mr-2 h-5 w-5" />
                  Request Syllabus
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--talent-primary-dark)] to-[var(--talent-primary)] p-1">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-teal-50 flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-[var(--talent-primary-dark)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Peer Learning Circle
                  </p>
                  <p className="text-xs text-gray-500">
                    Diverse group of learners supporting each other
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
