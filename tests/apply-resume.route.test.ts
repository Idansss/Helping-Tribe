import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const createAdminClientMock = vi.fn()
const sendEmailMock = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: createAdminClientMock,
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: sendEmailMock,
}))

function makeRequest(email: string, ip: string) {
  return new NextRequest('https://helpingtribe.test/api/apply/resume', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-real-ip': ip,
    },
    body: JSON.stringify({ email }),
  })
}

function makeAdminClient(options: {
  latestDraft?: { id: string; status: string; updated_at: string } | null
  latestApplication?: { id: string; status: string; created_at: string } | null
}) {
  const operations = {
    draftUpdates: [] as Array<Record<string, unknown>>,
    outboxInserts: [] as Array<Record<string, unknown>>,
  }

  return {
    operations,
    rpc: vi.fn().mockResolvedValue({
      data: [{ allowed: true, remaining: 19, reset_at: new Date('2026-04-12T12:00:00.000Z').toISOString() }],
      error: null,
    }),
    from(table: string) {
      if (table === 'application_drafts') {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              maybeSingle: async () => ({ data: options.latestDraft ?? null, error: null }),
                            }
                          },
                        }
                      },
                    }
                  },
                }
              },
            }
          },
          update(values: Record<string, unknown>) {
            operations.draftUpdates.push(values)
            return {
              eq: async () => ({ data: null, error: null }),
            }
          },
        }
      }

      if (table === 'applicants') {
        return {
          select() {
            return {
              eq() {
                return {
                  in() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              maybeSingle: async () => ({ data: options.latestApplication ?? null, error: null }),
                            }
                          },
                        }
                      },
                    }
                  },
                }
              },
            }
          },
        }
      }

      if (table === 'email_outbox') {
        return {
          insert(values: Record<string, unknown>) {
            operations.outboxInserts.push(values)
            return {
              select() {
                return {
                  maybeSingle: async () => ({ data: { id: 'outbox-1' }, error: null }),
                }
              },
            }
          },
        }
      }

      throw new Error(`Unexpected table access: ${table}`)
    },
  }
}

describe('POST /api/apply/resume', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sendEmailMock.mockResolvedValue({ ok: true })
  })

  it('returns a generic response and emails a secure draft resume link when a draft exists', async () => {
    const admin = makeAdminClient({
      latestDraft: {
        id: 'draft-123',
        status: 'DRAFT',
        updated_at: '2026-04-10T08:00:00.000Z',
      },
    })
    createAdminClientMock.mockReturnValue(admin)

    const { POST } = await import('../app/api/apply/resume/route')
    const response = await POST(makeRequest('person@example.com', '10.0.0.1'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      ok: true,
      message: expect.stringContaining('If we found a saved application'),
    })
    expect(admin.operations.draftUpdates).toHaveLength(1)
    expect(admin.operations.draftUpdates[0]).toEqual(
      expect.objectContaining({
        access_token_hash: expect.any(String),
        resume_requested_at: expect.any(String),
      })
    )
    expect(admin.operations.outboxInserts[0]).toEqual(
      expect.objectContaining({
        recipient_email: 'person@example.com',
        kind: 'APPLICATION_DRAFT_RESUME',
      })
    )
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'person@example.com',
        subject: expect.stringContaining('resume your application'),
        body: expect.stringMatching(/https:\/\/helpingtribe\.test\/apply\?draft=draft-123&token=/),
      })
    )
  })

  it('returns the same generic response when no draft or application exists', async () => {
    const admin = makeAdminClient({})
    createAdminClientMock.mockReturnValue(admin)

    const { POST } = await import('../app/api/apply/resume/route')
    const response = await POST(makeRequest('missing@example.com', '10.0.0.2'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      ok: true,
      message: expect.stringContaining('If we found a saved application'),
    })
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(admin.operations.outboxInserts).toHaveLength(0)
  })
})
