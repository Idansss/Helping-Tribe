import AdminQuizResponsesClient from './AdminQuizResponsesClient'
import { getAdminQuizResponsesData } from '@/lib/server/admin/quiz-responses'

export const dynamic = 'force-dynamic'

type AdminQuizResponsesPageProps = {
  params: Promise<{ quizId: string }>
}

export default async function AdminQuizResponsesPage({
  params,
}: AdminQuizResponsesPageProps) {
  const { quizId } = await params
  const data = await getAdminQuizResponsesData(quizId)

  return <AdminQuizResponsesClient {...data} />
}
