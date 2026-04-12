import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import type { ApiFailure, ApiMeta, ApiSuccess } from './contracts'

type ResponseOptions = {
  headers?: HeadersInit
  meta?: Record<string, unknown>
  requestId?: string
  status?: number
}

function buildHeaders(requestId: string, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('cache-control', 'no-store')
  responseHeaders.set('x-request-id', requestId)
  return responseHeaders
}

function buildMeta(requestId: string, extraMeta?: Record<string, unknown>): ApiMeta {
  return {
    requestId,
    timestamp: new Date().toISOString(),
    version: 'v1',
    ...(extraMeta ?? {}),
  }
}

export function getRequestId(request: Request) {
  const existing = request.headers.get('x-request-id')?.trim()
  return existing || randomUUID()
}

export function apiSuccess<T>(
  request: Request,
  data: T,
  options: ResponseOptions = {}
) {
  const requestId = options.requestId ?? getRequestId(request)
  const body: ApiSuccess<T> = {
    success: true,
    data,
    error: null,
    meta: buildMeta(requestId, options.meta),
  }

  return NextResponse.json(body, {
    status: options.status ?? 200,
    headers: buildHeaders(requestId, options.headers),
  })
}

export function apiError(
  request: Request,
  status: number,
  code: string,
  message: string,
  details?: unknown,
  options: Omit<ResponseOptions, 'status'> = {}
) {
  const requestId = options.requestId ?? getRequestId(request)
  const body: ApiFailure = {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
    meta: buildMeta(requestId, options.meta),
  }

  return NextResponse.json(body, {
    status,
    headers: buildHeaders(requestId, options.headers),
  })
}

export function apiValidationError(
  request: Request,
  error: ZodError,
  options: Omit<ResponseOptions, 'status'> = {}
) {
  return apiError(
    request,
    400,
    'INVALID_PAYLOAD',
    'Request payload validation failed.',
    error.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      path: issue.path.join('.'),
    })),
    options
  )
}
