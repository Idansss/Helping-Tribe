import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApplicationSchema, APPLICATION_HONEYPOT_FIELD } from '@/lib/applications/schema'
import { hashApplicationDraftToken } from '@/lib/applications/draft-access'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'
import { getRegistrationWindow, isRegistrationOpen } from '@/lib/settings/registration'

const SubmitSchema = z.object({
  draftId: z.string().uuid().optional(),
  draftToken: z.string().min(16).optional(),
  data: ApplicationSchema,
})

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers)
    const limit = await checkRateLimit({
      key: `apply-submit:${ip}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before submitting again.' },
        { status: 429 }
      )
    }

    const payload = SubmitSchema.parse(await request.json())
    const honeypot = String(payload.data[APPLICATION_HONEYPOT_FIELD] ?? '').trim()

    // Silently succeed for bots while discarding payload.
    if (honeypot.length > 0) {
      return NextResponse.json({ ok: true, applicationId: 'hidden' })
    }

    const admin = createAdminClient()
    const window = await getRegistrationWindow(admin)
    const { allowed, message } = isRegistrationOpen(window)
    if (!allowed) {
      return NextResponse.json({ error: message ?? 'Registration is closed.' }, { status: 403 })
    }

    const { data: inserted, error } = await admin
      .from('applicants')
      .insert({
        full_name_certificate: payload.data.fullNameCertificate,
        gender: payload.data.gender,
        dob: payload.data.dob,
        phone_whatsapp: payload.data.phoneWhatsApp,
        email: payload.data.email,
        city_state: payload.data.cityState,
        nationality: payload.data.nationality,
        form_data: payload.data,
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

    if (payload.draftId && payload.draftToken) {
      const tokenHash = hashApplicationDraftToken(payload.draftToken)
      await admin
        .from('application_drafts')
        .update({
          status: 'SUBMITTED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.draftId)
        .eq('access_token_hash', tokenHash)
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
