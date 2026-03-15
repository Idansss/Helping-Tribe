import { Resend } from 'resend'

const resendApiKey = (process.env.RESEND_API_KEY ?? '').trim()
// Resend: use verified domain from env, or their test sender when only API key is set
const fromAddress = (process.env.EMAIL_FROM ?? '').trim() || 'Helping Tribe <onboarding@resend.dev>'

/**
 * Send a plain-text email to one recipient.
 * Uses Resend when RESEND_API_KEY is set; otherwise no-ops and returns { ok: false }.
 */
export async function sendEmail(options: {
  to: string
  subject: string
  body: string
}): Promise<{ ok: boolean; error?: string }> {
  const { to, subject, body } = options
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
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: toTrimmed,
      subject,
      html: html || '<p>No content.</p>',
    })
    if (error) {
      console.error('[email] Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[email] Send failed:', message)
    return { ok: false, error: message }
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
