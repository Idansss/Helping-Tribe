'use client'

import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { WhySection } from '@/components/landing/WhySection'
import { CurriculumSection } from '@/components/landing/CurriculumSection'
import { TribeExperienceSection } from '@/components/landing/TribeExperienceSection'
import { FacultySection } from '@/components/landing/FacultySection'
import { EnrollmentSection } from '@/components/landing/EnrollmentSection'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <WhySection />
        <CurriculumSection />
        <TribeExperienceSection />
        <FacultySection />
        <EnrollmentSection />
      </main>
      <LandingFooter />
    </div>
  )
}
