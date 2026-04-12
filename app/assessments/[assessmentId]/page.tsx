import { redirect } from 'next/navigation'

type AssessmentDetailPageProps = {
  params: Promise<{ assessmentId: string }>
}

export default async function AssessmentDetailPage({
  params,
}: AssessmentDetailPageProps) {
  const { assessmentId } = await params

  redirect(`/learner/assessments/${assessmentId}`)
}
