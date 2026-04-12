import { describe, expect, it } from 'vitest'
import { getPublicSiteBaseUrl } from '../lib/server/public-site-url'

function makeRequest(input: {
  origin: string
  forwardedHost?: string
  forwardedProto?: string
}) {
  return {
    headers: {
      get(name: string) {
        if (name === 'x-forwarded-host') return input.forwardedHost ?? null
        if (name === 'x-forwarded-proto') return input.forwardedProto ?? null
        return null
      },
    },
    nextUrl: {
      origin: input.origin,
    },
  } as any
}

describe('getPublicSiteBaseUrl', () => {
  it('prefers BASE_URL when configured', () => {
    const originalBaseUrl = process.env.BASE_URL
    const originalVercelUrl = process.env.VERCEL_URL

    try {
      process.env.BASE_URL = 'https://helpingtribeacademy.com'
      process.env.VERCEL_URL = 'helping-tribe.vercel.app'

      expect(
        getPublicSiteBaseUrl(
          makeRequest({
            origin: 'https://helping-tribe.vercel.app',
            forwardedHost: 'helpingtribeacademy.com',
            forwardedProto: 'https',
          })
        )
      ).toBe('https://helpingtribeacademy.com')
    } finally {
      process.env.BASE_URL = originalBaseUrl
      process.env.VERCEL_URL = originalVercelUrl
    }
  })

  it('prefers forwarded custom domain ahead of VERCEL_URL fallback', () => {
    const originalBaseUrl = process.env.BASE_URL
    const originalVercelUrl = process.env.VERCEL_URL

    try {
      delete process.env.BASE_URL
      process.env.VERCEL_URL = 'helping-tribe.vercel.app'

      expect(
        getPublicSiteBaseUrl(
          makeRequest({
            origin: 'https://helping-tribe.vercel.app',
            forwardedHost: 'helpingtribeacademy.com',
            forwardedProto: 'https',
          })
        )
      ).toBe('https://helpingtribeacademy.com')
    } finally {
      process.env.BASE_URL = originalBaseUrl
      process.env.VERCEL_URL = originalVercelUrl
    }
  })

  it('uses the request origin when it is already the custom domain', () => {
    const originalBaseUrl = process.env.BASE_URL
    const originalVercelUrl = process.env.VERCEL_URL

    try {
      delete process.env.BASE_URL
      process.env.VERCEL_URL = 'helping-tribe.vercel.app'

      expect(
        getPublicSiteBaseUrl(
          makeRequest({
            origin: 'https://helpingtribeacademy.com',
          })
        )
      ).toBe('https://helpingtribeacademy.com')
    } finally {
      process.env.BASE_URL = originalBaseUrl
      process.env.VERCEL_URL = originalVercelUrl
    }
  })

  it('falls back to VERCEL_URL only when the request origin is localhost', () => {
    const originalBaseUrl = process.env.BASE_URL
    const originalVercelUrl = process.env.VERCEL_URL

    try {
      delete process.env.BASE_URL
      process.env.VERCEL_URL = 'helping-tribe.vercel.app'

      expect(
        getPublicSiteBaseUrl(
          makeRequest({
            origin: 'http://localhost:3000',
          })
        )
      ).toBe('https://helping-tribe.vercel.app')
    } finally {
      process.env.BASE_URL = originalBaseUrl
      process.env.VERCEL_URL = originalVercelUrl
    }
  })
})
