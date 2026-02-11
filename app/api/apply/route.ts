import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient } from '@/lib/supabase/route'

const ApplySchema = z.object({
  fullNameCertificate: z.string().min(2),
  gender: z.string().min(1),
  dob: z.string().min(4),
  phoneWhatsApp: z.string().min(5),
  email: z.string().email(),
  cityState: z.string().min(2),
  nationality: z.string().min(2),
}).passthrough()

export async function POST(request: NextRequest) {
  try {
    const body = ApplySchema.parse(await request.json())

    const { supabase } = createRouteClient(request)

    const { error } = await supabase.from('applicants').insert({
      full_name_certificate: body.fullNameCertificate,
      gender: body.gender,
      dob: body.dob,
      phone_whatsapp: body.phoneWhatsApp,
      email: body.email,
      city_state: body.cityState,
      nationality: body.nationality,
      form_data: body,
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid application payload' }, { status: 400 })
    }

    const message = typeof e?.message === 'string' && e.message.trim().length > 0 ? e.message : 'Failed to submit application'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
