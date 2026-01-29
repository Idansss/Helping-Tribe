import type { ReactNode } from 'react'
import { LearnerLayout } from '@/components/learner/LearnerLayout'

export default function LearnerRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <LearnerLayout>{children}</LearnerLayout>
}
