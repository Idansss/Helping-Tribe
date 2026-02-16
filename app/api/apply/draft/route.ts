import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'
import { APPLICATION_HONEYPOT_FIELD } from '@/lib/applications/schema'

const DraftSaveSchema = z.object({
  draftId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  lastStep: z.number().int().min(1).max(8).optional(),
  // Drafts are in-progress snapshots, so keep this permissive.
  data: z.record(z.string(), z.unknown()),
})

const DraftQuerySchema = z.object({
  id: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const query = DraftQuerySchema.parse({
      id: request.nextUrl.searchParams.get('id'),
    })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('application_drafts')
      .select('id, status, email, form_data, last_step, created_at, updated_at')
      .eq('id', query.id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      draft: {
        id: data.id,
        status: data.status,
        email: data.email,
        data: data.form_data ?? {},
        lastStep: data.last_step ?? 1,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid draft id' }, { status: 400 })
    }
    return NextResponse.json({ error: error?.message || 'Failed to load draft' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers)
    const limit = checkRateLimit({
      key: `apply-draft:${ip}`,
      limit: 120,
      windowMs: 15 * 60 * 1000,
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many draft saves. Please wait and try again.' },
        { status: 429 }
      )
    }

    const payload = DraftSaveSchema.parse(await request.json())
    const dataRecord = (payload.data ?? {}) as Record<string, unknown>
    const honeypot = String(dataRecord[APPLICATION_HONEYPOT_FIELD] ?? '').trim()

    // Honeypot hit: return successful no-op.
    if (honeypot.length > 0) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const admin = createAdminClient()
    const now = new Date().toISOString()
    const dataEmail = typeof dataRecord.email === 'string' ? dataRecord.email.trim().toLowerCase() : ''
    const sanitizedEmail = payload.email?.trim().toLowerCase() || dataEmail || null

    if (payload.draftId) {
      const { data: updated, error } = await admin
        .from('application_drafts')
        .update({
          email: sanitizedEmail,
          form_data: dataRecord,
          last_step: payload.lastStep ?? 1,
          updated_at: now,
          status: 'DRAFT',
        })
        .eq('id', payload.draftId)
        .select('id, updated_at')
        .maybeSingle()

      if (!error && updated?.id) {
        return NextResponse.json({
          ok: true,
          draftId: updated.id,
          lastSavedAt: updated.updated_at,
        })
      }
    }

    const { data: inserted, error: insertError } = await admin
      .from('application_drafts')
      .insert({
        email: sanitizedEmail,
        form_data: dataRecord,
        last_step: payload.lastStep ?? 1,
        updated_at: now,
        status: 'DRAFT',
      })
      .select('id, updated_at')
      .single()

    if (insertError || !inserted?.id) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to save draft' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      draftId: inserted.id,
      lastSavedAt: inserted.updated_at,
    })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid draft payload' }, { status: 400 })
    }
    return NextResponse.json({ error: error?.message || 'Failed to save draft' }, { status: 500 })
  }
}
