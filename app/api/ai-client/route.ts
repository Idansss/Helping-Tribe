import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

// OpenAI import - will be handled at runtime
// If package is not installed, the route will return an error

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000
const MAX_SYSTEM_PROMPT_LENGTH = 1000

const AiClientRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string().max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
  systemPrompt: z.string().max(MAX_SYSTEM_PROMPT_LENGTH).optional(),
})

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
    let OpenAI: typeof import('openai').default
    try {
      const openaiModule = await import('openai')
      OpenAI = openaiModule.default || openaiModule
    } catch (e) {
      return NextResponse.json(
        { error: 'OpenAI package not installed. Run: npm install openai' },
        { status: 500 }
      )
    }

    let parsed
    try {
      const body = await request.json()
      parsed = AiClientRequestSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid AI client payload' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { messages, systemPrompt } = parsed

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
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
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
