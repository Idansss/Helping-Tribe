import { describe, expect, it, vi } from 'vitest'
import { unlockStudentWeek } from '../lib/server/admin/unlock-week'

describe('unlockStudentWeek', () => {
  it('returns a no-op for week 1', async () => {
    const result = await unlockStudentWeek(
      {
        actorUserId: 'admin-1',
        studentId: 'student-1',
        weekNumber: 1,
      },
      {
        getModuleByWeekNumber: vi.fn(),
        getModuleProgress: vi.fn(),
        getStudentById: vi.fn(),
        markModuleComplete: vi.fn(),
      }
    )

    expect(result.alreadyUnlocked).toBe(true)
    expect(result.note).toContain('Week 1')
    expect(result.previousModuleId).toBeNull()
  })

  it('rejects unpaid students', async () => {
    await expect(
      unlockStudentWeek(
        {
          actorUserId: 'admin-1',
          studentId: 'student-1',
          weekNumber: 4,
        },
        {
          getModuleByWeekNumber: vi.fn(),
          getModuleProgress: vi.fn(),
          getStudentById: vi.fn(async () => ({ id: 'student-1', isPaid: false })),
          markModuleComplete: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: 'STUDENT_NOT_PAID',
      status: 409,
    })
  })

  it('is idempotent when prerequisite progress is already complete', async () => {
    const markModuleComplete = vi.fn()
    const audit = vi.fn()

    const result = await unlockStudentWeek(
      {
        actorUserId: 'admin-1',
        studentId: 'student-1',
        weekNumber: 3,
      },
      {
        audit,
        getModuleByWeekNumber: vi.fn(async () => ({ id: 'module-2', weekNumber: 2 })),
        getModuleProgress: vi.fn(async () => ({ isCompleted: true })),
        getStudentById: vi.fn(async () => ({ id: 'student-1', isPaid: true })),
        markModuleComplete,
      }
    )

    expect(result.alreadyUnlocked).toBe(true)
    expect(markModuleComplete).not.toHaveBeenCalled()
    expect(audit).not.toHaveBeenCalled()
  })

  it('marks prerequisite module complete and writes an audit record', async () => {
    const markModuleComplete = vi.fn(async () => {})
    const audit = vi.fn(async () => {})

    const result = await unlockStudentWeek(
      {
        actorUserId: 'admin-1',
        studentId: 'student-1',
        weekNumber: 5,
      },
      {
        audit,
        getModuleByWeekNumber: vi.fn(async () => ({ id: 'module-4', weekNumber: 4 })),
        getModuleProgress: vi.fn(async () => null),
        getStudentById: vi.fn(async () => ({ id: 'student-1', isPaid: true })),
        markModuleComplete,
        now: () => '2026-04-12T09:00:00.000Z',
      }
    )

    expect(markModuleComplete).toHaveBeenCalledWith({
      completedAt: '2026-04-12T09:00:00.000Z',
      moduleId: 'module-4',
      studentId: 'student-1',
    })
    expect(audit).toHaveBeenCalledWith({
      actionType: 'STUDENT_WEEK_UNLOCKED',
      actorUserId: 'admin-1',
      metadata: {
        completedAt: '2026-04-12T09:00:00.000Z',
        previousModuleId: 'module-4',
        previousWeekNumber: 4,
        weekNumber: 5,
      },
      resourceId: 'student-1:module-4',
      resourceType: 'module_progress',
      targetUserId: 'student-1',
    })
    expect(result.alreadyUnlocked).toBe(false)
    expect(result.previousWeekNumber).toBe(4)
  })
})
