import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'
import { createApplicationDraftToken, hashApplicationDraftToken } from '@/lib/applications/draft-access'
import { buildDraftResumePath } from '@/lib/applications/draft-resume'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'
import { sendEmail } from '@/lib/email/send'
import { absolutePublicUrl } from '@/lib/server/public-site-url'

const ResumeSchema = z.object({
  email: z.string().email(),
})

const GENERIC_RESUME_MESSAGE =
  'If we found a saved application or status for that email, we sent the next steps to the address you entered.'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers)
    const limit = await checkRateLimit({
      key: `apply-resume:${ip}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again shortly.' },
        { status: 429 }
      )
    }

    const payload = ResumeSchema.parse(await request.json())
    const email = payload.email.trim().toLowerCase()
    const admin = createAdminClient()

    const { data: latestDraft } = await admin
      .from('application_drafts')
      .select('id, status, updated_at')
      .eq('email', email)
      .eq('status', 'DRAFT')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: latestApplication } = await admin
      .from('applicants')
      .select('id, status, created_at')
      .eq('email', email)
      .in('status', ['PENDING', 'APPROVED', 'REJECTED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestDraft?.id) {
      const draftToken = createApplicationDraftToken()
      const accessTokenHash = hashApplicationDraftToken(draftToken)
      const resumePath = buildDraftResumePath(latestDraft.id, draftToken)
      const resumeUrl = absolutePublicUrl(request, resumePath)
      const subject = `${PROGRAM_FULL_NAME}: resume your application`
      const body = [
        'You asked to continue your saved application.',
        `Use this secure resume link: ${resumeUrl}`,
        'If you did not request this, you can ignore this email.',
      ].join('\n')

      await admin
        .from('application_drafts')
        .update({
          access_token_hash: accessTokenHash,
          resume_requested_at: new Date().toISOString(),
        })
        .eq('id', latestDraft.id)

      const { data: outboxRow } = await admin
        .from('email_outbox')
        .insert({
          recipient_email: email,
          kind: 'APPLICATION_DRAFT_RESUME',
          subject,
          body,
        })
        .select('id')
        .maybeSingle()

      const sendResult = await sendEmail({ to: email, subject, body, outboxId: outboxRow?.id })
      if (!sendResult.ok) {
        console.warn('[apply-resume] Resume email not sent:', sendResult.error)
      }
    } else if (latestApplication?.id) {
      const subject = `${PROGRAM_FULL_NAME}: application status update`
      const body = [
        `Your latest application status is ${latestApplication.status}.`,
        'If you need help with the next step, please contact support.',
      ].join('\n')

      const { data: outboxRow } = await admin
        .from('email_outbox')
        .insert({
          recipient_email: email,
          applicant_id: latestApplication.id,
          kind: 'APPLICATION_STATUS_UPDATE',
          subject,
          body,
        })
        .select('id')
        .maybeSingle()

      const sendResult = await sendEmail({ to: email, subject, body, outboxId: outboxRow?.id })
      if (!sendResult.ok) {
        console.warn('[apply-resume] Status email not sent:', sendResult.error)
      }
    }

    return NextResponse.json({ ok: true, message: GENERIC_RESUME_MESSAGE })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    return NextResponse.json({ error: error?.message || 'Unable to resume application' }, { status: 500 })
  }
}
