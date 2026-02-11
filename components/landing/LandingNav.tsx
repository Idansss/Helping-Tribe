'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Users, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-[#4c1d95] flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-serif text-[#1e1b4b]">Helping Tribe</span>
              <span className="text-sm text-gray-500 -mt-1 font-sans">HELP Foundations</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#program" className="text-gray-700 hover:text-[#4c1d95] transition-colors">
              Program
            </Link>
            <Link href="#curriculum" className="text-gray-700 hover:text-[#4c1d95] transition-colors">
              Curriculum
            </Link>
            <Link href="#faculty" className="text-gray-700 hover:text-[#4c1d95] transition-colors">
              Faculty
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-[#4c1d95] transition-colors">
              FAQ
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {isLoggedIn ? (
                  <Button className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white" asChild>
                    <Link href="/">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/student/login">Student Login</Link>
                    </Button>
                    <Button className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white" asChild>
                      <Link href="#enrollment">Join Next Cohort</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-[#4c1d95]" />
            ) : (
              <Menu className="h-6 w-6 text-[#4c1d95]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href="#program"
                className="text-gray-700 hover:text-[#4c1d95] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Program
              </Link>
              <Link
                href="#curriculum"
                className="text-gray-700 hover:text-[#4c1d95] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Curriculum
              </Link>
              <Link
                href="#faculty"
                className="text-gray-700 hover:text-[#4c1d95] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Faculty
              </Link>
              <Link
                href="#faq"
                className="text-gray-700 hover:text-[#4c1d95] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t">
                {!loading && (
                  <>
                    {isLoggedIn ? (
                      <Button className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white w-full" asChild>
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                          Go to Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link href="/student/login" onClick={() => setIsMobileMenuOpen(false)}>
                            Student Login
                          </Link>
                        </Button>
                        <Button className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white w-full" asChild>
                          <Link href="#enrollment" onClick={() => setIsMobileMenuOpen(false)}>
                            Join Next Cohort
                          </Link>
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
