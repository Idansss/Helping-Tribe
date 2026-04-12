import { AssessmentEngine } from '@/components/lms/AssessmentEngine'

type LearnerModuleQuizPageProps = {
  params: Promise<{ moduleId: string }>
}

export default async function LearnerModuleQuizPage({
  params,
}: LearnerModuleQuizPageProps) {
  const { moduleId } = await params

  return <AssessmentEngine moduleId={moduleId} />
}
