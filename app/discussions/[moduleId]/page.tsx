import { redirect } from 'next/navigation'

type ModuleDiscussionPageProps = {
  params: Promise<{ moduleId: string }>
}

export default async function ModuleDiscussionPage({
  params,
}: ModuleDiscussionPageProps) {
  const { moduleId } = await params

  redirect(`/learner/discussions/${moduleId}`)
}
