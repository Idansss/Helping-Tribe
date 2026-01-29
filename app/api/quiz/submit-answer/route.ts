import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { attemptId, questionId, selectedAnswerIndex } = body
    if (
      typeof attemptId !== 'string' ||
      typeof questionId !== 'string' ||
      typeof selectedAnswerIndex !== 'number'
    ) {
      return NextResponse.json(
        { error: 'attemptId, questionId, and selectedAnswerIndex (number) required' },
        { status: 400 }
      )
    }

    // Ensure attempt belongs to this user
    const { data: attempt, error: attemptErr } = await supabase
      .from('quiz_attempts')
      .select('id, user_id')
      .eq('id', attemptId)
      .single()

    if (attemptErr || !attempt || attempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Attempt not found or not yours' }, { status: 403 })
    }

    // Already answered this question? (no updates allowed)
    const { data: existing } = await supabase
      .from('quiz_question_responses')
      .select('id')
      .eq('attempt_id', attemptId)
      .eq('question_id', questionId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Answer already submitted; you cannot change it.' },
        { status: 409 }
      )
    }

    // Get correct answer (server-side only)
    const { data: question, error: qErr } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer_index')
      .eq('id', questionId)
      .single()

    if (qErr || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const isCorrect =
      Number(question.correct_answer_index) === Number(selectedAnswerIndex)

    const { data: response, error: insertErr } = await supabase
      .from('quiz_question_responses')
      .insert({
        attempt_id: attemptId,
        question_id: questionId,
        selected_answer_index: selectedAnswerIndex,
        is_correct: isCorrect,
      })
      .select('id, is_correct')
      .single()

    if (insertErr) {
      return NextResponse.json(
        { error: insertErr.message || 'Failed to save answer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: response.id,
      is_correct: response.is_correct,
      message: response.is_correct ? 'Correct!' : 'Incorrect. Answer is locked.',
    })
  } catch (e) {
    console.error('Quiz submit-answer error:', e)
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
