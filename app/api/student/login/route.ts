import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient } from '@/lib/supabase/route'
import { matricToAuthEmail } from '@/lib/auth/constants'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

const StudentLoginSchema = z.object({
  matricNumber: z.string().min(4),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection: 10 attempts per IP per 15 minutes
    const ip = getRequestIp(request.headers)
    const limit = checkRateLimit({
      key: `student-login:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
        { status: 429 }
      )
    }

    const body = StudentLoginSchema.parse(await request.json())
    const { supabase, cookiesToSet } = createRouteClient(request)

    const email = matricToAuthEmail(body.matricNumber)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: body.password,
    })

    if (error) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 500 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = String((profile as any)?.role ?? '').toLowerCase()
    if (role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('is_paid, must_set_password')
      .eq('id', user.id)
      .maybeSingle()

    // If the payments migration hasn't been applied yet, Supabase may return null here (or an error).
    // Avoid a misleading "payment required" and return a clear configuration message instead.
    if (studentErr) {
      const msg = String(studentErr.message || '')
      if (msg.toLowerCase().includes('is_paid') || msg.toLowerCase().includes('paid_at') || msg.toLowerCase().includes('payment_status')) {
        return NextResponse.json(
          { error: 'Student payment state is not configured yet. Run DB migration 032_payments_paystack.sql.', code: 'PAYMENTS_NOT_CONFIGURED' },
          { status: 500 }
        )
      }
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student payment state is not configured yet. Run DB migration 032_payments_paystack.sql.', code: 'PAYMENTS_NOT_CONFIGURED' },
        { status: 500 }
      )
    }

    if (student?.must_set_password) {
      return NextResponse.json({ error: 'Password setup required', code: 'PASSWORD_SETUP_REQUIRED' }, { status: 403 })
    }

    if (!student?.is_paid) {
      return NextResponse.json({ error: 'Payment required', code: 'PAYMENT_REQUIRED' }, { status: 403 })
    }

    const response = NextResponse.json({ ok: true })
    cookiesToSet.forEach((c) => response.cookies.set(c.name, c.value, c.options))
    return response
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
