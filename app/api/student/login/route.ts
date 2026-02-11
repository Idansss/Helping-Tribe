import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient } from '@/lib/supabase/route'
import { matricToAuthEmail } from '@/lib/auth/constants'

const StudentLoginSchema = z.object({
  matricNumber: z.string().min(4),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
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

    const { data: student } = await supabase
      .from('students')
      .select('is_paid, must_set_password')
      .eq('id', user.id)
      .maybeSingle()

    if (student?.must_set_password) {
      return NextResponse.json({ error: 'Password setup required' }, { status: 403 })
    }

    if (!student?.is_paid) {
      return NextResponse.json({ error: 'Payment required' }, { status: 403 })
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
