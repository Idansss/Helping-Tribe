import crypto from 'crypto'

const PAYSTACK_API_BASE = 'https://api.paystack.co'

export type PaystackInitializeResult = {
  authorizationUrl: string
  accessCode: string
  reference: string
  raw: unknown
}

export type PaystackVerifyResult = {
  ok: boolean
  status: string | null
  reference: string
  amountKobo: number | null
  currency: string | null
  paidAt: string | null
  gatewayResponse: string | null
  raw: unknown
}

function getPaystackSecretKey() {
  const key = (process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || '').trim()
  if (!key) {
    const envLabel = process.env.VERCEL_ENV ? ` in ${process.env.VERCEL_ENV}` : ''
    throw new Error(`Missing PAYSTACK_SECRET_KEY (or PAYSTACK_SECRET)${envLabel}`)
  }
  return key
}

export function createPaystackReference(prefix = 'HTSC') {
  const rand = crypto.randomBytes(8).toString('hex')
  return `${prefix}-${Date.now()}-${rand}`
}

async function paystackFetch(path: string, init: RequestInit) {
  const key = getPaystackSecretKey()
  const res = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const text = await res.text()
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message = json?.message || `Paystack request failed (${res.status})`
    const err = new Error(message)
    ;(err as any).status = res.status
    ;(err as any).raw = json ?? text
    throw err
  }

  return json
}

export async function paystackInitializeTransaction(input: {
  email: string
  amountKobo: number
  currency: string
  reference: string
  callbackUrl?: string
  metadata?: Record<string, any>
}): Promise<PaystackInitializeResult> {
  const payload: any = {
    email: input.email,
    amount: input.amountKobo,
    currency: input.currency,
    reference: input.reference,
    metadata: input.metadata ?? {},
  }
  if (input.callbackUrl) payload.callback_url = input.callbackUrl

  const json = await paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const data = json?.data
  if (!data?.authorization_url || !data?.access_code || !data?.reference) {
    throw new Error('Paystack initialize returned an unexpected response')
  }

  return {
    authorizationUrl: String(data.authorization_url),
    accessCode: String(data.access_code),
    reference: String(data.reference),
    raw: json,
  }
}

export async function paystackVerifyTransaction(reference: string): Promise<PaystackVerifyResult> {
  const cleanRef = String(reference || '').trim()
  if (!cleanRef) {
    return {
      ok: false,
      status: null,
      reference: '',
      amountKobo: null,
      currency: null,
      paidAt: null,
      gatewayResponse: null,
      raw: null,
    }
  }

  const json = await paystackFetch(`/transaction/verify/${encodeURIComponent(cleanRef)}`, {
    method: 'GET',
  })

  const data = json?.data
  const status = data?.status ? String(data.status) : null
  const amountKobo = Number.isFinite(Number(data?.amount)) ? Number(data.amount) : null
  const currency = data?.currency ? String(data.currency) : null
  const paidAt = data?.paid_at ? String(data.paid_at) : null
  const gatewayResponse = data?.gateway_response ? String(data.gateway_response) : null

  return {
    ok: Boolean(json?.status) && Boolean(data?.reference),
    status,
    reference: data?.reference ? String(data.reference) : cleanRef,
    amountKobo,
    currency,
    paidAt,
    gatewayResponse,
    raw: json,
  }
}

export function verifyPaystackWebhookSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false
  const key = getPaystackSecretKey()
  const hash = crypto.createHmac('sha512', key).update(rawBody).digest('hex')
  if (hash.length !== signatureHeader.length) return false
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader))
}
