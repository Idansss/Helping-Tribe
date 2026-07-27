'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

const NEAR_BOTTOM_PX = 96

type UseConversationScrollOptions = {
  messageCount: number
  reducedMotion?: boolean
  threadKey?: string | null
}

export function useConversationScroll({
  messageCount,
  reducedMotion = false,
  threadKey,
}: UseConversationScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const [showJump, setShowJump] = useState(false)
  const previousThreadKey = useRef<string | null | undefined>(undefined)

  const updateStickiness = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    const nearBottom = distance < NEAR_BOTTOM_PX
    stickToBottomRef.current = nearBottom
    setShowJump(!nearBottom && messageCount > 0)
  }, [messageCount])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateStickiness, { passive: true })
    updateStickiness()
    return () => el.removeEventListener('scroll', updateStickiness)
  }, [updateStickiness])

  useEffect(() => {
    const switchedThread = previousThreadKey.current !== threadKey
    previousThreadKey.current = threadKey

    if (switchedThread) {
      stickToBottomRef.current = true
      setShowJump(false)
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: 'auto' })
      })
      return
    }

    if (!stickToBottomRef.current) return
    endRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [messageCount, reducedMotion, threadKey])

  const jumpToLatest = useCallback(() => {
    stickToBottomRef.current = true
    setShowJump(false)
    endRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [reducedMotion])

  return {
    scrollRef: scrollRef as RefObject<HTMLDivElement | null>,
    endRef: endRef as RefObject<HTMLDivElement | null>,
    showJump,
    jumpToLatest,
  }
}
