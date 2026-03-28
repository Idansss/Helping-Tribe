import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdmin } from '@/lib/auth/admin'
import { isMissingColumnError, isMissingRelationError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'

const MarkPaidSchema = z.object({
  applicantId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string | null } | null; error: unknown }

  // Only full admins can manually override payment status
  if (!isAllowedAdmin(profile?.role, user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = MarkPaidSchema.parse(await request.json())

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' },
        { status: 500 }
      )
    }

    // Load student by applicant_id
    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id, is_paid')
      .eq('applicant_id', body.applicantId)
      .maybeSingle()

    if (sErr || !student) {
      return NextResponse.json({ error: 'Student record not found for this applicant' }, { status: 404 })
    }

    if (student.is_paid) {
      return NextResponse.json({ ok: true, alreadyPaid: true })
    }

    const paidAt = new Date().toISOString()

    // Mark student as paid
    const { error: stuErr } = await admin
      .from('students')
      .update({ is_paid: true, paid_at: paidAt, updated_at: paidAt })
      .eq('id', student.id)

    if (stuErr) {
      if (isMissingColumnError(stuErr, 'is_paid') || isMissingColumnError(stuErr, 'paid_at')) {
        return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
      }
      throw new Error(stuErr.message)
    }

    // Also update the latest PENDING/FAILED payment to SUCCESS if one exists
    const { data: latestPayment, error: pErr } = await admin
      .from('payments')
      .select('id, status')
      .eq('student_id', student.id)
      .in('status', ['PENDING', 'FAILED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pErr && (isMissingRelationError(pErr, 'payments') || isMissingColumnError(pErr, 'status'))) {
      return NextResponse.json({ error: missingPaymentsSchemaMessage() }, { status: 500 })
    }

    if (latestPayment) {
      await admin
        .from('payments')
        .update({
          status: 'SUCCESS',
          paid_at: paidAt,
          raw_paystack_response: { manual_override: true, override_by: user.id, override_at: paidAt },
        })
        .eq('id', latestPayment.id)
    }

    return NextResponse.json({ ok: true, paidAt })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to mark payment as paid' }, { status: 500 })
  }
}
