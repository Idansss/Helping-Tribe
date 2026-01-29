'use client'

import { FinalProjectSubmission } from '@/components/lms/FinalProjectSubmission'
import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { useParams } from 'next/navigation'

export default function FinalProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <LearnerPortalPlaceholder>
      <FinalProjectSubmission projectId={projectId} />
    </LearnerPortalPlaceholder>
  )
}
