import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const SetPasswordSchema = z.object({
  token: z.string().min(10),
  matricNumber: z.string().min(4).optional(),
  newPassword: z.string().min(8),
})

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = SetPasswordSchema.parse(await request.json())
    const supabase = createAdminClient()

    const tokenHash = hashToken(body.token.trim())

    const { data, error } = await supabase
      .from('password_setup_tokens')
      .select('id, student_id, expires_at, used_at, students(matric_number, is_paid)')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (data.used_at) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 })
    }

    if (new Date(data.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const matricNumber =
      (data as any)?.students?.matric_number ?? null

    const isPaid = Boolean((data as any)?.students?.is_paid)
    if (!isPaid) {
      return NextResponse.json({ error: 'Payment required before setting password' }, { status: 403 })
    }

    if (body.matricNumber && matricNumber && body.matricNumber.trim().toUpperCase() !== String(matricNumber).toUpperCase()) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const updateRes = await supabase.auth.admin.updateUserById(data.student_id, {
      password: body.newPassword,
    })

    if (updateRes.error) {
      return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
    }

    await supabase
      .from('password_setup_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', data.id)

    await supabase
      .from('students')
      .update({ must_set_password: false, updated_at: new Date().toISOString() })
      .eq('id', data.student_id)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
  }
}
