import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMissingColumnError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

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
    const ip = getRequestIp(request.headers)
    const limit = checkRateLimit({ key: `set-password:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 })
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait 15 minutes and try again.' }, { status: 429 })
    }

    const body = SetPasswordSchema.parse(await request.json())
    const supabase = createAdminClient()

    const tokenHash = hashToken(body.token.trim())

    const { data, error } = await (supabase as any)
      .select('id, student_id, expires_at, used_at, students(matric_number, is_paid)')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (error && isMissingColumnError(error, 'is_paid')) {
      return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
    }

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (data.used_at) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 })
    }

    if (new Date(data.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const matricNumber = data.students?.matric_number ?? null

    const isPaid = Boolean(data.students?.is_paid)
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
