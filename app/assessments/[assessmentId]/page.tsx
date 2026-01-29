'use client'

import { AssessmentTool } from '@/components/lms/AssessmentTool'
import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { useParams } from 'next/navigation'

export default function AssessmentDetailPage() {
  const params = useParams()
  const assessmentId = params.assessmentId as string

  return (
    <LearnerPortalPlaceholder>
      <AssessmentTool assessmentId={assessmentId} />
    </LearnerPortalPlaceholder>
  )
}
