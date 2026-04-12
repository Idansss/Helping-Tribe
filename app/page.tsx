import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { WhySection } from '@/components/landing/WhySection'
import { CurriculumSection } from '@/components/landing/CurriculumSection'
import { TribeExperienceSection } from '@/components/landing/TribeExperienceSection'
import { FacultySection } from '@/components/landing/FacultySection'
import { EnrollmentSection } from '@/components/landing/EnrollmentSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { PROGRAM_FULL_NAME, SCHOOL_NAME } from '@/lib/brand/program'

export const metadata: Metadata = {
  title: `${SCHOOL_NAME} | Admissions Overview`,
  description:
    `Explore ${PROGRAM_FULL_NAME}, see how admissions work, and start your application when ready.`,
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main id="main-content">
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
