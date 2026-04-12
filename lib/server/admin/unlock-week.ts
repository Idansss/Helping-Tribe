export class UnlockWeekError extends Error {
  code: string
  status: number
  details?: Record<string, unknown>

  constructor(input: {
    code: string
    message: string
    status: number
    details?: Record<string, unknown>
  }) {
    super(input.message)
    this.name = 'UnlockWeekError'
    this.code = input.code
    this.status = input.status
    this.details = input.details
  }
}

type UnlockStudentWeekInput = {
  actorUserId: string
  studentId: string
  weekNumber: number
}

type UnlockStudentWeekDeps = {
  audit?: (event: {
    actionType: string
    actorUserId: string
    metadata: Record<string, unknown>
    resourceId: string
    resourceType: string
    targetUserId: string
  }) => Promise<void>
  getModuleByWeekNumber: (weekNumber: number) => Promise<{ id: string; weekNumber: number } | null>
  getModuleProgress: (studentId: string, moduleId: string) => Promise<{ isCompleted: boolean } | null>
  getStudentById: (studentId: string) => Promise<{ id: string; isPaid: boolean } | null>
  markModuleComplete: (input: { completedAt: string; moduleId: string; studentId: string }) => Promise<void>
  now?: () => string
}

export async function unlockStudentWeek(
  input: UnlockStudentWeekInput,
  deps: UnlockStudentWeekDeps
) {
  const now = deps.now ?? (() => new Date().toISOString())

  if (input.weekNumber === 1) {
    return {
      alreadyUnlocked: true,
      note: 'Week 1 has no prerequisite.',
      previousModuleId: null,
      previousWeekNumber: null,
      weekNumber: 1,
    }
  }

  const student = await deps.getStudentById(input.studentId)
  if (!student) {
    throw new UnlockWeekError({
      code: 'STUDENT_NOT_FOUND',
      details: { studentId: input.studentId },
      message: 'Student record not found.',
      status: 404,
    })
  }

  if (!student.isPaid) {
    throw new UnlockWeekError({
      code: 'STUDENT_NOT_PAID',
      details: { studentId: input.studentId },
      message: 'Student payment must be verified before unlocking additional weeks.',
      status: 409,
    })
  }

  const previousWeekNumber = input.weekNumber - 1
  const previousModule = await deps.getModuleByWeekNumber(previousWeekNumber)
  if (!previousModule) {
    throw new UnlockWeekError({
      code: 'MODULE_NOT_FOUND',
      details: { previousWeekNumber },
      message: `No module found for Week ${previousWeekNumber}.`,
      status: 404,
    })
  }

  const existingProgress = await deps.getModuleProgress(student.id, previousModule.id)
  if (existingProgress?.isCompleted) {
    return {
      alreadyUnlocked: true,
      note: `Week ${input.weekNumber} is already unlocked.`,
      previousModuleId: previousModule.id,
      previousWeekNumber,
      weekNumber: input.weekNumber,
    }
  }

  const completedAt = now()
  await deps.markModuleComplete({
    completedAt,
    moduleId: previousModule.id,
    studentId: student.id,
  })

  await deps.audit?.({
    actionType: 'STUDENT_WEEK_UNLOCKED',
    actorUserId: input.actorUserId,
    metadata: {
      completedAt,
      previousModuleId: previousModule.id,
      previousWeekNumber,
      weekNumber: input.weekNumber,
    },
    resourceId: `${student.id}:${previousModule.id}`,
    resourceType: 'module_progress',
    targetUserId: student.id,
  })

  return {
    alreadyUnlocked: false,
    completedAt,
    note: `Week ${input.weekNumber} unlocked by marking Week ${previousWeekNumber} complete.`,
    previousModuleId: previousModule.id,
    previousWeekNumber,
    weekNumber: input.weekNumber,
  }
}
