import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApplicationSchema, APPLICATION_HONEYPOT_FIELD } from '@/lib/applications/schema'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers)
    const limit = await checkRateLimit({
      key: `apply-submit-legacy:${ip}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before submitting again.' },
        { status: 429 }
      )
    }

    const raw = await request.json()
    const candidateData = raw?.data && typeof raw.data === 'object' ? raw.data : raw
    const data = ApplicationSchema.parse(candidateData)
    const honeypot = String(data[APPLICATION_HONEYPOT_FIELD] ?? '').trim()

    if (honeypot.length > 0) {
      return NextResponse.json({ ok: true, applicationId: 'hidden' })
    }

    const admin = createAdminClient()
    const { data: inserted, error } = await admin
      .from('applicants')
      .insert({
        full_name_certificate: data.fullNameCertificate,
        gender: data.gender,
        dob: data.dob,
        phone_whatsapp: data.phoneWhatsApp,
        email: data.email,
        city_state: data.cityState,
        nationality: data.nationality,
        form_data: data,
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (error || !inserted?.id) {
      return NextResponse.json(
        { error: error?.message || 'Failed to submit application' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      applicationId: inserted.id,
      next: `/apply/success?id=${encodeURIComponent(inserted.id)}`,
    })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid application payload' }, { status: 400 })
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to submit application' },
      { status: 500 }
    )
  }
}
