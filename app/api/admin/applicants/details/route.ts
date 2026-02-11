import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePortalRole } from '@/lib/auth/admin'

const DetailsSchema = z.object({
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
    .maybeSingle()

  const portalRole = resolvePortalRole((profile as any)?.role, user.email)
  const isStaff = portalRole === 'admin' || portalRole === 'mentor'
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = DetailsSchema.parse(await request.json())
    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' },
        { status: 500 }
      )
    }

    const { data: applicant, error: aErr } = await admin
      .from('applicants')
      .select('id, status, email')
      .eq('id', body.applicantId)
      .maybeSingle()

    if (aErr || !applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id, matric_number, is_paid, paid_at')
      .eq('applicant_id', body.applicantId)
      .maybeSingle()

    let latestPayment: any = null
    if (student?.id) {
      const { data: pay } = await admin
        .from('payments')
        .select('reference, status, amount_kobo, currency, created_at, paid_at, discount_applied, discount_percent')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      latestPayment = pay ?? null
    }

    return NextResponse.json({
      ok: true,
      applicantId: applicant.id,
      applicantStatus: applicant.status,
      applicantEmail: applicant.email,
      student: student
        ? {
            id: student.id,
            matricNumber: student.matric_number,
            isPaid: Boolean((student as any).is_paid),
            paidAt: (student as any).paid_at ?? null,
          }
        : null,
      latestPayment: latestPayment
        ? {
            reference: latestPayment.reference,
            status: latestPayment.status,
            amountKobo: latestPayment.amount_kobo,
            currency: latestPayment.currency,
            createdAt: latestPayment.created_at,
            paidAt: latestPayment.paid_at,
            discountApplied: latestPayment.discount_applied,
            discountPercent: latestPayment.discount_percent,
          }
        : null,
    })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to load applicant details' }, { status: 500 })
  }
}
