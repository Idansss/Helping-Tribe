import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMissingColumnError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const supabase = createAdminClient()
  const tokenHash = hashToken(token)

  const { data, error } = await supabase
    .from('password_setup_tokens')
    .select('student_id, expires_at, used_at, students(matric_number, is_paid)')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error && isMissingColumnError(error, 'is_paid')) {
    return NextResponse.json({ valid: false, reason: 'PAYMENTS_NOT_CONFIGURED', error: missingPaymentsSchemaMessage() }, { status: 200 })
  }

  if (error || !data) {
    return NextResponse.json({ valid: false }, { status: 200 })
  }

  const isUsed = Boolean(data.used_at)
  const isExpired = new Date(data.expires_at).getTime() <= Date.now()

  if (isUsed || isExpired) {
    return NextResponse.json({ valid: false }, { status: 200 })
  }

  const matricNumber =
    (data as any)?.students?.matric_number ?? null

  const isPaid = Boolean((data as any)?.students?.is_paid)
  if (!isPaid) {
    return NextResponse.json({ valid: false, reason: 'PAYMENT_REQUIRED' }, { status: 200 })
  }

  return NextResponse.json({
    valid: true,
    matricNumber,
    expiresAt: data.expires_at,
  })
}
