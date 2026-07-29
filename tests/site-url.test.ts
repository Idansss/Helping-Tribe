import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SITE_URL, getSiteUrl } from '../lib/site-url'

const KEYS = ['BASE_URL', 'NEXT_PUBLIC_SITE_URL', 'VERCEL_URL', 'NODE_ENV'] as const

// NODE_ENV is typed read-only, so go through a widened view of process.env.
const env = process.env as Record<string, string | undefined>

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete env[key]
  else env[key] = value
}

describe('getSiteUrl', () => {
  let saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    saved = {}
    for (const key of KEYS) {
      saved[key] = env[key]
      setEnv(key, undefined)
    }
  })

  afterEach(() => {
    for (const key of KEYS) setEnv(key, saved[key])
  })

  it('prefers BASE_URL', () => {
    setEnv('BASE_URL', 'https://helpingtribeacademy.com')
    setEnv('NEXT_PUBLIC_SITE_URL', 'https://ignored.example')
    expect(getSiteUrl()).toBe('https://helpingtribeacademy.com')
  })

  it('falls back to NEXT_PUBLIC_SITE_URL', () => {
    setEnv('NEXT_PUBLIC_SITE_URL', 'https://helpingtribeacademy.com/')
    expect(getSiteUrl()).toBe('https://helpingtribeacademy.com')
  })

  it('adds a scheme to a bare VERCEL_URL host', () => {
    setEnv('VERCEL_URL', 'helping-tribe.vercel.app')
    expect(getSiteUrl()).toBe('https://helping-tribe.vercel.app')
  })

  // The production bug this guards: an unconfigured deployment used to emit
  // http://localhost:3000 as the canonical URL of the live homepage.
  it('never falls back to localhost outside development', () => {
    setEnv('NODE_ENV', 'production')
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL)
    expect(getSiteUrl()).not.toContain('localhost')
  })

  it('still uses localhost in development', () => {
    setEnv('NODE_ENV', 'development')
    expect(getSiteUrl()).toBe('http://localhost:3000')
  })
})
