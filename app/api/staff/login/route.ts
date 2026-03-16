import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient } from '@/lib/supabase/route'
import { isAllowedAdmin, resolvePortalRole } from '@/lib/auth/admin'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

const StaffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  portal: z.enum(['admin', 'mentor']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection: 10 attempts per IP per 15 minutes
    const ip = getRequestIp(request.headers)
    const limit = checkRateLimit({
      key: `staff-login:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
        { status: 429 }
      )
    }

    const body = StaffLoginSchema.parse(await request.json())
    const { supabase, cookiesToSet } = createRouteClient(request)

    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
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
      .maybeSingle() as { data: { role: string | null } | null; error: unknown }

    const role = String(profile?.role ?? '').toLowerCase()
    const isStaff = role === 'admin' || role === 'faculty' || role === 'mentor'
    if (!isStaff) {
      return NextResponse.json({ error: 'This account does not have staff access.' }, { status: 403 })
    }

    const portalRole = resolvePortalRole(profile?.role ?? null, user.email)

    // Enforce portal-specific login: reject if the user's role doesn't match
    if (body.portal === 'admin' && portalRole !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'This is the Admin login. Facilitators should use the Facilitator login page.' }, { status: 403 })
    }
    if (body.portal === 'mentor' && portalRole !== 'mentor') {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'This is the Facilitator login. Admins should use the Admin login page.' }, { status: 403 })
    }

    const redirectTo =
      portalRole === 'admin'
        ? '/admin'
        : portalRole === 'mentor'
          ? '/mentor'
          : '/learner/dashboard'

    const response = NextResponse.json({ ok: true, redirectTo })
    cookiesToSet.forEach((c) => response.cookies.set(c.name, c.value, c.options))
    return response
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
