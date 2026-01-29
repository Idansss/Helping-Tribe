'use client'

import dynamic from 'next/dynamic'
import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'

const CertificationSystem = dynamic(
  () => import('@/components/lms/CertificationSystem').then(mod => ({ default: mod.CertificationSystem })),
  { ssr: false }
)

export default function CertificatePage() {
  return (
    <LearnerPortalPlaceholder>
      <CertificationSystem />
    </LearnerPortalPlaceholder>
  )
}
