'use client'

import { useCallback, useEffect, useState } from 'react'

export type RegistrationStatus = 'loading' | 'open' | 'closed' | 'not_yet' | 'error'

export type RegistrationState = {
  status: RegistrationStatus
  message: string
  opensAt: string | null
  closesAt: string | null
  retry: () => void
}

function formatRegistrationDate(iso: string) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function useRegistrationStatus(): RegistrationState {
  const [status, setStatus] = useState<RegistrationStatus>('loading')
  const [message, setMessage] = useState('')
  const [opensAt, setOpensAt] = useState<string | null>(null)
  const [closesAt, setClosesAt] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => {
    setStatus('loading')
    setMessage('')
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings/registration')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load registration status: ${res.status}`)
        }
        return res.json()
      })
      .then((data: { opensAt?: string | null; closesAt?: string | null }) => {
        if (cancelled) return

        const today = new Date().toISOString().slice(0, 10)
        const nextOpensAt = data.opensAt?.trim() || null
        const nextClosesAt = data.closesAt?.trim() || null
        setOpensAt(nextOpensAt)
        setClosesAt(nextClosesAt)

        if (nextOpensAt && today < nextOpensAt) {
          setStatus('not_yet')
          setMessage(`Applications open on ${formatRegistrationDate(nextOpensAt)}.`)
          return
        }

        if (nextClosesAt && today > nextClosesAt) {
          setStatus('closed')
          setMessage(
            `Applications closed on ${formatRegistrationDate(nextClosesAt)}. Approved learners can still sign in.`,
          )
          return
        }

        setStatus('open')
        setMessage(
          nextClosesAt
            ? `Applications are open until ${formatRegistrationDate(nextClosesAt)}.`
            : 'Applications are currently open.',
        )
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error')
          setMessage(
            'Registration status is temporarily unavailable. Please try again or contact support.',
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return { status, message, opensAt, closesAt, retry }
}
