import { DiscussionThread } from '@/components/lms/DiscussionThread'

type LearnerDiscussionThreadPageProps = {
  params: Promise<{ moduleId: string }>
}

export default async function LearnerDiscussionThreadPage({
  params,
}: LearnerDiscussionThreadPageProps) {
  const { moduleId } = await params

  return <DiscussionThread moduleId={moduleId} />
}
