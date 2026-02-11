import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdmin } from '@/lib/auth/admin'
import { isMissingColumnError, missingPaymentsSchemaMessage } from '@/lib/supabase/migrations'

const RepairSchema = z.object({
  applicantId: z.string().uuid(),
})

type ApplicantRow = {
  id: string
  status: string
  email: string | null
  full_name_certificate: string | null
  phone_whatsapp: string | null
}

function normalize(value: string | null | undefined) {
  return String(value ?? '').trim()
}

async function loadStudentByApplicantId(admin: ReturnType<typeof createAdminClient>, applicantId: string) {
  const { data, error } = await admin
    .from('students')
    .select('id, applicant_id, matric_number, is_paid, paid_at')
    .eq('applicant_id', applicantId)
    .maybeSingle()

  if (error) {
    if (isMissingColumnError(error, 'is_paid') || isMissingColumnError(error, 'paid_at')) {
      throw new Error(missingPaymentsSchemaMessage())
    }
    throw new Error(error.message || 'Failed to load student record')
  }
  return data
}

async function repairStudentLink(admin: ReturnType<typeof createAdminClient>, applicant: ApplicantRow) {
  if (applicant.status !== 'APPROVED') {
    throw new Error('Repair is only available for approved applicants')
  }

  const email = normalize(applicant.email)
  const phone = normalize(applicant.phone_whatsapp)
  const fullName = normalize(applicant.full_name_certificate)

  let profiles: any[] = []

  if (email) {
    const { data } = await admin
      .from('profiles')
      .select('id, role, matric_number, email, full_name, whatsapp_number')
      .ilike('email', email)
    profiles = data ?? []
  }

  if (profiles.length === 0 && phone) {
    const { data } = await admin
      .from('profiles')
      .select('id, role, matric_number, email, full_name, whatsapp_number')
      .eq('whatsapp_number', phone)
    profiles = data ?? []
  }

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

  if (studentLikeProfiles.length === 0) {
    throw new Error('No matching student profile found for this applicant (email/phone/name)')
  }

  if (studentLikeProfiles.length > 1) {
    throw new Error('Multiple possible student profiles match this applicant; repair aborted')
  }

  const candidate = studentLikeProfiles[0] as any
  const candidateId = String(candidate.id)

  const { data: existingStudent, error: sErr } = await admin
    .from('students')
    .select('id, applicant_id, matric_number')
    .eq('id', candidateId)
    .maybeSingle()

  if (sErr) throw new Error(sErr.message || 'Failed to check existing student mapping')

  if (existingStudent) {
    if (existingStudent.applicant_id && String(existingStudent.applicant_id) !== applicant.id) {
      throw new Error('This student account is already linked to a different applicant; repair aborted')
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

  let matric = normalize(candidate?.matric_number)
  if (!matric) {
    const userRes = await admin.auth.admin.getUserById(candidateId)
    matric = normalize((userRes.data.user as any)?.user_metadata?.matric_number)
  }

  if (!matric) {
    throw new Error('Could not determine matric number for the matching profile; repair aborted')
  }

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

  if (!isAllowedAdmin(profile?.role, user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = RepairSchema.parse(await request.json())

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

    if (aErr || !applicant) return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })

    const alreadyLinked = await loadStudentByApplicantId(admin, body.applicantId)
    if (!alreadyLinked) {
      await repairStudentLink(admin, applicant as any)
    }

    const student = await loadStudentByApplicantId(admin, body.applicantId)
    if (!student) return NextResponse.json({ error: 'Repair failed: student link still missing' }, { status: 500 })

    return NextResponse.json({
      ok: true,
      student: {
        id: student.id,
        matricNumber: student.matric_number,
        isPaid: Boolean((student as any).is_paid),
        paidAt: (student as any).paid_at ?? null,
      },
    })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to repair student link' }, { status: 500 })
  }
}
