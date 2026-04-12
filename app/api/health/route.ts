import { apiSuccess, getRequestId } from '@/lib/api/route'

export async function GET(request: Request) {
  const requestId = getRequestId(request)

  return apiSuccess(
    request,
    {
      service: 'helping-tribe-web',
      status: 'ok',
    },
    {
      meta: { check: 'liveness' },
      requestId,
    }
  )
}
