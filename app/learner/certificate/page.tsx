'use client'

import dynamic from 'next/dynamic'

const CertificationSystem = dynamic(
  () => import('@/components/lms/CertificationSystem').then((mod) => ({ default: mod.CertificationSystem })),
  { ssr: false }
)

export default function LearnerCertificatePage() {
  return <CertificationSystem />
}
