import { createAdminClient } from '@/lib/supabase/admin'

export type AdminQuiz = {
  id: string
  title: string
  description: string | null
  published: boolean
}

export type AdminQuizQuestion = {
  id: string
  question_text: string
  options: string[]
  correct_answer_index: number
  sort_order: number
}

export type AdminQuizAttemptProfile = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
}

type AdminQuizAttemptRow = {
  id: string
  user_id: string
  quiz_id: string
  completed_at: string | null
}

export type AdminQuizAttempt = AdminQuizAttemptRow & {
  profile: AdminQuizAttemptProfile | null
}

export type AdminQuizQuestionResponse = {
  id: string
  attempt_id: string
  question_id: string
  selected_answer_index: number
  is_correct: boolean
  submitted_at: string | null
}

export type AdminQuizResponsesData = {
  quiz: AdminQuiz | null
  questions: AdminQuizQuestion[]
  attempts: AdminQuizAttempt[]
  responsesByAttempt: Record<string, AdminQuizQuestionResponse[]>
  errorMessage: string | null
}

export function attachProfilesToAttempts(
  attempts: AdminQuizAttemptRow[],
  profiles: AdminQuizAttemptProfile[],
) {
  const profilesById = profiles.reduce<Record<string, AdminQuizAttemptProfile>>((acc, profile) => {
    acc[profile.id] = profile
    return acc
  }, {})

  return attempts.map((attempt) => ({
    ...attempt,
    profile: profilesById[attempt.user_id] ?? null,
  }))
}

export function groupResponsesByAttempt(
  responses: AdminQuizQuestionResponse[],
) {
  return responses.reduce<Record<string, AdminQuizQuestionResponse[]>>((acc, response) => {
    acc[response.attempt_id] = acc[response.attempt_id] ?? []
    acc[response.attempt_id].push(response)
    return acc
  }, {})
}

export async function getAdminQuizResponsesData(
  quizId: string,
): Promise<AdminQuizResponsesData> {
  try {
    const supabase = createAdminClient()

    const { data: quizData, error: quizErr } = await supabase
      .from('quizzes')
      .select('id, title, description, published')
      .eq('id', quizId)
      .maybeSingle()

    if (quizErr) throw quizErr

    const { data: questionData, error: questionErr } = await supabase
      .from('quiz_questions')
      .select('id, question_text, options, correct_answer_index, sort_order')
      .eq('quiz_id', quizId)
      .order('sort_order', { ascending: true })

    if (questionErr) throw questionErr

    const { data: attemptData, error: attemptErr } = await supabase
      .from('quiz_attempts')
      .select('id, user_id, quiz_id, completed_at')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false, nullsFirst: false })

    if (attemptErr) throw attemptErr

    const attemptRows = (attemptData ?? []) as AdminQuizAttemptRow[]
    if (attemptRows.length === 0) {
      return {
        quiz: (quizData as AdminQuiz | null) ?? null,
        questions: (questionData ?? []) as AdminQuizQuestion[],
        attempts: [],
        responsesByAttempt: {},
        errorMessage: null,
      }
    }

    const userIds = [...new Set(attemptRows.map((attempt) => attempt.user_id))]
    const attemptIds = attemptRows.map((attempt) => attempt.id)

    const [{ data: profileData, error: profileErr }, { data: responseData, error: responseErr }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', userIds),
        supabase
          .from('quiz_question_responses')
          .select('id, attempt_id, question_id, selected_answer_index, is_correct, submitted_at')
          .in('attempt_id', attemptIds),
      ])

    if (profileErr) throw profileErr
    if (responseErr) throw responseErr

    return {
      quiz: (quizData as AdminQuiz | null) ?? null,
      questions: (questionData ?? []) as AdminQuizQuestion[],
      attempts: attachProfilesToAttempts(
        attemptRows,
        (profileData ?? []) as AdminQuizAttemptProfile[],
      ),
      responsesByAttempt: groupResponsesByAttempt(
        (responseData ?? []) as AdminQuizQuestionResponse[],
      ),
      errorMessage: null,
    }
  } catch (error) {
    console.error('Failed to load admin quiz responses', error)
    return {
      quiz: null,
      questions: [],
      attempts: [],
      responsesByAttempt: {},
      errorMessage:
        'Quiz responses could not be loaded right now. Check the server logs or Supabase configuration and try again.',
    }
  }
}
