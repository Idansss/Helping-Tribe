'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useLowData } from '@/lib/contexts/LowDataContext'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { EmptySessionState } from './EmptySessionState'
import { GuidancePanel } from './GuidancePanel'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'
import { PersonaSelector } from './PersonaSelector'
import { PracticeToolbar } from './PracticeToolbar'
import {
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES,
  resolvePersona,
  type PersonaKey,
} from './personas'
import { ResetSessionDialog } from './ResetSessionDialog'
import {
  DEFAULT_REASONING_EFFORT,
  type PracticeMessage,
  type ReasoningEffort,
  type SendError,
  type SessionStatus,
} from './types'

export type PracticeStudioProps = {
  caseStudyId?: string
  clientName?: string
  systemPrompt?: string
}

function getErrorMessage(error: unknown) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error && error.message) return error.message
  const maybe = error as { message?: string; code?: string; details?: string; hint?: string }
  return [maybe.message, maybe.code, maybe.details, maybe.hint].filter(Boolean).join(' | ') || 'Unknown error'
}

function isMissingRelationError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()
  const code = String((error as { code?: string } | null)?.code || '')
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('could not find the table')
  )
}

function normalizeMessages(raw: unknown): PracticeMessage[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const message = item as { role?: string; content?: string; timestamp?: string | Date }
    return {
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content || ''),
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
    }
  })
}

function mapApiError(status: number, fallback?: string): SendError {
  if (status === 401) {
    return {
      kind: 'unauthorized',
      message: 'Your session has expired. Sign in again to continue.',
    }
  }
  if (status === 429) {
    return {
      kind: 'rate_limit',
      message: 'The practice service needs a short pause. Wait a moment, then try again.',
    }
  }
  if (status === 400) {
    return {
      kind: 'validation',
      message: fallback || 'That message could not be sent. Check the length and try again.',
    }
  }
  if (status >= 500) {
    return {
      kind: 'unavailable',
      message: 'The practice service is temporarily unavailable.',
    }
  }
  return {
    kind: 'unknown',
    message: 'The simulated client could not respond. Your message is still here. Try again.',
  }
}

export function PracticeStudio({ caseStudyId, clientName, systemPrompt }: PracticeStudioProps) {
  const initialKey = resolvePersona(clientName).key
  const [personaKey, setPersonaKey] = useState<PersonaKey>(initialKey)
  const [messages, setMessages] = useState<PracticeMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [persistSessions, setPersistSessions] = useState(true)
  const [sendError, setSendError] = useState<SendError | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [pendingPersona, setPendingPersona] = useState<PersonaKey | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [scenarioOpen, setScenarioOpen] = useState(false)
  const [personaPickerOpen, setPersonaPickerOpen] = useState(false)
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>(DEFAULT_REASONING_EFFORT)
  const [reasoningEnabled, setReasoningEnabled] = useState(false)
  const [isWide, setIsWide] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sendingLockRef = useRef(false)
  const { isLowData } = useLowData()

  const persona = resolvePersona(personaKey)
  const finalSystemPrompt = systemPrompt || persona.systemPrompt
  const reducedMotion = prefersReducedMotion || isLowData

  const sessionStatus: SessionStatus = useMemo(() => {
    if (sessionLoading) return 'loading'
    if (messages.length === 0) return 'not_started'
    if (messages.length >= 6) return 'ready_for_reflection'
    return 'in_progress'
  }, [messages.length, sessionLoading])

  const startLocalSession = useCallback(() => {
    setPersistSessions(false)
    setSessionId(crypto.randomUUID())
    setMessages([])
    setSessionLoading(false)
  }, [])

  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wideMq = window.matchMedia('(min-width: 768px)')
    const updateMotion = () => setPrefersReducedMotion(motionMq.matches)
    const updateWide = () => setIsWide(wideMq.matches)
    updateMotion()
    updateWide()
    motionMq.addEventListener('change', updateMotion)
    wideMq.addEventListener('change', updateWide)
    return () => {
      motionMq.removeEventListener('change', updateMotion)
      wideMq.removeEventListener('change', updateWide)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadCapabilities() {
      try {
        const response = await fetch('/api/ai-client', { method: 'GET' })
        if (!response.ok) return
        const data = (await response.json()) as { reasoningEnabled?: boolean }
        if (!cancelled) setReasoningEnabled(Boolean(data.reasoningEnabled))
      } catch {
        if (!cancelled) setReasoningEnabled(false)
      }
    }
    void loadCapabilities()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function loadOrCreateSession() {
      setSessionLoading(true)
      setSendError(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) startLocalSession()
          return
        }

        const { data: existing, error: existingError } = await supabase
          .from('ai_client_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('client_name', persona.name)
          .order('last_message_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existingError) {
          if (isMissingRelationError(existingError)) {
            if (!cancelled) startLocalSession()
            return
          }
          throw existingError
        }

        if (existing) {
          if (!cancelled) {
            setPersistSessions(true)
            setSessionId(existing.id)
            setMessages(normalizeMessages(existing.conversation_history))
            setSessionLoading(false)
          }
          return
        }

        const { data: newSession, error } = await supabase
          .from('ai_client_sessions')
          .insert({
            user_id: user.id,
            case_study_id: caseStudyId || null,
            client_name: persona.name,
            system_prompt: finalSystemPrompt,
            conversation_history: [],
          })
          .select()
          .single()

        if (error) {
          if (isMissingRelationError(error)) {
            if (!cancelled) startLocalSession()
            return
          }
          throw error
        }

        if (!cancelled) {
          setPersistSessions(true)
          setSessionId(newSession.id)
          setMessages([])
          setSessionLoading(false)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Practice chat using local session:', getErrorMessage(error))
          startLocalSession()
        }
      }
    }

    loadOrCreateSession()
    return () => {
      cancelled = true
    }
  }, [caseStudyId, persona.name, finalSystemPrompt, startLocalSession])

  const requestAssistantReply = useCallback(
    async (conversation: PracticeMessage[]) => {
      if (!sessionId || sendingLockRef.current) return
      if (conversation.length > MAX_MESSAGES) {
        setSendError({
          kind: 'validation',
          message: 'This practice session has reached its message limit. Reset to begin a new session.',
        })
        return
      }

      sendingLockRef.current = true
      setSendError(null)
      setIsLoading(true)

      try {
        const response = await fetch('/api/ai-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversation.map((m) => ({ role: m.role, content: m.content })),
            systemPrompt: finalSystemPrompt,
            ...(reasoningEnabled ? { reasoningEffort } : {}),
          }),
        })

        if (!response.ok) {
          let apiMessage: string | undefined
          try {
            const body = await response.json()
            apiMessage = typeof body?.error === 'string' ? body.error : undefined
          } catch {
            // ignore parse failures
          }
          const mapped = mapApiError(response.status, apiMessage)
          if (response.status === 429) {
            mapped.message =
              'Too many practice requests right now. Please wait before sending more messages.'
          }
          throw mapped
        }

        const data = await response.json()
        const assistantMessage: PracticeMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }

        const finalMessages = [...conversation, assistantMessage]

        if (persistSessions) {
          const supabase = createClient()
          const { error: saveError } = await supabase
            .from('ai_client_sessions')
            .update({
              conversation_history: finalMessages.map((m) => ({ role: m.role, content: m.content })),
              last_message_at: new Date().toISOString(),
            })
            .eq('id', sessionId)

          if (saveError && isMissingRelationError(saveError)) {
            setPersistSessions(false)
          }
        }

        setMessages(finalMessages)

        requestAnimationFrame(() => {
          document.getElementById('practice-composer')?.focus()
        })
      } catch (error) {
        const mapped =
          error && typeof error === 'object' && 'kind' in error
            ? (error as SendError)
            : {
                kind: 'network' as const,
                message:
                  'The simulated client could not respond. Your message is still here. Try again.',
              }
        setSendError(mapped)
        console.warn('Error sending message:', getErrorMessage(error))
      } finally {
        setIsLoading(false)
        sendingLockRef.current = false
      }
    },
    [finalSystemPrompt, persistSessions, reasoningEnabled, reasoningEffort, sessionId]
  )

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim()
      if (!text || isLoading || !sessionId || sendingLockRef.current) return
      if (text.length > MAX_MESSAGE_LENGTH) {
        setSendError({
          kind: 'validation',
          message: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
        })
        return
      }
      if (messages.length >= MAX_MESSAGES) {
        setSendError({
          kind: 'validation',
          message: 'This practice session has reached its message limit. Reset to begin a new session.',
        })
        return
      }

      const userMessage: PracticeMessage = {
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInput('')
      await requestAssistantReply(updatedMessages)
    },
    [input, isLoading, messages, requestAssistantReply, sessionId]
  )

  const retryLast = useCallback(async () => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'user' || isLoading) {
      setSendError(null)
      return
    }
    await requestAssistantReply(messages)
  }, [isLoading, messages, requestAssistantReply])

  const resetSession = useCallback(async () => {
    if (persistSessions && sessionId) {
      const supabase = createClient()
      await supabase
        .from('ai_client_sessions')
        .update({
          is_active: false,
        })
        .eq('id', sessionId)
    }

    setInput('')
    setSendError(null)
    setResetOpen(false)

    setSessionLoading(true)
    const supabase = createClient()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        startLocalSession()
        return
      }

      const { data: newSession, error } = await supabase
        .from('ai_client_sessions')
        .insert({
          user_id: user.id,
          case_study_id: caseStudyId || null,
          client_name: persona.name,
          system_prompt: finalSystemPrompt,
          conversation_history: [],
        })
        .select()
        .single()

      if (error) {
        if (isMissingRelationError(error)) {
          startLocalSession()
          return
        }
        throw error
      }

      setPersistSessions(true)
      setSessionId(newSession.id)
      setMessages([])
      setSessionLoading(false)
    } catch (error) {
      console.warn('Reset fell back to local session:', getErrorMessage(error))
      startLocalSession()
    }
  }, [caseStudyId, finalSystemPrompt, persona.name, persistSessions, sessionId, startLocalSession])

  const requestPersonaChange = (next: PersonaKey) => {
    if (next === personaKey) return
    if (messages.length > 0 || isLoading) {
      setPendingPersona(next)
      return
    }
    setPersonaKey(next)
    setInput('')
    setSendError(null)
  }

  const confirmPersonaSwitch = () => {
    if (!pendingPersona) return
    setPersonaKey(pendingPersona)
    setPendingPersona(null)
    setInput('')
    setSendError(null)
  }

  const beginSession = (prompt?: string) => {
    if (prompt) {
      void sendMessage(prompt)
      return
    }
    requestAnimationFrame(() => {
      document.getElementById('practice-composer')?.focus()
    })
  }

  const insertPrompt = (prompt: string) => {
    setInput(prompt)
    requestAnimationFrame(() => {
      document.getElementById('practice-composer')?.focus()
    })
  }

  const dialogMode = pendingPersona ? 'switch' : 'reset'
  const dialogOpen = resetOpen || Boolean(pendingPersona)

  return (
    <div
      className={cn(
        'practice-workspace flex min-h-0 flex-1 flex-col overflow-hidden bg-[color-mix(in_srgb,var(--canvas)_88%,var(--surface-muted))]',
        'dark:bg-background'
      )}
    >
      <PracticeToolbar
        persona={persona}
        personaKey={personaKey}
        status={sessionStatus}
        onPersonaSelect={requestPersonaChange}
        onOpenGuide={() => setGuideOpen(true)}
        onReset={() => setResetOpen(true)}
        disabled={isLoading || sessionLoading}
      />

      <section
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        aria-label="Simulated client conversation workspace"
      >
        {sessionLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            Preparing your practice session…
          </div>
        ) : messages.length === 0 && !isLoading ? (
          <EmptySessionState
            persona={persona}
            onBegin={beginSession}
            onInsertPrompt={insertPrompt}
            disabled={isLoading || !sessionId}
          />
        ) : (
          <MessageList
            messages={messages}
            persona={persona}
            isTyping={isLoading}
            endRef={messagesEndRef}
            reducedMotion={reducedMotion}
          />
        )}

        {sendError ? (
          <div
            className="mx-auto mb-2 w-full max-w-[52rem] px-3 sm:px-6"
            role="alert"
          >
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p>{sendError.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 border-destructive/30"
                  onClick={() => void retryLast()}
                >
                  Try again
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {!sessionLoading ? (
          <MessageComposer
            value={input}
            onChange={setInput}
            onSend={() => void sendMessage()}
            disabled={!sessionId || messages.length >= MAX_MESSAGES}
            sending={isLoading}
            personaName={persona.name}
            reasoningEffort={reasoningEffort}
            onReasoningChange={setReasoningEffort}
            reasoningEnabled={reasoningEnabled}
            onOpenPersonaPicker={() => setPersonaPickerOpen(true)}
            onOpenGuide={() => setGuideOpen(true)}
            onOpenScenario={() => setScenarioOpen(true)}
            onReset={() => setResetOpen(true)}
          />
        ) : null}
      </section>

      <Sheet
        open={guideOpen}
        onOpenChange={setGuideOpen}
        direction={isWide ? 'right' : 'bottom'}
      >
        <SheetContent side={isWide ? 'right' : 'bottom'}>
          <SheetHeader>
            <SheetTitle>Session guide</SheetTitle>
            <SheetDescription>Scenario context and skills for this practice session.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <GuidancePanel
              persona={persona}
              status={sessionStatus}
              messageCount={messages.length}
              maxMessages={MAX_MESSAGES}
            />
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Dialog open={scenarioOpen} onOpenChange={setScenarioOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {persona.name} · {persona.shortLabel}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>{persona.scenario}</p>
                <p>{persona.description}</p>
                <p className="text-xs">{persona.ageLabel}</p>
                <p>
                  <span className="font-medium text-foreground">Skills: </span>
                  {persona.focus.join(' · ')}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Sheet open={personaPickerOpen} onOpenChange={setPersonaPickerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Change simulated client</SheetTitle>
            <SheetDescription>
              Active conversations may be replaced when you switch clients.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <PersonaSelector
              activeKey={personaKey}
              onSelect={(key) => {
                setPersonaPickerOpen(false)
                requestPersonaChange(key)
              }}
              disabled={isLoading || sessionLoading}
              variant="list"
            />
          </SheetBody>
        </SheetContent>
      </Sheet>

      <ResetSessionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setResetOpen(false)
            setPendingPersona(null)
          }
        }}
        personaName={persona.name}
        nextPersonaName={pendingPersona ? resolvePersona(pendingPersona).name : undefined}
        mode={dialogMode}
        onConfirm={() => {
          if (pendingPersona) confirmPersonaSwitch()
          else void resetSession()
        }}
      />
    </div>
  )
}
