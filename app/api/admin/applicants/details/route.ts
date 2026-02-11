import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePortalRole } from '@/lib/auth/admin'

const DetailsSchema = z.object({
  applicantId: z.string().uuid(),
})

type ApplicantRow = {
  id: string
  status: string
  email: string | null
  full_name_certificate: string | null
  phone_whatsapp: string | null
}

async function loadStudentByApplicantId(admin: ReturnType<typeof createAdminClient>, applicantId: string) {
  const { data, error } = await admin
    .from('students')
    .select('id, applicant_id, matric_number, is_paid, paid_at')
    .eq('applicant_id', applicantId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Failed to load student record')
  }

  return data
}

function normalizeEmail(email: string | null | undefined) {
  return String(email ?? '').trim()
}

async function tryRepairStudentLink(admin: ReturnType<typeof createAdminClient>, applicant: ApplicantRow) {
  if (applicant.status !== 'APPROVED') return

  // First, try to locate an existing student profile by the applicant's contact details.
  // This is a repair path for cases where an APPROVED applicant exists but the students.applicant_id link is missing.
  const email = normalizeEmail(applicant.email)
  const phone = String(applicant.phone_whatsapp ?? '').trim()
  const fullName = String(applicant.full_name_certificate ?? '').trim()

  // 1) Email match (case-insensitive)
  let profiles: any[] = []
  if (email) {
    const { data } = await admin
      .from('profiles')
      .select('id, role, matric_number, email, full_name, whatsapp_number')
      .ilike('email', email)
    profiles = data ?? []
  }

  // 2) WhatsApp match (fallback)
  if (profiles.length === 0 && phone) {
    const { data } = await admin
      .from('profiles')
      .select('id, role, matric_number, email, full_name, whatsapp_number')
      .eq('whatsapp_number', phone)
    profiles = data ?? []
  }

  // 3) Name match (last resort, only if unique)
  if (profiles.length === 0 && fullName) {
    const { data } = await admin
      .from('profiles')
      .select('id, role, matric_number, email, full_name, whatsapp_number')
      .ilike('full_name', fullName)
    profiles = data ?? []
  }

  const studentLikeProfiles = (profiles ?? []).filter((p: any) => {
    const role = String(p?.role ?? '').toLowerCase()
    return role === 'student' || role === 'learner'
  })

  if (studentLikeProfiles.length !== 1) return

  const candidate = studentLikeProfiles[0] as any
  const candidateId = String(candidate.id)

  const { data: existingStudent, error: sErr } = await admin
    .from('students')
    .select('id, applicant_id, matric_number')
    .eq('id', candidateId)
    .maybeSingle()

  if (sErr) {
    throw new Error(sErr.message || 'Failed to check existing student mapping')
  }

  if (existingStudent) {
    if (existingStudent.applicant_id && String(existingStudent.applicant_id) !== applicant.id) {
      // Conflict: this auth user is already linked to a different applicant.
      return
    }
    if (!existingStudent.applicant_id) {
      const { error: upErr } = await admin
        .from('students')
        .update({ applicant_id: applicant.id, updated_at: new Date().toISOString() })
        .eq('id', candidateId)
      if (upErr) throw new Error(upErr.message || 'Failed to repair student link')
    }
    return
  }

  // No students row yet: attempt to create one from profile/user metadata.
  let matric = String(candidate?.matric_number ?? '').trim()
  if (!matric) {
    const userRes = await admin.auth.admin.getUserById(candidateId)
    matric = String((userRes.data.user as any)?.user_metadata?.matric_number ?? '').trim()
  }

  if (!matric) return

  const { error: insErr } = await admin.from('students').insert({
    id: candidateId,
    applicant_id: applicant.id,
    matric_number: matric,
    must_set_password: true,
  })
  if (insErr) throw new Error(insErr.message || 'Failed to create student mapping during repair')
}

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
        { error: 'Server auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY (Vercel env or local .env.local).' },
        { status: 500 }
      )
    }

    const { data: applicant, error: aErr } = await admin
      .from('applicants')
      .select('id, status, email, full_name_certificate, phone_whatsapp')
      .eq('id', body.applicantId)
      .maybeSingle()

    if (aErr || !applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    let student = await loadStudentByApplicantId(admin, body.applicantId)

    // Auto-repair is allowed only for the primary admin session.
    if (!student && portalRole === 'admin') {
      await tryRepairStudentLink(admin, applicant as any)
      student = await loadStudentByApplicantId(admin, body.applicantId)
    }

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
      needsRepair: applicant.status === 'APPROVED' && !student,
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
