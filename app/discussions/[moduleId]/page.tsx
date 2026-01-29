import { DiscussionThread } from '@/components/lms/DiscussionThread'
import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'

export default function ModuleDiscussionPage({
  params
}: {
  params: { moduleId: string }
}) {
  return (
    <LearnerPortalPlaceholder>
      <DiscussionThread moduleId={params.moduleId} />
    </LearnerPortalPlaceholder>
  )
}
