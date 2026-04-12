import { FinalProjectSubmission } from '@/components/lms/FinalProjectSubmission'

type LearnerFinalProjectDetailPageProps = {
  params: Promise<{ projectId: string }>
}

export default async function LearnerFinalProjectDetailPage({
  params,
}: LearnerFinalProjectDetailPageProps) {
  const { projectId } = await params

  return <FinalProjectSubmission projectId={projectId} />
}
