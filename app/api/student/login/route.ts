import { NextRequest } from 'next/server'
import { z } from 'zod'
import { matricToAuthEmail } from '@/lib/auth/constants'
import { apiError, apiSuccess, apiValidationError, getRequestId } from '@/lib/api/route'
import { createRouteClient } from '@/lib/supabase/route'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'
import { logWarn } from '@/lib/server/logger'

const StudentLoginSchema = z.object({
  matricNumber: z.string().min(4),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)

  try {
    const ip = getRequestIp(request.headers)
    const limit = checkRateLimit({
      key: `student-login:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    })

    if (!limit.allowed) {
      logWarn('Student login rate limited.', {
        ip,
        requestId,
        route: '/api/student/login',
      })

      return apiError(
        request,
        429,
        'RATE_LIMITED',
        'Too many login attempts. Please wait 15 minutes and try again.',
        undefined,
        { requestId }
      )
    }

    const body = StudentLoginSchema.parse(await request.json())
    const { cookiesToSet, supabase } = createRouteClient(request)

    const email = matricToAuthEmail(body.matricNumber)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: body.password,
    })

    if (error) {
      logWarn('Student login rejected due to invalid credentials.', {
        ip,
        requestId,
        route: '/api/student/login',
      })

      return apiError(request, 401, 'INVALID_CREDENTIALS', 'Invalid credentials.', undefined, { requestId })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return apiError(request, 500, 'INTERNAL_ERROR', 'Login failed.', undefined, { requestId })
    }

    const { data: profile } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()) as { data: { role: string | null } | null; error: unknown }

    const role = String(profile?.role ?? '').toLowerCase()
    if (role !== 'student') {
      return apiError(request, 403, 'FORBIDDEN', 'Student access is required.', undefined, { requestId })
    }

    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('is_paid, must_set_password')
      .eq('id', user.id)
      .maybeSingle()

    if (studentErr) {
      const msg = String(studentErr.message || '').toLowerCase()
      if (msg.includes('is_paid') || msg.includes('paid_at') || msg.includes('payment_status')) {
        return apiError(
          request,
          500,
          'PAYMENTS_NOT_CONFIGURED',
          'Student payment state is not configured yet. Run DB migration 032_payments_paystack.sql.',
          undefined,
          { requestId }
        )
      }
    }

    if (!student) {
      return apiError(
        request,
        500,
        'PAYMENTS_NOT_CONFIGURED',
        'Student payment state is not configured yet. Run DB migration 032_payments_paystack.sql.',
        undefined,
        { requestId }
      )
    }

    if (student.must_set_password) {
      return apiError(request, 403, 'PASSWORD_SETUP_REQUIRED', 'Password setup required.', undefined, { requestId })
    }

    if (!student.is_paid) {
      return apiError(request, 403, 'PAYMENT_REQUIRED', 'Payment required.', undefined, { requestId })
    }

    const response = apiSuccess(
      request,
      {
        authenticated: true,
        portal: 'learner' as const,
      },
      {
        meta: { route: '/api/student/login' },
        requestId,
      }
    )

    cookiesToSet.forEach((cookieToSet) => {
      response.cookies.set(cookieToSet.name, cookieToSet.value, cookieToSet.options)
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiValidationError(request, error, { requestId })
    }

    return apiError(request, 500, 'INTERNAL_ERROR', 'Login failed.', undefined, { requestId })
  }
}
