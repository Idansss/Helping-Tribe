import { describe, expect, it } from 'vitest'
import {
  attachProfilesToAttempts,
  groupResponsesByAttempt,
} from '../lib/server/admin/quiz-responses'

describe('admin quiz responses helpers', () => {
  it('attaches profiles to attempts using the attempt user id', () => {
    const attempts = [
      {
        id: 'attempt-1',
        user_id: 'user-1',
        quiz_id: 'quiz-1',
        completed_at: '2026-04-19T12:00:00.000Z',
      },
      {
        id: 'attempt-2',
        user_id: 'user-2',
        quiz_id: 'quiz-1',
        completed_at: null,
      },
    ]

    const profiles = [
      {
        id: 'user-1',
        full_name: 'Ada Mentor',
        email: 'ada@example.com',
        role: 'student',
      },
    ]

    expect(attachProfilesToAttempts(attempts, profiles)).toEqual([
      {
        ...attempts[0],
        profile: profiles[0],
      },
      {
        ...attempts[1],
        profile: null,
      },
    ])
  })

  it('groups question responses by attempt id', () => {
    expect(
      groupResponsesByAttempt([
        {
          id: 'response-1',
          attempt_id: 'attempt-1',
          question_id: 'question-1',
          selected_answer_index: 2,
          is_correct: false,
          submitted_at: '2026-04-19T12:00:00.000Z',
        },
        {
          id: 'response-2',
          attempt_id: 'attempt-1',
          question_id: 'question-2',
          selected_answer_index: 1,
          is_correct: true,
          submitted_at: '2026-04-19T12:01:00.000Z',
        },
        {
          id: 'response-3',
          attempt_id: 'attempt-2',
          question_id: 'question-1',
          selected_answer_index: 0,
          is_correct: true,
          submitted_at: '2026-04-19T12:02:00.000Z',
        },
      ]),
    ).toEqual({
      'attempt-1': [
        {
          id: 'response-1',
          attempt_id: 'attempt-1',
          question_id: 'question-1',
          selected_answer_index: 2,
          is_correct: false,
          submitted_at: '2026-04-19T12:00:00.000Z',
        },
        {
          id: 'response-2',
          attempt_id: 'attempt-1',
          question_id: 'question-2',
          selected_answer_index: 1,
          is_correct: true,
          submitted_at: '2026-04-19T12:01:00.000Z',
        },
      ],
      'attempt-2': [
        {
          id: 'response-3',
          attempt_id: 'attempt-2',
          question_id: 'question-1',
          selected_answer_index: 0,
          is_correct: true,
          submitted_at: '2026-04-19T12:02:00.000Z',
        },
      ],
    })
  })
})
