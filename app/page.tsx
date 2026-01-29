'use client'

import { LearnerLayout } from '@/components/learner/LearnerLayout'
import { DashboardContent } from '@/components/learner/DashboardContent'

export default function HomePage() {
  return (
    <LearnerLayout>
      <DashboardContent />
    </LearnerLayout>
  )
}
