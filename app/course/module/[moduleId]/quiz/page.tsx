import { LearnerLayout } from '@/components/lms/LearnerLayout'
import { AssessmentEngine } from '@/components/lms/AssessmentEngine'

export default function QuizPage({
  params,
}: {
  params: { moduleId: string }
}) {
  return (
    <LearnerLayout>
      <AssessmentEngine moduleId={params.moduleId} />
    </LearnerLayout>
  )
}
