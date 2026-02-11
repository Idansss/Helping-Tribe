import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient } from '@/lib/supabase/route'

const StaffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
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
      .maybeSingle()

    const role = String((profile as any)?.role ?? '').toLowerCase()
    const isStaff = role === 'admin' || role === 'faculty' || role === 'mentor'
    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
