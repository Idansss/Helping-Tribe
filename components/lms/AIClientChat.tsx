'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Send, User, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIClientChatProps {
  caseStudyId?: string
  clientName?: string
  systemPrompt?: string
}

const DEFAULT_CLIENTS = {
  chika: {
    name: 'Chika',
    description: 'A 16-year-old student who is withdrawn and struggling',
    systemPrompt: 'You are Chika, a 16-year-old student. You are sad, withdrawn, and your grades are dropping. You cry in class sometimes. You are hiding your feelings and only open up if the user shows genuine empathy and active listening. Keep responses short (1-2 sentences). Be guarded at first, but gradually open up if the helper is supportive.',
  },
  amina: {
    name: 'Amina',
    description: 'A 34-year-old mother dealing with grief',
    systemPrompt: 'You are Amina, a 34-year-old mother who lost her husband. You are struggling financially and feel pressured to "be strong" for your children. You cry before your children sometimes. You need emotional support but feel guilty about your grief. Keep responses authentic and emotional (2-3 sentences).',
  },
  tunde: {
    name: 'Tunde',
    description: 'A 22-year-old facing disability stigma',
    systemPrompt: 'You are Tunde, a 22-year-old person with a disability. You face discrimination in employment and pity from your community. You are resilient but frustrated. You want to be seen for your abilities, not your disability. Keep responses thoughtful and sometimes defensive (2-3 sentences).',
  },
}

export function AIClientChat({ caseStudyId, clientName, systemPrompt }: AIClientChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const selectedClient = clientName
    ? DEFAULT_CLIENTS[clientName.toLowerCase() as keyof typeof DEFAULT_CLIENTS]
    : DEFAULT_CLIENTS.chika

  const finalSystemPrompt = systemPrompt || selectedClient.systemPrompt

  useEffect(() => {
    loadOrCreateSession()
  }, [caseStudyId, clientName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadOrCreateSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try to find existing active session
      const { data: existing } = await supabase
        .from('ai_client_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('client_name', selectedClient.name)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing) {
        setSessionId(existing.id)
        setMessages(existing.conversation_history as Message[] || [])
      } else {
        // Create new session
        const { data: newSession, error } = await supabase
          .from('ai_client_sessions')
          .insert({
            user_id: user.id,
            case_study_id: caseStudyId || null,
            client_name: selectedClient.name,
            system_prompt: finalSystemPrompt,
            conversation_history: [],
          })
          .select()
          .single()

        if (error) throw error
        setSessionId(newSession.id)
      }
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Call OpenAI API (you'll need to set up an API route)
      const response = await fetch('/api/ai-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: finalSystemPrompt,
        }),
      })

      if (!response.ok) throw new Error('API call failed')

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]

      // Update session in database
      await supabase
        .from('ai_client_sessions')
        .update({
          conversation_history: finalMessages.map(m => ({ role: m.role, content: m.content })),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', sessionId)

      setMessages(finalMessages)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to get response. Please check your OpenAI API key configuration.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetSession = async () => {
    if (!sessionId) return

    await supabase
      .from('ai_client_sessions')
      .update({
        is_active: false,
      })
      .eq('id', sessionId)

    setMessages([])
    setSessionId(null)
    loadOrCreateSession()
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Practice with {selectedClient.name}
            </CardTitle>
            <CardDescription>{selectedClient.description}</CardDescription>
          </div>
          <Button onClick={resetSession} variant="ghost" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start the conversation. Practice active listening and empathy.</p>
              <p className="text-sm mt-2">
                Remember: {selectedClient.name} will only open up if you show genuine care.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type your response... (Practice active listening)"
            className="min-h-[80px]"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[80px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
