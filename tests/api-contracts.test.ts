import { describe, expect, it } from 'vitest'
import { getApiData, getApiErrorCode, getApiErrorMessage } from '../lib/api/contracts'

describe('api contracts helpers', () => {
  it('reads standardized success payloads', () => {
    const payload = {
      success: true,
      data: { weekNumber: 3 },
      error: null,
      meta: { requestId: 'req-1', timestamp: '2026-04-12T09:00:00.000Z', version: 'v1' },
    }

    expect(getApiData<{ weekNumber: number }>(payload)).toEqual({ weekNumber: 3 })
  })

  it('reads legacy string errors', () => {
    expect(getApiErrorMessage({ error: 'Unauthorized' })).toBe('Unauthorized')
    expect(getApiErrorCode({ code: 'UNAUTHORIZED' })).toBe('UNAUTHORIZED')
  })

  it('reads standardized error payloads', () => {
    const payload = {
      success: false,
      data: null,
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'Request payload validation failed.',
      },
      meta: { requestId: 'req-1', timestamp: '2026-04-12T09:00:00.000Z', version: 'v1' },
    }

    expect(getApiErrorMessage(payload)).toBe('Request payload validation failed.')
    expect(getApiErrorCode(payload)).toBe('INVALID_PAYLOAD')
  })
})
