import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isAllowedAdmin } from '@/lib/auth/admin'
import { apiError, apiSuccess, apiValidationError, getRequestId } from '@/lib/api/route'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isMissingRelationError } from '@/lib/supabase/migrations'
import { unlockStudentWeek, UnlockWeekError } from '@/lib/server/admin/unlock-week'
import { logError, logWarn, serializeError } from '@/lib/server/logger'

const UnlockWeekSchema = z.object({
  studentId: z.string().uuid(),
  weekNumber: z.number().int().min(1).max(9),
})

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError(request, 401, 'UNAUTHORIZED', 'Authentication is required.', undefined, { requestId })
  }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()) as { data: { role: string | null } | null; error: unknown }

  if (!isAllowedAdmin(profile?.role, user.email)) {
    return apiError(request, 403, 'FORBIDDEN', 'Admin access is required.', undefined, { requestId })
  }

  try {
    const body = UnlockWeekSchema.parse(await request.json())

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return apiError(
        request,
        500,
        'SERVER_AUTH_NOT_CONFIGURED',
        'Server auth is not configured.',
        undefined,
        { requestId }
      )
    }

    const result = await unlockStudentWeek(
      {
        actorUserId: user.id,
        studentId: body.studentId,
        weekNumber: body.weekNumber,
      },
      {
        audit: async (event) => {
          const { error } = await admin.from('admin_action_audit_logs').insert({
            action_type: event.actionType,
            actor_user_id: event.actorUserId,
            metadata: event.metadata,
            resource_id: event.resourceId,
            resource_type: event.resourceType,
            target_user_id: event.targetUserId,
          })

          if (!error) return
          if (isMissingRelationError(error, 'admin_action_audit_logs')) {
            logWarn('Audit log insert skipped because migration 043 is not applied.', {
              requestId,
              route: '/api/admin/students/unlock-week',
            })
            return
          }

          throw new Error(error.message || 'Failed to write audit log.')
        },
        getModuleByWeekNumber: async (weekNumber) => {
          const { data, error } = await admin
            .from('modules')
            .select('id, week_number')
            .eq('week_number', weekNumber)
            .maybeSingle()

          if (error) throw new Error(error.message || 'Failed to load module.')
          if (!data) return null

          return {
            id: data.id,
            weekNumber: data.week_number,
          }
        },
        getModuleProgress: async (studentId, moduleId) => {
          const { data, error } = await admin
            .from('module_progress')
            .select('is_completed')
            .eq('user_id', studentId)
            .eq('module_id', moduleId)
            .maybeSingle()

          if (error) throw new Error(error.message || 'Failed to load module progress.')
          if (!data) return null

          return {
            isCompleted: Boolean(data.is_completed),
          }
        },
        getStudentById: async (studentId) => {
          const { data, error } = await admin
            .from('students')
            .select('id, is_paid')
            .eq('id', studentId)
            .maybeSingle()

          if (error) throw new Error(error.message || 'Failed to load student.')
          if (!data) return null

          return {
            id: data.id,
            isPaid: Boolean(data.is_paid),
          }
        },
        markModuleComplete: async ({ completedAt, moduleId, studentId }) => {
          const { error } = await admin.from('module_progress').upsert(
            {
              completed_at: completedAt,
              is_completed: true,
              module_id: moduleId,
              updated_at: completedAt,
              user_id: studentId,
            },
            { onConflict: 'user_id,module_id' }
          )

          if (error) throw new Error(error.message || 'Failed to update module progress.')
        },
      }
    )

    return apiSuccess(request, result, {
      meta: { route: '/api/admin/students/unlock-week' },
      requestId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiValidationError(request, error, { requestId })
    }

    if (error instanceof UnlockWeekError) {
      return apiError(request, error.status, error.code, error.message, error.details, { requestId })
    }

    logError('Failed to unlock student week.', {
      error: serializeError(error),
      requestId,
      route: '/api/admin/students/unlock-week',
      userId: user.id,
    })

    return apiError(request, 500, 'INTERNAL_ERROR', 'Failed to unlock week.', undefined, { requestId })
  }
}
