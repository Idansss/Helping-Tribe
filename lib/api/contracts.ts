export type ApiMeta = {
  requestId: string
  timestamp: string
  version: 'v1'
  [key: string]: unknown
}

export type ApiErrorBody = {
  code: string
  message: string
  details?: unknown
}

export type ApiSuccess<T> = {
  success: true
  data: T
  error: null
  meta: ApiMeta
}

export type ApiFailure = {
  success: false
  data: null
  error: ApiErrorBody
  meta: ApiMeta
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getApiData<T>(payload: unknown): T | null {
  if (!isRecord(payload)) return null
  return ('data' in payload ? payload.data : null) as T | null
}

export function getApiErrorMessage(payload: unknown, fallback = 'Request failed') {
  if (!isRecord(payload)) return fallback

  const error = payload.error
  if (typeof error === 'string' && error.trim()) return error
  if (isRecord(error) && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  return fallback
}

export function getApiErrorCode(payload: unknown) {
  if (!isRecord(payload)) return null

  if (typeof payload.code === 'string' && payload.code.trim()) {
    return payload.code
  }

  const error = payload.error
  if (isRecord(error) && typeof error.code === 'string' && error.code.trim()) {
    return error.code
  }

  return null
}
