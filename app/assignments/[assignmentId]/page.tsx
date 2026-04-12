import { redirect } from 'next/navigation'

type AssignmentPageProps = {
  params: Promise<{ assignmentId: string }>
}

export default async function AssignmentPage({
  params,
}: AssignmentPageProps) {
  await params

  redirect('/learner/course/modules')
}
