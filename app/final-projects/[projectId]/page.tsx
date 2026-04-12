import { redirect } from 'next/navigation'

type FinalProjectDetailPageProps = {
  params: Promise<{ projectId: string }>
}

export default async function FinalProjectDetailPage({
  params,
}: FinalProjectDetailPageProps) {
  const { projectId } = await params

  redirect(`/learner/final-projects/${projectId}`)
}
