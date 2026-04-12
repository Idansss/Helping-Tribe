import { redirect } from 'next/navigation'

type CaseStudyPageProps = {
  params: Promise<{ id: string }>
}

export default async function CaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const { id } = await params

  redirect(`/learner/cases/${id}`)
}
