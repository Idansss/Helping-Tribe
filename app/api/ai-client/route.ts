import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

// OpenAI import - will be handled at runtime
// If package is not installed, the route will return an error

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000
const MAX_SYSTEM_PROMPT_LENGTH = 1000

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate-limit AI calls: 20 requests per user per hour (cost + DoS protection)
  const ip = getRequestIp(request.headers)
  const limit = checkRateLimit({
    key: `ai-client:${user.id}:${ip}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many AI requests. Please wait before sending more messages.' },
      { status: 429 }
    )
  }

  try {
    // Dynamic import to avoid build-time errors
    let OpenAI: any
    try {
      // @ts-ignore - Optional dependency
      const openaiModule = await import('openai')
      OpenAI = openaiModule.default || openaiModule
    } catch (e) {
      return NextResponse.json(
        { error: 'OpenAI package not installed. Run: npm install openai' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { messages, systemPrompt } = body

    // Input validation — prevent prompt injection and DoS
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages must be a non-empty array' }, { status: 400 })
    }
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: `Too many messages (max ${MAX_MESSAGES})` }, { status: 400 })
    }
    for (const m of messages) {
      if (typeof m?.content !== 'string' || m.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          { error: `Each message content must be a string under ${MAX_MESSAGE_LENGTH} characters` },
          { status: 400 }
        )
      }
    }
    if (systemPrompt && (typeof systemPrompt !== 'string' || systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH)) {
      return NextResponse.json(
        { error: `systemPrompt must be a string under ${MAX_SYSTEM_PROMPT_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use cheaper model for practice
      messages: openaiMessages,
      temperature: 0.8,
      max_tokens: 150, // Keep responses short
    })

    const response = completion.choices[0]?.message?.content || 'I understand.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
