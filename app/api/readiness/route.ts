import { apiError, apiSuccess, getRequestId } from '@/lib/api/route'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, serializeError } from '@/lib/server/logger'

export async function GET(request: Request) {
  const requestId = getRequestId(request)

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').select('id', { count: 'exact', head: true }).limit(1)

    if (error) {
      throw new Error(error.message || 'Failed to query Supabase.')
    }

    return apiSuccess(
      request,
      {
        dependencies: {
          supabase: 'up',
        },
        service: 'helping-tribe-web',
        status: 'ready',
      },
      {
        meta: { check: 'readiness' },
        requestId,
      }
    )
  } catch (error) {
    logError('Readiness check failed', {
      error: serializeError(error),
      requestId,
      route: '/api/readiness',
    })

    return apiError(
      request,
      503,
      'SERVICE_UNAVAILABLE',
      'Readiness check failed.',
      undefined,
      {
        meta: { check: 'readiness' },
        requestId,
      }
    )
  }
}
