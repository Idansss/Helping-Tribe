import { redirect } from 'next/navigation'

type QuizPageProps = {
  params: Promise<{ moduleId: string }>
}

export default async function QuizPage({
  params,
}: QuizPageProps) {
  const { moduleId } = await params

  redirect(`/learner/course/module/${moduleId}/quiz`)
}
