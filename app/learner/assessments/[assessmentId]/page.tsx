import { AssessmentTool } from '@/components/lms/AssessmentTool'

type LearnerAssessmentDetailPageProps = {
  params: Promise<{ assessmentId: string }>
}

export default async function LearnerAssessmentDetailPage({
  params,
}: LearnerAssessmentDetailPageProps) {
  const { assessmentId } = await params

  return <AssessmentTool assessmentId={assessmentId} />
}
