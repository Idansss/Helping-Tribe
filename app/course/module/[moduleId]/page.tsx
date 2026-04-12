import { redirect } from 'next/navigation'

type ModulePageProps = {
  params: Promise<{ moduleId: string }>
}

export default async function ModulePage({
  params,
}: ModulePageProps) {
  const { moduleId } = await params

  redirect(`/learner/course/module/${moduleId}`)
}
