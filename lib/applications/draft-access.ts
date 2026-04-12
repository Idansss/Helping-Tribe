import crypto from 'crypto'

export function createApplicationDraftToken() {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashApplicationDraftToken(token: string) {
  return crypto.createHash('sha256').update(token.trim()).digest('hex')
}
