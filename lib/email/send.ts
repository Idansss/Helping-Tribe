import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resendApiKey = (process.env.RESEND_API_KEY ?? '').trim()
// Resend: use verified domain from env, or their test sender when only API key is set
const fromAddress = (process.env.EMAIL_FROM ?? '').trim() || 'Helping Tribe <onboarding@resend.dev>'

/**
 * Send a plain-text email to one recipient.
 * Uses Resend when RESEND_API_KEY is set; otherwise no-ops and returns { ok: false }.
 * Pass outboxId to update the email_outbox row with sent_at or send_error for retry tracking.
 */
export async function sendEmail(options: {
  to: string
  subject: string
  body: string
  outboxId?: string
}): Promise<{ ok: boolean; error?: string }> {
  const { to, subject, body, outboxId } = options
  const toTrimmed = (to ?? '').trim()
  if (!toTrimmed) {
    return { ok: false, error: 'Missing recipient email' }
  }

  if (!resendApiKey) {
    console.warn('[email] RESEND_API_KEY not set; skipping send:', { to: toTrimmed, subject })
    return { ok: false, error: 'Email not configured' }
  }

  try {
    const resend = new Resend(resendApiKey)
    const html = body
      .split('\n')
      .map((line) => `<p>${linkifyUrls(escapeHtml(line))}</p>`)
      .join('')
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: toTrimmed,
      subject,
      html: html || '<p>No content.</p>',
    })
    if (error) {
      console.error('[email] Resend error:', error)
      await updateOutbox(outboxId, { send_error: error.message })
      return { ok: false, error: error.message }
    }
    await updateOutbox(outboxId, { sent_at: new Date().toISOString() })
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[email] Send failed:', message)
    await updateOutbox(outboxId, { send_error: message })
    return { ok: false, error: message }
  }
}

async function updateOutbox(outboxId: string | undefined, fields: { sent_at?: string; send_error?: string }) {
  if (!outboxId) return
  try {
    const admin = createAdminClient()
    await admin.from('email_outbox').update(fields).eq('id', outboxId)
  } catch {
    // Non-critical: don't let outbox tracking failure break anything
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Turn URLs in escaped text into clickable <a> links. */
function linkifyUrls(escapedText: string): string {
  return escapedText.replace(/(https?:\/\/[^\s&<>"']+)/g, (url) => {
    const href = url.replace(/&/g, '&amp;')
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`
  })
}
